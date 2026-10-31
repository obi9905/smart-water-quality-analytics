# Presentation Outline for Academic Evaluation (IA3)
## Smart Water Quality and Scarcity Prediction System

**Target Audience**: Evaluating Professor / External Review Committee  
**Degree**: B.Tech AI & Data Science • Cloud Computing for Data Analytics  
**Duration**: 10–12 Minutes + Q&A

---

## Slide 1: Title Slide & Project Identity
- **Title**: Smart Water Quality and Scarcity Prediction System
- **Domain**: Cloud Computing, Environmental Data Analytics, & Time-Series Machine Learning
- **Cloud Platform**: Google Cloud Platform (GCP) • Project ID: `smart-water-analytics-512816`
- **Budget Tier**: Strict ₹0 (100% Free Tier / BigQuery Sandbox)
- **Key Talking Point**: "Good morning Professor. Today I am presenting an end-to-end cloud data analytics platform that unifies water quality monitoring across 1,991 national stations with predictive water scarcity risk forecasting across 15 years of daily reservoir storage records."

---

## Slide 2: Real-World Motivation & Problem Statement
- **The Dual Water Crisis**:
  1. *Chemical Degradation*: Contamination of surface water sources (70% of Indian surface waters polluted).
  2. *Hydrological Day Zero Events*: Urban reservoir depletion collapses (e.g., Chennai 2019 Day Zero crisis).
- **Existing Limitations**: Siloed manual records, absence of composite water indexing, and reactive rather than predictive scarcity responses.
- **Key Talking Point**: "Most municipal corporations react only after reservoirs drop below 10%. Our objective was to build a zero-cost cloud system providing 7-day advance early warnings."

---

## Slide 3: Authentic Data Sources & Provenance
- **No Synthetic Data**: Every metric is grounded in authentic public government records:
  - **CPCB NWMP Dataset**: 1,991 multi-parameter chemical records (pH, DO, BOD, Conductivity, Nitrates, Coliform).
  - **CWC Monitoring Stations**: 1,747 stations (146 dams with FRL and MWL benchmarks).
  - **CMWSSB Reservoir Time-Series**: 5,738 continuous daily observations (2004–2019) across Poondi, Cholavaram, Redhills, and Chembarambakkam (11,057 mcft combined capacity).
- **Key Talking Point**: "We strictly checked data schemas, units, and licensing under GODL-India. The dataset directly captures the historic 2019 Day Zero crisis."

---

## Slide 4: Cloud Architecture & Zero-Cost Feasibility
- **Architecture Diagram Walkthrough**:
  - Ingestion -> Validation -> Google Cloud Storage -> BigQuery Sandbox -> BigQuery ML / Ensembles -> FastAPI -> React Dashboard.
- **GCP Zero-Cost Compliance**:
  - BigQuery Sandbox: 10 GB active storage, 1 TB queries/month free. No credit card required.
  - BigQuery ML: Standard regression and classification run within free query processing limits.
  - Looker Studio: 100% free cloud BI connector.
- **Key Talking Point**: "We adhered to a strict zero-cost budget constraint while delivering a production-ready, partitioned, and clustered data warehouse."

---

## Slide 5: Data Cleaning & Water Quality Index (WQI) Engine
- **ETL Validation Rules**:
  - Bound physical sensors: $\text{pH} \in [0, 14]$, $\text{DO} \ge 0$, $\text{BOD} \ge 0$, $\text{Temp} \in [0, 55]^\circ\text{C}$.
  - State-median imputation for missing entries.
- **Mathematical Formulation**:
  - Weighted Arithmetic Water Quality Index (Brown et al. / CPCB standards):
    $$\text{WQI} = \frac{\sum (q_i \cdot w_i)}{\sum w_i}$$
  - Classifies into: Excellent, Good, Poor, Very Poor, and Unsuitable for Drinking.
- **Key Talking Point**: "Our SQL and Python pipelines convert isolated chemical numbers into an actionable potability verdict across every monitoring station."

---

## Slide 6: Scarcity Risk Dynamics & Feature Engineering
- **Reservoir Aggregations**:
  - Combined storage vs. 11,057 mcft capacity.
  - Municipal drawdown benchmark: 28.5 mcft/day (~800 MLD).
- **24 Non-Leaking Features**:
  - Time lags: $t-1, t-7, t-14, t-30$ days.
  - 7-day and 30-day rolling storage averages and depletion velocity ($\Delta \text{Storage}_7$).
  - 7-day and 30-day cumulative catchment rainfall.
  - Seasonal flags (Northeast Monsoon, Southwest Monsoon, Dry Period).
- **Key Talking Point**: "Features use strictly historical information to predict 7 days forward, ensuring zero future data leakage."

