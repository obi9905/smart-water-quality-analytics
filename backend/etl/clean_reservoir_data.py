"""
Reservoir Storage & Water Scarcity ETL Pipeline
================================================
Transforms daily reservoir levels and catchment rainfall logs (2004-2019) into
analysis-ready fact tables and calculates water scarcity risk classifications.
"""

import os
import pandas as pd
import numpy as np


TOTAL_CONSERVATION_CAPACITY_MCFT = 11057.0  # Combined capacity of Poondi, Cholavaram, Redhills, Chembarambakkam
BENCHMARK_DAILY_CONSUMPTION_MCFT = 28.5      # Municipal supply draw (~800 MLD / 28.3 mcft/day)


def classify_scarcity_risk(row: pd.Series) -> tuple[str, int]:
    """
    Classifies scarcity risk based on storage capacity percentage and days of supply remaining.
    Returns (CategoryName, RiskScore [0-3]).
    """
    pct = row["storage_percentage"]
    days_left = row["days_of_supply_remaining"]

    # Critical / Day Zero Risk
    if pct < 10.0 or days_left < 40.0:
        return "Critical", 3
    # Severe Risk
    elif pct < 25.0 or days_left < 90.0:
        return "Severe", 2
    # Moderate Risk
    elif pct < 50.0 or days_left < 180.0:
        return "Moderate", 1
    # Low Risk (Safe)
    else:
        return "Low", 0


def get_monsoon_season(month: int) -> str:
    if month in [6, 7, 8, 9]:
        return "Southwest Monsoon"
    elif month in [10, 11, 12]:
        return "Northeast Monsoon"
    else:
        return "Dry Season"


def clean_reservoir_pipeline(
    levels_path: str = "data/raw/chennai_reservoir_levels.csv",
    rain_path: str = "data/raw/chennai_reservoir_rainfall.csv",
    output_csv: str = "data/processed/fact_reservoir_scarcity.csv",
    output_parquet: str = "data/processed/fact_reservoir_scarcity.parquet",
) -> pd.DataFrame:
    print(f"Loading reservoir data from {levels_path} and {rain_path}...")
    df_levels = pd.read_csv(levels_path)
    df_rain = pd.read_csv(rain_path)

    # Standardize dates
    df_levels["date"] = pd.to_datetime(df_levels["Date"], format="%d-%m-%Y")
    df_rain["date"] = pd.to_datetime(df_rain["Date"], format="%d-%m-%Y")

    # Merge on date
    df = pd.merge(
        df_levels[["date", "POONDI", "CHOLAVARAM", "REDHILLS", "CHEMBARAMBAKKAM"]],
        df_rain[["date", "POONDI", "CHOLAVARAM", "REDHILLS", "CHEMBARAMBAKKAM"]],
        on="date",
        suffixes=("_storage_mcft", "_rainfall_mm"),
    )

    df = df.sort_values("date").reset_index(drop=True)

    # Lowercase column names
    df = df.rename(columns={
        "POONDI_storage_mcft": "poondi_storage_mcft",
        "CHOLAVARAM_storage_mcft": "cholavaram_storage_mcft",
        "REDHILLS_storage_mcft": "redhills_storage_mcft",
        "CHEMBARAMBAKKAM_storage_mcft": "chembarambakkam_storage_mcft",
        "POONDI_rainfall_mm": "poondi_rainfall_mm",
        "CHOLAVARAM_rainfall_mm": "cholavaram_rainfall_mm",
        "REDHILLS_rainfall_mm": "redhills_rainfall_mm",
        "CHEMBARAMBAKKAM_rainfall_mm": "chembarambakkam_rainfall_mm",
    })

    # Total storage & capacity metrics
    df["total_storage_mcft"] = (
        df["poondi_storage_mcft"]
        + df["cholavaram_storage_mcft"]
        + df["redhills_storage_mcft"]
        + df["chembarambakkam_storage_mcft"]
    )
    df["total_capacity_mcft"] = TOTAL_CONSERVATION_CAPACITY_MCFT
    df["storage_percentage"] = (df["total_storage_mcft"] / TOTAL_CONSERVATION_CAPACITY_MCFT) * 100.0

    # Catchment average daily rainfall
    df["daily_rainfall_mm"] = (
        df["poondi_rainfall_mm"]
        + df["cholavaram_rainfall_mm"]
        + df["redhills_rainfall_mm"]
        + df["chembarambakkam_rainfall_mm"]
    ) / 4.0

    # Rolling rainfall aggregations
    df["rainfall_7d_avg_mm"] = df["daily_rainfall_mm"].rolling(window=7, min_periods=1).mean().round(2)
    df["rainfall_14d_avg_mm"] = df["daily_rainfall_mm"].rolling(window=14, min_periods=1).mean().round(2)
    df["rainfall_30d_avg_mm"] = df["daily_rainfall_mm"].rolling(window=30, min_periods=1).mean().round(2)
    df["rainfall_7d_sum_mm"] = df["daily_rainfall_mm"].rolling(window=7, min_periods=1).sum().round(2)
    df["rainfall_30d_sum_mm"] = df["daily_rainfall_mm"].rolling(window=30, min_periods=1).sum().round(2)

    # Rolling storage dynamics (inflow vs drawdown velocity)
    df["storage_7d_delta_mcft"] = (df["total_storage_mcft"] - df["total_storage_mcft"].shift(7)).fillna(0.0).round(2)
    df["storage_30d_delta_mcft"] = (df["total_storage_mcft"] - df["total_storage_mcft"].shift(30)).fillna(0.0).round(2)

    # Consumption & operational resilience
    df["estimated_daily_drawdown_mcft"] = BENCHMARK_DAILY_CONSUMPTION_MCFT
    df["days_of_supply_remaining"] = (df["total_storage_mcft"] / BENCHMARK_DAILY_CONSUMPTION_MCFT).round(1)

    # Risk classification
    risk_results = df.apply(classify_scarcity_risk, axis=1)
    df["scarcity_risk_level"] = [r[0] for r in risk_results]
    df["scarcity_risk_score"] = [r[1] for r in risk_results]

    # Calendar and seasonal features
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_year"] = df["date"].dt.dayofyear
    df["monsoon_season"] = df["month"].apply(get_monsoon_season)

    # Convert date to string format for CSV portability
    df["date_str"] = df["date"].dt.strftime("%Y-%m-%d")

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df.to_csv(output_csv, index=False)
    df.to_parquet(output_parquet, index=False)
    print(f"Processed fact_reservoir_scarcity saved: {len(df)} records -> {output_csv}")
    return df


if __name__ == "__main__":
    clean_reservoir_pipeline()
