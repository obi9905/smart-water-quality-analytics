"""
Integration & Unit Tests for Backend API and Prediction Pipeline
================================================================
Tests FastAPI endpoints, ML inference predictions, data consistency, and error handling.
"""

import unittest
from fastapi.testclient import TestClient
from backend.api.main import app


class TestAPIAndModels(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        """Verify health check returns GCP project and healthy status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["gcp_project_id"], "smart-water-analytics-512816")
        self.assertEqual(data["bigquery_dataset"], "smart_water_analytics")
        self.assertGreater(data["records_loaded"]["water_quality_records"], 1900)
        self.assertGreater(data["records_loaded"]["reservoir_daily_records"], 5700)

    def test_overview_kpis_endpoint(self):
        """Verify overview returns valid national KPIs and reservoir storage stats."""
        response = self.client.get("/api/overview")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        kpis = data["kpis"]
        self.assertIn("total_monitoring_stations", kpis)
        self.assertIn("national_avg_wqi", kpis)
        self.assertIn("current_reservoir_storage_mcft", kpis)
        self.assertGreater(kpis["national_avg_wqi"], 0)
        self.assertIn("wqi_distribution", data)
        self.assertIn("scarcity_risk_distribution", data)

    def test_water_quality_filtering(self):
        """Verify state and category filtering on water quality records."""
        response = self.client.get("/api/water-quality?limit=50")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertLessEqual(len(data["records"]), 50)
        self.assertGreater(len(data["available_states"]), 10)
        self.assertGreater(len(data["state_aggregates"]), 10)

        # Test state filter
        state_resp = self.client.get("/api/water-quality?state=GOA")
        self.assertEqual(state_resp.status_code, 200)
        state_data = state_resp.json()
        for rec in state_data["records"]:
            self.assertEqual(rec["state"], "GOA")

    def test_reservoir_trends_endpoint(self):
        """Verify reservoir time-series trend endpoint and downsampling."""
        response = self.client.get("/api/reservoir-trends?start_year=2015&end_year=2019&sample_rate_days=7")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("trends", data)
        self.assertGreater(len(data["trends"]), 50)
        first_point = data["trends"][0]
        self.assertIn("total_storage_mcft", first_point)
        self.assertIn("storage_percentage", first_point)
        self.assertIn("scarcity_risk_level", first_point)

    def test_ml_evaluation_endpoint(self):
        """Verify ML evaluation metrics match benchmarked expectations."""
        response = self.client.get("/api/ml-evaluation")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("classification", data)
        self.assertIn("regression", data)
        self.assertIn("RandomForest_Classifier", data["classification"]["models_comparison"])
        self.assertIn("BigQueryML_LinearRegression", data["regression"]["models_comparison"])

        # Check Random Forest accuracy is >= 90%
        rf_acc = data["classification"]["models_comparison"]["RandomForest_Classifier"]["accuracy"]
        self.assertGreaterEqual(rf_acc, 0.90)

    def test_predict_scarcity_critical_scenario(self):
        """Verify model accurately flags extreme drought scenario as Critical."""
        payload = {
            "current_storage_pct": 5.0,
            "days_of_water_left": 15.0,
            "rain_7d_sum_mm": 0.0,
            "storage_7d_delta_mcft": -200.0,
            "month": 6,
        }
        response = self.client.post("/api/predict-scarcity", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["predicted_risk_level"], "Critical")
        self.assertEqual(data["predicted_risk_score"], 3)
        self.assertLess(data["predicted_future_storage_pct_7d"], 10.0)
        self.assertIn("EMERGENCY", data["recommendation"])

    def test_predict_scarcity_safe_scenario(self):
        """Verify model accurately flags high-capacity scenario as Low risk."""
        payload = {
            "current_storage_pct": 85.0,
            "days_of_water_left": 300.0,
            "rain_7d_sum_mm": 50.0,
            "storage_7d_delta_mcft": 100.0,
            "month": 11,
        }
        response = self.client.post("/api/predict-scarcity", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["predicted_risk_level"], "Low")
        self.assertEqual(data["predicted_risk_score"], 0)
        self.assertGreater(data["predicted_future_storage_pct_7d"], 70.0)


if __name__ == "__main__":
    unittest.main()
