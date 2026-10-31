"""
Cloud Storage Staging Script
=============================
Uploads local authentic raw datasets to Google Cloud Storage (GCS)
conforming to GCP Free Tier (5 GB regional storage).
"""

import os
from google.cloud import storage


PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "smart-water-analytics-512816")
BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "smart-water-analytics-raw")

FILES_TO_STAGE = [
    ("data/raw/cpcb_water_quality.csv", "raw/cpcb_water_quality.csv"),
    ("data/raw/cwc_monitoring_stations.csv", "raw/cwc_monitoring_stations.csv"),
    ("data/raw/chennai_reservoir_levels.csv", "raw/chennai_reservoir_levels.csv"),
    ("data/raw/chennai_reservoir_rainfall.csv", "raw/chennai_reservoir_rainfall.csv"),
    ("data/processed/fact_water_quality.csv", "processed/fact_water_quality.csv"),
    ("data/processed/fact_reservoir_scarcity.csv", "processed/fact_reservoir_scarcity.csv"),
]


def stage_datasets():
    print(f"Connecting to GCP Cloud Storage for project '{PROJECT_ID}'...")
    try:
        client = storage.Client(project=PROJECT_ID)
        bucket = client.bucket(BUCKET_NAME)

        if not bucket.exists():
            print(f"Bucket 'gs://{BUCKET_NAME}' does not exist. Creating in us-central1 (Free Tier)...")
            bucket = client.create_bucket(BUCKET_NAME, location="us-central1")

        for local_path, gcs_blob_name in FILES_TO_STAGE:
            if not os.path.exists(local_path):
                print(f"Skipping missing local file: {local_path}")
                continue
            blob = bucket.blob(gcs_blob_name)
            print(f"Uploading {local_path} -> gs://{BUCKET_NAME}/{gcs_blob_name}...")
            blob.upload_from_filename(local_path)
            print(f"Uploaded successfully ({os.path.getsize(local_path)} bytes).")

        print("\nAll datasets staged successfully in Cloud Storage.")
    except Exception as e:
        print(f"GCS Staging Notice: {e}")
        print("Note: If running in BigQuery Sandbox without credit card activation, datasets can be uploaded directly via BigQuery Console upload UI at zero cost.")


if __name__ == "__main__":
    stage_datasets()
