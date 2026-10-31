"""
Machine Learning Feature Engineering Pipeline
==============================================
Constructs chronological feature sets with non-leaking time lags, rolling hydrological summaries,
precipitation buffers, and multi-horizon target variables for scarcity risk prediction.
"""

import os
import pandas as pd
import numpy as np


def build_ml_features(
    input_scarcity_path: str = "data/processed/fact_reservoir_scarcity.csv",
    output_path: str = "data/processed/ml_scarcity_features.csv",
    forecast_horizon_days: int = 7,
) -> pd.DataFrame:
    print(f"Loading processed reservoir facts from {input_scarcity_path}...")
    df = pd.read_csv(input_scarcity_path)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Core historical state
    features = pd.DataFrame()
    features["date"] = df["date"]
    features["date_str"] = df["date_str"]

    # Current storage state
    features["current_storage_mcft"] = df["total_storage_mcft"]
    features["current_storage_pct"] = df["storage_percentage"]
    features["days_of_water_left"] = df["days_of_supply_remaining"]

    # Time lags (t-1, t-7, t-14, t-30)
    features["storage_pct_lag_1d"] = df["storage_percentage"].shift(1)
    features["storage_pct_lag_7d"] = df["storage_percentage"].shift(7)
    features["storage_pct_lag_14d"] = df["storage_percentage"].shift(14)
    features["storage_pct_lag_30d"] = df["storage_percentage"].shift(30)

    # Rolling storage statistics
    features["storage_rolling_mean_7d"] = df["storage_percentage"].rolling(7, min_periods=7).mean()
    features["storage_rolling_mean_30d"] = df["storage_percentage"].rolling(30, min_periods=30).mean()
    features["storage_rolling_std_7d"] = df["storage_percentage"].rolling(7, min_periods=7).std().fillna(0.0)

    # Storage delta / velocity of depletion
    features["storage_7d_delta_mcft"] = df["storage_7d_delta_mcft"]
    features["storage_30d_delta_mcft"] = df["storage_30d_delta_mcft"]

    # Precipitation signals
    features["daily_rainfall_mm"] = df["daily_rainfall_mm"]
    features["rain_3d_sum_mm"] = df["daily_rainfall_mm"].rolling(3, min_periods=3).sum()
    features["rain_7d_sum_mm"] = df["rainfall_7d_sum_mm"]
    features["rain_14d_sum_mm"] = df["daily_rainfall_mm"].rolling(14, min_periods=14).sum()
    features["rain_30d_sum_mm"] = df["rainfall_30d_sum_mm"]

    # Seasonality cyclic & calendar indicators
    features["month"] = df["month"]
    features["day_of_year"] = df["day_of_year"]
    features["quarter"] = df["date"].dt.quarter
    features["is_northeast_monsoon"] = (df["month"].isin([10, 11, 12])).astype(int)
    features["is_southwest_monsoon"] = (df["month"].isin([6, 7, 8, 9])).astype(int)
    features["is_dry_season"] = (df["month"].isin([1, 2, 3, 4, 5])).astype(int)

    # Historical risk state
    features["current_risk_score"] = df["scarcity_risk_score"]

    # --- Predictive Targets (Forward looking by forecast_horizon_days, default 7 days) ---
    features["target_future_storage_pct"] = df["storage_percentage"].shift(-forecast_horizon_days)
    features["target_future_storage_mcft"] = df["total_storage_mcft"].shift(-forecast_horizon_days)
    features["target_future_risk_score"] = df["scarcity_risk_score"].shift(-forecast_horizon_days)
    features["target_future_risk_class"] = df["scarcity_risk_level"].shift(-forecast_horizon_days)

    # Drop warm-up rows (first 30 days of lags) and the last horizon days (where future target is unknown)
    clean_df = features.dropna().reset_index(drop=True)
    clean_df["target_future_risk_score"] = clean_df["target_future_risk_score"].astype(int)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    clean_df.to_csv(output_path, index=False)
    print(f"ML feature dataset built: {len(clean_df)} complete chronological samples -> {output_path}")
    return clean_df


if __name__ == "__main__":
    build_ml_features()
