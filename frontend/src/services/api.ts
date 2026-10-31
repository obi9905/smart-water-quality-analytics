import {
  HealthResponse,
  OverviewResponse,
  WaterQualityResponse,
  ReservoirTrendsResponse,
  MlEvaluationResponse,
  ScarcityPredictRequest,
  ScarcityPredictResponse,
  PipelineStatusResponse,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let message = `Request failed with status ${res.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) message = parsed.detail;
    } catch {
      if (errorText) message = errorText;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthResponse>(res);
  },

  async getOverview(): Promise<OverviewResponse> {
    const res = await fetch(`${API_BASE}/overview`);
    return handleResponse<OverviewResponse>(res);
  },

  async getWaterQuality(state?: string, category?: string, limit: number = 100): Promise<WaterQualityResponse> {
    const params = new URLSearchParams();
    if (state && state !== 'ALL') params.append('state', state);
    if (category && category !== 'ALL') params.append('category', category);
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE}/water-quality?${params.toString()}`);
    return handleResponse<WaterQualityResponse>(res);
  },

  async getReservoirTrends(startYear: number = 2004, endYear: number = 2019, sampleRateDays: number = 7): Promise<ReservoirTrendsResponse> {
    const params = new URLSearchParams({
      start_year: startYear.toString(),
      end_year: endYear.toString(),
      sample_rate_days: sampleRateDays.toString(),
    });

    const res = await fetch(`${API_BASE}/reservoir-trends?${params.toString()}`);
    return handleResponse<ReservoirTrendsResponse>(res);
  },

  async getMlEvaluation(): Promise<MlEvaluationResponse> {
    const res = await fetch(`${API_BASE}/ml-evaluation`);
    return handleResponse<MlEvaluationResponse>(res);
  },

  async predictScarcity(data: ScarcityPredictRequest): Promise<ScarcityPredictResponse> {
    const res = await fetch(`${API_BASE}/predict-scarcity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ScarcityPredictResponse>(res);
  },

  async getPipelineStatus(): Promise<PipelineStatusResponse> {
    const res = await fetch(`${API_BASE}/pipeline-status`);
    return handleResponse<PipelineStatusResponse>(res);
  },
};
