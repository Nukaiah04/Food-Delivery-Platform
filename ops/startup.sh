#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl nginx docker.io
systemctl enable --now docker nginx
install -d -o root -g root -m 0755 /opt/tastebite /etc/tastebite
if [ ! -f /etc/tastebite/tastebite.env ]; then
  printf 'APP_SECRET=%s\n' "$(openssl rand -hex 32)" > /etc/tastebite/tastebite.env
  chmod 600 /etc/tastebite/tastebite.env
fi
cat >/opt/tastebite/deploy-container.sh <<'DEPLOY'
#!/usr/bin/env bash
set -euo pipefail
IMAGE="${1:?Image name is required}"
REGISTRY="$(echo "$IMAGE" | cut -d/ -f1)"
TOKEN="$(curl -fsS -H 'Metadata-Flavor: Google' 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token' | sed -n 's/.*"access_token"[ ]*:[ ]*"\([^"]*\)".*/\1/p')"
echo "$TOKEN" | docker login -u oauth2accesstoken --password-stdin "https://${REGISTRY}"
docker pull "$IMAGE"
docker stop tastebite 2>/dev/null || true
docker rm tastebite 2>/dev/null || true
set -a
source /etc/tastebite/tastebite.env
set +a
docker run -d --name tastebite --restart unless-stopped \
  -p 127.0.0.1:8000:8000 \
  -e PORT=8000 -e APP_SECRET="$APP_SECRET" \
  "$IMAGE"
for attempt in $(seq 1 15); do
  curl --fail http://127.0.0.1:8000/health && exit 0
  sleep 2
done
exit 1
DEPLOY
chmod 0755 /opt/tastebite/deploy-container.sh
cat >/etc/nginx/sites-available/tastebite <<'NGINX'
server {
  listen 80 default_server;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/tastebite /etc/nginx/sites-enabled/tastebite
nginx -t
systemctl restart nginx