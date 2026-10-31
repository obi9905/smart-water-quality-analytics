#!/usr/bin/env bash
# ==============================================================================
# Cloud Run & BigQuery Deployment Script (GCP)
# Project ID: smart-water-analytics-512816
# IMPORTANT: Review budget and billing status before executing billable commands.
# ==============================================================================

set -euo pipefail

PROJECT_ID="smart-water-analytics-512816"
REGION="us-central1"
SERVICE_NAME="smart-water-analytics-service"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "========================================================"
echo " Deploying Smart Water Analytics to Google Cloud Run"
echo " Project: ${PROJECT_ID} | Region: ${REGION}"
echo "========================================================"

# 1. Set default project
gcloud config set project "${PROJECT_ID}"

# 2. Deploy BigQuery Tables (Zero-cost Sandbox compliant)
echo "Executing BigQuery SQL schema initialization..."
bq query --use_legacy_sql=false < sql/01_create_tables.sql

# 3. Build container image using Cloud Build (Requires billing enabled)
# If running in free sandbox without billing, use local Docker container instead.
read -p "Do you have billing enabled and wish to build on Cloud Build? (y/N): " confirm
if [[ "${confirm}" =~ ^[Yy]$ ]]; then
    echo "Submitting build to Google Cloud Build..."
    gcloud builds submit --tag "${IMAGE_NAME}" .

    echo "Deploying container to Google Cloud Run (Always Free 2M requests/mo tier)..."
    gcloud run deploy "${SERVICE_NAME}" \
        --image "${IMAGE_NAME}" \
        --platform managed \
        --region "${REGION}" \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},BIGQUERY_DATASET=smart_water_analytics"

    SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')
    echo "Deployment successful! Service URL: ${SERVICE_URL}"
else
    echo "Skipping Cloud Build to enforce ₹0 budget constraint."
    echo "Run locally using: docker-compose up --build"
fi