---

## Slide 7: Machine Learning Methodology & Non-Leaking Split
- **Why Random Splits Fail**:
  - Random $k$-fold cross-validation leaks future rainfall and storage trends into the training set.
- **Chronological Time-Series Split**:
  - **Training Set (2004–2016)**: 4,719 days (~83% of data).
  - **Testing Set (2017–2019)**: 982 days (~17% of data), evaluating models during Chennai's extreme drought crisis.
- **Dual Predictive Modeling**:
  1. Multi-Class Classification: Low, Moderate, Severe, Critical (Day Zero).
  2. Continuous Regression: 7-Day forward reservoir capacity percentage.

---

## Slide 8: Experimental Results & Baseline Comparison
- **Classification Task (7-Day Scarcity Risk)**:
  - Naive Dummy Baseline: **0.00% Accuracy** (fails completely during drought test set).
  - BigQuery ML (LOGISTIC_REG): **94.09% Accuracy**, **0.9458 Weighted F1**.
  - Random Forest Classifier: **94.20% Accuracy**, **0.9478 Weighted F1**.
- **Regression Task (7-Day Forward Storage %)**:
  - Naive Mean Baseline: MAE = **28.415%**, $R^2 = -3.58$.
  - Persistence Baseline: MAE = **1.049%**, $R^2 = 0.9760$.
  - BigQuery ML Linear Regressor: MAE = **1.150%**, $R^2 = 0.9826$.
- **Key Talking Point**: "Our cloud ML models achieve over 94% accuracy, accurately identifying 96.6% of Critical Day Zero alert days."

---

## Slide 9: Live Application Walkthrough & User Experience
- **Stack**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, FastAPI.
- **7 Dashboard Modules**:
  1. *Overview Dashboard*: National KPIs, WQI pie chart, reservoir volume gauges.
  2. *Water Quality*: Filterable CPCB table with state and potability indicators + CSV export.
  3. *Reservoir Trends*: 15-year time-series with sampling resolution controls.
  4. *Scarcity Prediction*: Interactive simulator with 2019 Day Zero presets and real-time inference.
  5. *ML Evaluation*: Out-of-sample benchmark comparison tables and confusion matrices.
  6. *Pipeline Status*: BigQuery Sandbox telemetry and sensor validation logs.
  7. *Methodology & Dossier*: Formulas, standards tables, and citations.

---

## Slide 10: Testing, CI/CD, and Containerization
- **Automated Test Suite**:
  - `tests/test_raw_data.py`: 5 passed tests (data integrity and sensor ranges).
  - `tests/test_api_and_models.py`: 7 passed tests (API routes, edge case predictions).
  - Production Build: `npm run build` compiled without TypeScript errors.
- **DevOps**:
  - GitHub Actions CI workflow running backend tests, SQL validation, and frontend build.
  - Multi-stage Dockerfile and Docker Compose containerization.

---

## Slide 11: Summary, Academic Impact, and Future Work
- **Summary**: Delivered a complete, verified, and zero-cost cloud hydrological analytics platform satisfying all IA3 rubric criteria.
- **Future Enhancements**: Satellite remote sensing integration via Google Earth Engine and real-time IoT water quality sensors.
- **Conclusion**: "Thank you Professor. The application and backend are running live on http://localhost:3000 and http://127.0.0.1:8000. I am ready for the live demonstration and Q&A."

---

## Anticipated Viva Questions & Prepared Answers

### Q1: "Why did your naive baseline achieve 0% accuracy on the test set?"
> **Answer**: "Because we used a strict chronological split where the test set is 2017 to 2019. In the training set (2004–2016), the most frequent class was Low/Moderate risk. When the naive model applied this rule to the severe drought of 2017–2019, zero test days were Low risk, resulting in 0% accuracy. This vividly demonstrates why time-series models must be evaluated chronologically rather than with random splits."

### Q2: "How does this stay 100% free on GCP?"
> **Answer**: "We utilized BigQuery Sandbox, which grants 10 GB of permanent active storage and 1 TB of query processing per month without entering a credit card or activating paid billing. Our BigQuery ML models and SQL queries execute well within these free quotas. For deployment, we containerized the stack in Docker, matching Cloud Run's exact environment without incurring cloud build charges."

### Q3: "How is WQI calculated?"
> **Answer**: "We applied the Weighted Arithmetic Water Quality Index method (Brown et al., standardized by CPCB). It calculates quality ratings $q_i$ for pH, DO, BOD, conductivity, nitrates, and total coliform based on BIS 10500 drinking standards, multiplies them by unit weights $w_i$, and sums them to produce a composite index from 0 to 100+."
