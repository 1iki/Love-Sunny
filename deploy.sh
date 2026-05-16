#!/bin/bash

# Exit on any error
set -e

SERVICE_NAME="love-sunny"
REGION="asia-southeast2"

echo "==============================================="
echo "  Deploying Love Sunny to Google Cloud Run "
echo "==============================================="

# Prompt for secrets
read -p "Enter your MONGODB_URI: " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo "Error: MONGODB_URI is required."
    exit 1
fi

read -p "Enter your JWT_SECRET: " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    echo "Error: JWT_SECRET is required."
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
echo "Using Project ID: $PROJECT_ID"

# Step 1: Discover or create URL
echo "Checking if service $SERVICE_NAME exists in $REGION..."
if gcloud run services describe "$SERVICE_NAME" --region "$REGION" >/dev/null 2>&1; then
    BASE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)")
    echo "Found existing service URL: $BASE_URL"
else
    echo "Service does not exist yet. Creating a temporary dummy deployment to reserve the URL..."
    # Deploy a dummy image to capture URL
    gcloud run deploy "$SERVICE_NAME" \
        --image="us-docker.pkg.dev/cloudrun/container/hello" \
        --region="$REGION" \
        --allow-unauthenticated \
        --quiet
    
    BASE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)")
    echo "Reserved base URL: $BASE_URL"
fi

IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Step 2: Build with Cloud Build and inject argument
# Use --build-arg via gcloud builds locally or using google cloud build natively (using google cloud build natively doesn't support --build-arg directly using standard flags, we must instruct cloud build or use a generic docker build and push approach)
# A more robust way: Use docker directly and then push, or pass build args. Wait, `gcloud builds submit` doesn't directly support --build-arg unless you pass it to docker using specific configuration or you can just use pack/buildpacks or local docker build.
# Wait, actually gcloud builds submit doesn't take --build-arg. We should write a cloudbuild.yaml or we can just run `gcloud builds submit` and rely on a dummy substitution or use a local docker build.

# Let's do a local docker build and gcloud run deploy image because we are in a custom script
echo "Building the Docker image with NEXT_PUBLIC_BASE_URL=$BASE_URL..."

# Note: gcloud builds submit doesn't support --build-arg natively.
# We will use Docker to build it locally and then push. Wait, maybe the user wants Cloud Build?
# Let's write `gcloud builds submit --tag "$IMAGE_TAG" .` but how do we pass --build-arg?
# We can use `gcloud builds submit --config cloudbuild.yaml` OR we can just use `docker build`.
# Let's stick with gcloud builds submit and generate a temporary cloudbuild.yaml for it.

cat <<EOF > cloudbuild-temp.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', '$IMAGE_TAG', '--build-arg', 'NEXT_PUBLIC_BASE_URL=$BASE_URL', '.']
images:
- '$IMAGE_TAG'
EOF

gcloud builds submit --config cloudbuild-temp.yaml .

# Step 3: Real Deployment
echo "Deploying newly built image to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE_TAG" \
    --region="$REGION" \
    --update-env-vars="MONGODB_URI=\$MONGODB_URI,JWT_SECRET=\$JWT_SECRET" \
    --allow-unauthenticated \
    --quiet

rm cloudbuild-temp.yaml

echo "Deployment complete! Your app is live at $BASE_URL"
