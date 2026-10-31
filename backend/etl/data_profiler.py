"""
Data Profiling & Pre-Ingestion Validation Module
================================================
Inspects raw hydrological datasets (CPCB Water Quality, CWC Stations, Chennai Reservoir Levels/Rainfall),
checks schemas, missing value percentages, sensor boundaries, and generates structured profiles.
"""

import json
import os
from datetime import datetime
import numpy as np
import pandas as pd


def profile_cpcb_water_quality(filepath: str) -> dict:
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    df = pd.read_csv(filepath, encoding="latin1")
    total_records = len(df)

    # Clean numeric representations to evaluate real missingness
    numeric_cols = [
        "Temp",
        "D.O. (mg/l)",
        "PH",
        "CONDUCTIVITY (mhos/cm)",
        "B.O.D. (mg/l)",
        "NITRATENAN N+ NITRITENANN (mg/l)",
        "FECAL COLIFORM (MPN/100ml)",
        "TOTAL COLIFORM (MPN/100ml)Mean",
    ]

    col_stats = {}
    for col in df.columns:
        series_str = df[col].astype(str).str.strip()
        nan_mask = series_str.isin(["NAN", "nan", "NaN", ""]) | df[col].isna()
        nan_count = int(nan_mask.sum())
        nan_pct = round((nan_count / total_records) * 100, 2)

        stat_entry = {
            "total_count": total_records,
            "missing_count": nan_count,
            "missing_pct": nan_pct,
            "unique_values": int(df[col].nunique()),
        }

        if col in numeric_cols:
            clean_num = pd.to_numeric(series_str.replace(["NAN", "nan", "NaN", ""], np.nan), errors="coerce")
            valid = clean_num.dropna()
            if len(valid) > 0:
                stat_entry["min"] = float(valid.min())
                stat_entry["max"] = float(valid.max())
                stat_entry["mean"] = round(float(valid.mean()), 2)
                stat_entry["median"] = round(float(valid.median()), 2)
                stat_entry["std"] = round(float(valid.std()), 2)
        col_stats[col] = stat_entry

    return {
        "dataset_name": "CPCB Indian Water Quality",
        "source": "Central Pollution Control Board (NWMP)",
        "records_count": total_records,
        "columns_count": len(df.columns),
        "year_range": [int(df["year"].min()), int(df["year"].max())],
        "unique_states": int(df["STATE"].dropna().nunique()),
        "columns": col_stats,
    }


def profile_cwc_stations(filepath: str) -> dict:
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    df = pd.read_csv(filepath)
    total_records = len(df)

    col_stats = {}
    for col in df.columns:
        nan_count = int(df[col].isna().sum())
        nan_pct = round((nan_count / total_records) * 100, 2)
        stat = {
            "missing_count": nan_count,
            "missing_pct": nan_pct,
            "unique_values": int(df[col].nunique()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            valid = df[col].dropna()
            if len(valid) > 0:
                stat["min"] = float(valid.min())
                stat["max"] = float(valid.max())
                stat["mean"] = round(float(valid.mean()), 2)
        col_stats[col] = stat

    type_counts = df["type"].value_counts().to_dict()
    return {
        "dataset_name": "CWC Monitoring Stations & Dams",
        "source": "Central Water Commission, Ministry of Jal Shakti",
        "records_count": total_records,
        "station_types": type_counts,
        "dams_with_frl_count": int(df["frl"].dropna().count()),
        "columns": col_stats,
    }


def profile_chennai_reservoirs(levels_path: str, rainfall_path: str) -> dict:
    if not os.path.exists(levels_path) or not os.path.exists(rainfall_path):
        raise FileNotFoundError("Reservoir files missing")

    df_levels = pd.read_csv(levels_path)
    df_rain = pd.read_csv(rainfall_path)

    total_records = len(df_levels)
    capacities = {"POONDI": 3231.0, "CHOLAVARAM": 881.0, "REDHILLS": 3300.0, "CHEMBARAMBAKKAM": 3645.0}
    total_capacity = sum(capacities.values())

    df_levels["total_storage_mcft"] = (
        df_levels["POONDI"] + df_levels["CHOLAVARAM"] + df_levels["REDHILLS"] + df_levels["CHEMBARAMBAKKAM"]
    )
    df_levels["storage_pct"] = (df_levels["total_storage_mcft"] / total_capacity) * 100.0

    df_rain["total_rainfall_mm"] = (
        df_rain["POONDI"] + df_rain["CHOLAVARAM"] + df_rain["REDHILLS"] + df_rain["CHEMBARAMBAKKAM"]
    ) / 4.0

    return {
        "dataset_name": "Chennai Reservoir Storage and Rainfall Historical Records",
        "source": "CMWSSB / Central Water Commission",
        "records_count": total_records,
        "start_date": str(df_levels["Date"].iloc[0]),
        "end_date": str(df_levels["Date"].iloc[-1]),
        "total_conservation_capacity_mcft": total_capacity,
        "storage_statistics": {
            "min_storage_mcft": float(df_levels["total_storage_mcft"].min()),
            "max_storage_mcft": float(df_levels["total_storage_mcft"].max()),
            "mean_storage_mcft": round(float(df_levels["total_storage_mcft"].mean()), 2),
            "median_storage_mcft": round(float(df_levels["total_storage_mcft"].median()), 2),
            "min_storage_pct": round(float(df_levels["storage_pct"].min()), 3),
            "max_storage_pct": round(float(df_levels["storage_pct"].max()), 2),
            "mean_storage_pct": round(float(df_levels["storage_pct"].mean()), 2),
        },
        "critical_drought_days_under_10pct": int((df_levels["storage_pct"] < 10.0).sum()),
        "critical_drought_pct_of_time": round(float((df_levels["storage_pct"] < 10.0).mean() * 100.0), 2),
        "rainfall_statistics": {
            "max_daily_catchment_rain_mm": round(float(df_rain["total_rainfall_mm"].max()), 2),
            "mean_daily_catchment_rain_mm": round(float(df_rain["total_rainfall_mm"].mean()), 2),
            "annual_rainy_days_avg": round(float((df_rain["total_rainfall_mm"] > 1.0).sum() / (total_records / 365.25)), 1),
        },
    }


def generate_full_profile(output_path: str = "data/data_profile.json") -> dict:
    profile = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "cpcb_water_quality": profile_cpcb_water_quality("data/raw/cpcb_water_quality.csv"),
        "cwc_stations": profile_cwc_stations("data/raw/cwc_monitoring_stations.csv"),
        "reservoir_scarcity": profile_chennai_reservoirs(
            "data/raw/chennai_reservoir_levels.csv", "data/raw/chennai_reservoir_rainfall.csv"
        ),
    }

    with open(output_path, "w") as f:
        json.dump(profile, f, indent=2)

    print(f"Data profile successfully generated and written to {output_path}")
    return profile


if __name__ == "__main__":
    generate_full_profile()
