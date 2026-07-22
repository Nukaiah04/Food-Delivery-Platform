# TasteBite Food Delivery

A full-stack food delivery starter with a separate login/register page, menu catalogue, categories, prices, cart, checkout, and authenticated order API.

## Run locally

```powershell
npm start
```

Open http://localhost:8000. Demo sign-in: `demo@tastebite.in` / `welcome123`.

## Deploy to Google Cloud Run

1. Create/select a Google Cloud project and install the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2. From this folder, authenticate and set your project:

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

3. Deploy directly from source (Cloud Build uses the included `Dockerfile`):

```powershell
gcloud run deploy tastebite --source . --region asia-south1 --allow-unauthenticated --set-env-vars APP_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

Cloud Run prints the public URL after deployment. For a real production system, move users and orders to Cloud SQL/Firestore, store secrets in Secret Manager, and use Google Identity Platform or a robust password-hashing library.
