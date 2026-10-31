import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { WaterQualityPage } from './pages/WaterQualityPage';
import { ReservoirTrendsPage } from './pages/ReservoirTrendsPage';
import { ScarcityPredictionPage } from './pages/ScarcityPredictionPage';
import { MlEvaluationPage } from './pages/MlEvaluationPage';
import { PipelineStatusPage } from './pages/PipelineStatusPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { api } from './services/api';

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Smart Water Quality & Scarcity Analytics',
    subtitle: 'National water monitoring telemetry and live reservoir conservation metrics.',
  },
  'water-quality': {
    title: 'Water Quality Monitoring & Potability',
    subtitle: 'Standardized CPCB physicochemical parameters: pH, Dissolved Oxygen, BOD, and WQI.',
  },
  'reservoir-trends': {
    title: 'Historical Reservoir Levels & Storage Dynamics',
    subtitle: 'Multi-year storage vs full capacity benchmarks across major supply reservoirs.',
  },
  prediction: {
    title: 'Water Scarcity Risk Prediction Engine',
    subtitle: 'Operational risk forecasting and 7-day forward reservoir storage ML inference.',
  },
  'ml-evaluation': {
    title: 'Machine Learning Model Benchmarks',
    subtitle: 'Out-of-sample chronological evaluation across BigQuery ML and ensemble regressors.',
  },
  'pipeline-status': {
    title: 'Data Pipeline & Warehouse Architecture',
    subtitle: 'Google BigQuery Sandbox integration, ETL schema validation, and storage health.',
  },
  methodology: {
    title: 'Academic Methodology & Technical Dossier',
    subtitle: 'Mathematical formulations, dataset provenance, and B.Tech IA3 project documentation.',
  },
};

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [totalRecordsLoaded, setTotalRecordsLoaded] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await api.getHealth();
        setIsBackendOnline(health.status === 'healthy');
        const sum =
          health.records_loaded.water_quality_records +
          health.records_loaded.reservoir_daily_records;
        setTotalRecordsLoaded(sum);
      } catch {
        setIsBackendOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const { title, subtitle } = PAGE_TITLES[currentPage];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isBackendOnline={isBackendOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={title}
          subtitle={subtitle}
          isBackendOnline={isBackendOnline}
          totalRecordsLoaded={totalRecordsLoaded}
        />

        <main className="flex-1 pb-16">
          {currentPage === 'overview' && <OverviewPage onNavigate={setCurrentPage} />}
          {currentPage === 'water-quality' && <WaterQualityPage />}
          {currentPage === 'reservoir-trends' && <ReservoirTrendsPage />}
          {currentPage === 'prediction' && <ScarcityPredictionPage />}
          {currentPage === 'ml-evaluation' && <MlEvaluationPage />}
          {currentPage === 'pipeline-status' && <PipelineStatusPage />}
          {currentPage === 'methodology' && <MethodologyPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
