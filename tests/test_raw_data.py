"""
Unit Tests for Raw Datasets and Schema Integrity (Stage 2)
===========================================================
Validates that the authentic datasets exist, have expected schemas, record counts,
non-empty entries, and valid numerical ranges.
"""

import json
import os
import unittest
import pandas as pd


class TestRawDataIntegrity(unittest.TestCase):

    def setUp(self):
        self.cpcb_path = "data/raw/cpcb_water_quality.csv"
        self.cwc_path = "data/raw/cwc_monitoring_stations.csv"
        self.levels_path = "data/raw/chennai_reservoir_levels.csv"
        self.rain_path = "data/raw/chennai_reservoir_rainfall.csv"
        self.profile_path = "data/data_profile.json"

    def test_raw_files_exist(self):
        """Verify that all four required raw datasets have been acquired."""
        for path in [self.cpcb_path, self.cwc_path, self.levels_path, self.rain_path]:
            self.assertTrue(os.path.exists(path), f"Missing required raw file: {path}")
            self.assertGreater(os.path.getsize(path), 1000, f"File {path} is suspiciously small or empty")

    def test_cpcb_water_quality_schema(self):
        """Verify CPCB water quality columns and expected minimum record counts."""
        df = pd.read_csv(self.cpcb_path, encoding="latin1")
        expected_cols = [
            "STATION CODE", "LOCATIONS", "STATE", "Temp", "D.O. (mg/l)",
            "PH", "CONDUCTIVITY (mhos/cm)", "B.O.D. (mg/l)",
            "NITRATENAN N+ NITRITENANN (mg/l)", "FECAL COLIFORM (MPN/100ml)",
            "TOTAL COLIFORM (MPN/100ml)Mean", "year"
        ]
        self.assertGreaterEqual(len(df), 1900, "CPCB dataset has fewer records than expected")
        for col in ["STATION CODE", "PH", "D.O. (mg/l)", "year"]:
            self.assertIn(col, df.columns, f"Expected column {col} missing from CPCB dataset")

    def test_cwc_stations_schema(self):
        """Verify CWC monitoring stations schema, coordinates, and dam classifications."""
        df = pd.read_csv(self.cwc_path)
        required_cols = ["station_code", "name", "lat", "lon", "type"]
        for col in required_cols:
            self.assertIn(col, df.columns, f"Expected column {col} missing from CWC stations")

        self.assertGreaterEqual(len(df), 1700, "CWC stations count is below expected 1,700")
        inflow_dams = df[df["type"] == "Inflow"]
        self.assertGreaterEqual(len(inflow_dams), 140, "Expected at least 140 dam/inflow monitoring sites")

    def test_reservoir_levels_and_rainfall_alignment(self):
        """Verify that Chennai reservoir levels and rainfall datasets align chronologically with zero nulls."""
        df_levels = pd.read_csv(self.levels_path)
        df_rain = pd.read_csv(self.rain_path)

        self.assertEqual(len(df_levels), len(df_rain), "Levels and rainfall record counts do not match")
        self.assertGreaterEqual(len(df_levels), 5700, "Fewer daily observations than expected")

        reservoirs = ["POONDI", "CHOLAVARAM", "REDHILLS", "CHEMBARAMBAKKAM"]
        for res in reservoirs:
            self.assertIn(res, df_levels.columns)
            self.assertIn(res, df_rain.columns)
            self.assertEqual(df_levels[res].isna().sum(), 0, f"Found nulls in levels for {res}")
            self.assertEqual(df_rain[res].isna().sum(), 0, f"Found nulls in rainfall for {res}")
            self.assertGreaterEqual(df_levels[res].min(), 0.0, f"Negative water storage in {res}")
            self.assertGreaterEqual(df_rain[res].min(), 0.0, f"Negative rainfall in {res}")

    def test_data_profile_json_generated(self):
        """Verify that automated data profiling JSON exists and has valid metrics."""
        self.assertTrue(os.path.exists(self.profile_path), "data_profile.json was not generated")
        with open(self.profile_path) as f:
            profile = json.load(f)

        self.assertIn("cpcb_water_quality", profile)
        self.assertIn("cwc_stations", profile)
        self.assertIn("reservoir_scarcity", profile)
        self.assertEqual(profile["reservoir_scarcity"]["total_conservation_capacity_mcft"], 11057.0)


if __name__ == "__main__":
    unittest.main()
