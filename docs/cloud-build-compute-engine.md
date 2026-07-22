# GCP CI/CD: GitHub ? Cloud Build ? Artifact Registry ? Compute Engine

## Pipeline flow

```text
Developer ? VS Code ? git push ? GitHub repository ? Cloud Build trigger
  +- checkout source
  +- install/runtime verification and tests
  +- optional SonarQube scan
  +- Trivy filesystem security scan
  +- build Docker image
  +- push image to Artifact Registry
  +- SSH to Compute Engine VM
  +- pull the image
  +- stop and remove previous container
  +- run the new container
  +- health check
       ?
TasteBite running on Compute Engine
```

The exact steps are in `cloudbuild.yaml`. The VM startup script creates Docker, Nginx, and `/opt/tastebite/deploy-container.sh`; the Cloud Build deployment step calls that script.

## One-time GCP setup

Use a US free-tier-eligible zone such as `us-central1-a` and set the variables below in Cloud Shell:

```bash
PROJECT_ID=YOUR_PROJECT_ID
REGION=us-central1
ZONE=us-central1-a
VM_NAME=tastebite-vm
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
gcloud config set project "$PROJECT_ID"
gcloud services enable cloudbuild.googleapis.com artifactregistry.googleapis.com compute.googleapis.com
```

Create the Docker repository:

```bash
gcloud artifacts repositories create tastebite \
  --repository-format=docker --location="$REGION" \
  --description='TasteBite application images'
```

Create a dedicated VM identity that can pull images, then create the e2-micro VM:

```bash
gcloud iam service-accounts create tastebite-vm --display-name='TasteBite VM'
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:tastebite-vm@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role='roles/artifactregistry.reader'

gcloud compute instances create "$VM_NAME" \
  --zone="$ZONE" --machine-type=e2-micro \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=30GB --tags=tastebite-http \
  --service-account="tastebite-vm@${PROJECT_ID}.iam.gserviceaccount.com" \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --metadata-from-file=startup-script=ops/startup.sh

gcloud compute firewall-rules create allow-tastebite-http \
  --allow=tcp:80 --target-tags=tastebite-http
```

## Allow Cloud Build to push and deploy

```bash
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
for ROLE in roles/artifactregistry.writer roles/compute.instanceAdmin.v1 roles/compute.osAdminLogin; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${CLOUDBUILD_SA}" --role="$ROLE"
done
```

If your project uses a custom Cloud Build service account, grant these roles to that identity instead and configure it on the trigger.

## Create the GitHub trigger

1. In Google Cloud Console, open **Cloud Build ? Triggers ? Create trigger**.
2. Connect the GitHub repository containing this code.
3. Event: **Push to a branch**; branch: `^main$`.
4. Configuration: **Cloud Build configuration file**; path: `cloudbuild.yaml`.
5. In substitutions, set `_REGION`, `_REPOSITORY`, `_VM_NAME`, and `_VM_ZONE` if you chose different values.
6. Create the trigger and push to `main`.

The trigger runs the entire pipeline. View logs in **Cloud Build ? History**. On success, visit the VM external IP over HTTP.

## Verify and troubleshoot

```bash
gcloud compute ssh "$VM_NAME" --zone="$ZONE" --command='sudo docker ps; curl -f http://127.0.0.1:8000/health'
gcloud compute ssh "$VM_NAME" --zone="$ZONE" --command='sudo docker logs tastebite --tail=100'
```

For production, add a reserved external IP, domain name, HTTPS certificate, Cloud SQL/Firestore for data, Secret Manager for configuration, and restrict SSH through IAP.