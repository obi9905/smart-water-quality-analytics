"""
Water Quality ETL Pipeline
==========================
Transforms raw CPCB water quality monitoring records into analysis-ready fact tables.
Computes the Weighted Arithmetic Water Quality Index (WQI) based on CPCB / Brown et al. standards.
"""

import os
import numpy as np
import pandas as pd


# BIS 10500 / CPCB Standards and Ideal Values for WQI calculation
STANDARDS = {
    "ph": {"standard": 8.5, "ideal": 7.0, "unit_weight": 0.1176},
    "do": {"standard": 5.0, "ideal": 14.6, "unit_weight": 0.2000},
    "bod": {"standard": 5.0, "ideal": 0.0, "unit_weight": 0.2000},
    "conductivity": {"standard": 300.0, "ideal": 0.0, "unit_weight": 0.0033},
    "nitrate": {"standard": 45.0, "ideal": 0.0, "unit_weight": 0.0222},
    "coliform": {"standard": 50.0, "ideal": 0.0, "unit_weight": 0.0200},
}


def compute_wqi(row: pd.Series) -> float:
    """
    Computes Weighted Arithmetic Water Quality Index (WQI).
    Quality rating qi = 100 * |Vi - Vo| / |Si - Vo|
    WQI = Sum(qi * wi) / Sum(wi)
    """
    params = [
        ("ph", row["ph"]),
        ("do", row["dissolved_oxygen_mg_l"]),
        ("bod", row["bod_mg_l"]),
        ("conductivity", row["conductivity_umhos_cm"]),
        ("nitrate", row["nitrate_nitrite_mg_l"]),
        ("coliform", row["total_coliform_mpn_100ml"]),
    ]

    total_weighted_q = 0.0
    total_weights = 0.0

    for key, val in params:
        if pd.isna(val) or np.isinf(val):
            continue
        cfg = STANDARDS[key]
        s_i = cfg["standard"]
        v_o = cfg["ideal"]
        w_i = cfg["unit_weight"]

        # Quality rating
        if s_i == v_o:
            q_i = 100.0
        else:
            q_i = 100.0 * abs(val - v_o) / abs(s_i - v_o)

        total_weighted_q += q_i * w_i
        total_weights += w_i

    if total_weights == 0:
        return np.nan
    return round(float(total_weighted_q / total_weights), 2)


def classify_wqi(wqi: float) -> str:
    if pd.isna(wqi):
        return "Unknown"
    if wqi <= 25.0:
        return "Excellent"
    elif wqi <= 50.0:
        return "Good"
    elif wqi <= 75.0:
        return "Poor"
    elif wqi <= 100.0:
        return "Very Poor"
    else:
        return "Unsuitable for Drinking"


