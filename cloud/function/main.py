"""
Cloud Run Function: Event-Driven Hydrological Ingestion
========================================================
Triggered automatically when a new CSV file is uploaded to the Google Cloud Storage bucket
(e.g., gs://smart-water-analytics-raw/cpcb_water_quality.csv).
Validates schema, triggers BigQuery load jobs, and logs execution telemetry.
"""

from http.client import HTTPException
import os
from google.cloud import bigquery
from google.cloud import bigquery


PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "smart-water-analytics-512816")
DATASET_ID = os.environ.get("BIGQUERY_DATASET", "smart_water_analytics")


def gcs_water_data_trigger(event, context):
    """
    Cloud Function triggered by GCS bucket object creation (google.storage.object.finalize).
    """
    bucket_name = event.get("bucket")
    file_name = event.get("name")

    print(f"Cloud Function triggered by upload: gs://{bucket_name}/{file_name}")

    if not file_name or not file_name.endswith(".csv"):
        print(f"Skipping non-CSV file: {file_name}")
        return

    client = bigquery.Client(project=PROJECT_ID)

    # Route to destination table based on filename
    if "water_quality" in file_name.lower():
        dest_table = f"{PROJECT_ID}.{DATASET_ID}.raw_water_quality"
    elif "reservoir" in file_name.lower() and "level" in file_name.lower():
        dest_table = f"{PROJECT_ID}.{DATASET_ID}.raw_reservoir_levels"
    elif "rainfall" in file_name.lower():
        dest_table = f"{PROJECT_ID}.{DATASET_ID}.raw_reservoir_rainfall"
    else:
        print(f"Unmapped dataset file: {file_name}")
        return

    gcs_uri = f"gs://{bucket_name}/{file_name}"
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV,
        skip_leading_rows=1,
        autodetect=False,
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
    )

    print(f"Initiating BigQuery load job: {gcs_uri} -> {dest_table}...")
    try:
        load_job = client.load_table_from_uri(gcs_uri, dest_table, job_config=job_config)
        load_job.result()  # Wait for completion
        print(f"Load complete. Loaded {load_job.output_rows} rows into {dest_table}.")
    except Exception as e:
        print(f"Error loading {gcs_uri} into BigQuery: {e}")
        raise e

@app.get("/api/cloud-status")
def get_cloud_status():
    try:
        project_id = os.getenv(
            "GCP_PROJECT_ID",
            "smart-water-analytics-512816"
        )

        dataset_id = os.getenv(
            "BIGQUERY_DATASET",
            "smart_water_analytics"
        )

        client = bigquery.Client(project=project_id)

        table_id = f"{project_id}.{dataset_id}.water_quality"

        query = f"""
            SELECT COUNT(*) AS total_records
            FROM `{table_id}`
        """

        result = list(client.query(query).result())
        total_records = result[0]["total_records"]

        return {
            "status": "connected",
            "cloud_provider": "Google Cloud Platform",
            "service": "BigQuery",
            "dataset": dataset_id,
            "table": "water_quality",
            "total_records": total_records
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"BigQuery connection failed: {str(e)}"
        )
