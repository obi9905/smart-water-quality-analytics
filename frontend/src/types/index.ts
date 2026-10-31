export interface HealthResponse {
  status: string;
  service: string;
  cloud_provider: string;
  gcp_project_id: string;
  bigquery_dataset: string;
  records_loaded: {
    water_quality_records: number;
    reservoir_daily_records: number;
    cwc_stations_count: number;
  };
}

export interface OverviewKPIs {
  total_monitoring_stations: number;
  national_avg_wqi: number;
  national_potable_pct: number;
  current_reservoir_storage_mcft: number;
  current_storage_percentage: number;
  days_of_water_remaining: number;
  current_scarcity_risk: string;
  latest_observation_date: string;
  historical_drought_frequency_pct: number;
}

export interface ReservoirSnapshot {
  poondi_mcft: number;
  cholavaram_mcft: number;
  redhills_mcft: number;
  chembarambakkam_mcft: number;
  daily_rainfall_mm: number;
}

export interface OverviewResponse {
  kpis: OverviewKPIs;
  wqi_distribution: Record<string, number>;
  scarcity_risk_distribution: Record<string, number>;
  recent_reservoir_snapshot: ReservoirSnapshot;
}

export interface WaterQualityRecord {
  record_id: string;
  station_code: string;
  location: string;
  state: string;
  year: number;
  temperature_c: number;
  dissolved_oxygen_mg_l: number;
  ph: number;
  conductivity_umhos_cm: number;
  bod_mg_l: number;
  nitrate_nitrite_mg_l: number;
  fecal_coliform_mpn_100ml: number;
  total_coliform_mpn_100ml: number;
  water_quality_index: number;
  wqi_category: string;
  is_potable: boolean;
}

export interface StateAggregate {
  state: string;
  station_count: number;
  avg_wqi: number;
  avg_ph: number;
  avg_do: number;
  avg_bod: number;
  potable_count: number;
  potable_rate_pct: number;
}

export interface WaterQualityResponse {
  total_matching_records: number;
  returned_records_count: number;
  available_states: string[];
  wqi_categories: string[];
  state_aggregates: StateAggregate[];
  records: WaterQualityRecord[];
}

export interface ReservoirTrendPoint {
  date_str: string;
  year: number;
  poondi_storage_mcft: number;
  cholavaram_storage_mcft: number;
  redhills_storage_mcft: number;
  chembarambakkam_storage_mcft: number;
  total_storage_mcft: number;
  storage_percentage: number;
  daily_rainfall_mm: number;
  rainfall_7d_avg_mm: number;
  rainfall_30d_avg_mm: number;
  storage_7d_delta_mcft: number;
  days_of_supply_remaining: number;
  scarcity_risk_level: string;
  scarcity_risk_score: number;
  monsoon_season: string;
}

export interface ReservoirTrendsResponse {
  period: string;
  total_days_in_period: number;
  sampled_points_count: number;
  sample_step_days: number;
  trends: ReservoirTrendPoint[];
}

export interface ModelComparisonItem {
  accuracy?: number;
  precision_weighted?: number;
  recall_weighted?: number;
  f1_weighted?: number;
  f1_macro?: number;
  roc_auc_ovr?: number | string;
  mae_storage_pct?: number;
  rmse_storage_pct?: number;
  r2_score?: number;
  mape_pct?: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface LargestResidualItem {
  date_str: string;
  current_storage_pct: number;
  target_future_storage_pct: number;
  predicted_storage_pct: number;
  error_abs: number;
}

export interface MlEvaluationResponse {
  metadata: {
    target_cloud_platform: string;
    gcp_project_id: string;
    train_samples_count: number;
    test_samples_count: number;
    train_period: string;
    test_period: string;
    features_used: string[];
    forecast_horizon_days: number;
  };
  classification: {
    classes: string[];
    models_comparison: Record<string, ModelComparisonItem>;
    best_model: string;
    confusion_matrix: number[][];
    per_class_metrics: Record<string, {
      precision: number;
      recall: number;
      'f1-score': number;
      support: number;
    }>;
    top_features: FeatureImportanceItem[];
  };
  regression: {
    models_comparison: Record<string, ModelComparisonItem>;
    best_model: string;
    metric_definitions: Record<string, string>;
    error_analysis: {
      largest_residuals: LargestResidualItem[];
      limitation_note: string;
    };
  };
}

export interface ScarcityPredictRequest {
  current_storage_pct: number;
  days_of_water_left: number;
  rain_7d_sum_mm: number;
  storage_7d_delta_mcft: number;
  month: number;
}

export interface ScarcityPredictResponse {
  predicted_future_storage_pct_7d: number;
  predicted_risk_level: string;
  predicted_risk_score: number;
  confidence_probabilities: Record<string, number>;
  days_of_supply_forecast: number;
  alert_severity: string;
  recommendation: string;
}

export interface PipelineStatusResponse {
  cloud_warehouse: {
    gcp_project_id: string;
    dataset_id: string;
    storage_tier: string;
    sql_scripts: string[];
  };
  pipeline_health: {
    cpcb_water_quality: {
      raw_records: number;
      clean_records: number;
      data_quality_checks_passed: number;
      sensor_bounds_enforced: string[];
    };
    reservoir_scarcity: {
      raw_records: number;
      clean_records: number;
      null_values_rate: string;
      date_coverage: string;
    };
  };
  profile_summary: any;
}