def clean_water_quality_pipeline(
    raw_path: str = "data/raw/cpcb_water_quality.csv",
    output_csv: str = "data/processed/fact_water_quality.csv",
    output_parquet: str = "data/processed/fact_water_quality.parquet",
) -> pd.DataFrame:
    print(f"Loading raw CPCB data from {raw_path}...")
    df = pd.read_csv(raw_path, encoding="latin1")

    # Standardize column names using robust substring matching
    new_cols = {}
    for col in df.columns:
        c_upper = col.upper()
        if "STATION" in c_upper:
            new_cols[col] = "station_code"
        elif "LOCATION" in c_upper:
            new_cols[col] = "location"
        elif "STATE" in c_upper:
            new_cols[col] = "state"
        elif "TEMP" in c_upper:
            new_cols[col] = "temperature_c"
        elif "D.O" in c_upper:
            new_cols[col] = "dissolved_oxygen_mg_l"
        elif "PH" in c_upper:
            new_cols[col] = "ph"
        elif "CONDUCTIVITY" in c_upper:
            new_cols[col] = "conductivity_umhos_cm"
        elif "B.O.D" in c_upper:
            new_cols[col] = "bod_mg_l"
        elif "NITRATE" in c_upper:
            new_cols[col] = "nitrate_nitrite_mg_l"
        elif "FECAL" in c_upper:
            new_cols[col] = "fecal_coliform_mpn_100ml"
        elif "TOTAL" in c_upper:
            new_cols[col] = "total_coliform_mpn_100ml"
        elif "YEAR" in c_upper:
            new_cols[col] = "year"
        else:
            new_cols[col] = col.lower()
    df = df.rename(columns=new_cols)

    # Clean string identifiers
    df["station_code"] = df["station_code"].astype(str).str.strip()
    df["station_code"] = df["station_code"].replace(["nan", "NAN", "NaN", ""], "UNKNOWN")

    df["location"] = df["location"].astype(str).str.strip()
    df["location"] = df["location"].replace(["nan", "NAN", "NaN", ""], "Unknown Monitoring Site")

    df["state"] = df["state"].astype(str).str.strip().str.upper()
    df["state"] = df["state"].replace(["nan", "NAN", "NaN", ""], "UNKNOWN STATE")
    # Standardize common state spelling variations in CPCB records
    state_replacements = {
        "TAMILNADU": "TAMIL NADU",
        "MAHARASHTRA ": "MAHARASHTRA",
        "ORISSA": "ODISHA",
        "UTTARAKHAND": "UTTARAKHAND",
        "PONDICHERRY": "PUDUCHERRY",
    }
    df["state"] = df["state"].replace(state_replacements)

    # Convert numeric fields and coerce invalid characters
    numeric_fields = [
        "temperature_c",
        "dissolved_oxygen_mg_l",
        "ph",
        "conductivity_umhos_cm",
        "bod_mg_l",
        "nitrate_nitrite_mg_l",
        "fecal_coliform_mpn_100ml",
        "total_coliform_mpn_100ml",
    ]

    for col in numeric_fields:
        cleaned = df[col].astype(str).str.strip().replace(["NAN", "nan", "NaN", "", "?"], np.nan)
        df[col] = pd.to_numeric(cleaned, errors="coerce")

    # Enforce physical sensor validity boundaries
    df.loc[(df["ph"] < 0) | (df["ph"] > 14), "ph"] = np.nan
    df.loc[(df["temperature_c"] < 0) | (df["temperature_c"] > 55), "temperature_c"] = np.nan
    df.loc[df["dissolved_oxygen_mg_l"] < 0, "dissolved_oxygen_mg_l"] = np.nan
    df.loc[df["bod_mg_l"] < 0, "bod_mg_l"] = np.nan
    df.loc[df["conductivity_umhos_cm"] < 0, "conductivity_umhos_cm"] = np.nan
    df.loc[df["nitrate_nitrite_mg_l"] < 0, "nitrate_nitrite_mg_l"] = np.nan
    df.loc[df["fecal_coliform_mpn_100ml"] < 0, "fecal_coliform_mpn_100ml"] = np.nan
    df.loc[df["total_coliform_mpn_100ml"] < 0, "total_coliform_mpn_100ml"] = np.nan

    # Impute missing numeric values using State-level median, then National median
    for col in numeric_fields:
        state_medians = df.groupby("state")[col].transform("median")
        df[col] = df[col].fillna(state_medians)
        df[col] = df[col].fillna(df[col].median())

    # Calculate WQI and Category
    print("Computing Water Quality Index (WQI) for all stations...")
    df["water_quality_index"] = df.apply(compute_wqi, axis=1)
    df["wqi_category"] = df["water_quality_index"].apply(classify_wqi)
    # Potability definition: WQI <= 50 and pH between 6.5 and 8.5 and BOD <= 3.0
    df["is_potable"] = (
        (df["water_quality_index"] <= 50.0)
        & (df["ph"] >= 6.5)
        & (df["ph"] <= 8.5)
        & (df["bod_mg_l"] <= 3.0)
    )

    # Unique record identifier
    df["record_id"] = "WQ_" + df["year"].astype(str) + "_" + df.index.astype(str)

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df.to_csv(output_csv, index=False)
    df.to_parquet(output_parquet, index=False)
    print(f"Processed fact_water_quality saved: {len(df)} records -> {output_csv}")
    return df


if __name__ == "__main__":
    clean_water_quality_pipeline()
