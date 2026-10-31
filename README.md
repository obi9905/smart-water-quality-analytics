# Smart Water Quality & Scarcity Analytics

A data analytics and machine learning project designed to monitor water
quality, analyze reservoir storage trends, and explore water scarcity
prediction using historical water datasets.

**GitHub Repository:**
https://github.com/obi9905/smart-water-quality-analytics

------------------------------------------------------------------------

## Project Overview

Water quality and water scarcity require continuous monitoring and
data-driven decision-making. This project combines water-quality
datasets, reservoir information, data processing, machine learning, and
interactive visualizations to help users understand water conditions and
explore potential scarcity risks.

## Objectives

-   Analyze water-quality measurements from Indian monitoring datasets.
-   Calculate and visualize water-quality indicators.
-   Monitor historical reservoir storage trends.
-   Analyze rainfall and reservoir depletion patterns.
-   Explore machine learning approaches for water scarcity prediction.
-   Present analytical results through an interactive dashboard.
-   Integrate Google BigQuery for cloud-based data storage and querying.

## Technology Stack

  Component          Technologies
  ------------------ -------------------------
  Frontend           React, TypeScript, Vite
  Styling            Tailwind CSS
  Charts             Recharts
  Backend            Python, FastAPI
  Data processing    Pandas, NumPy
  Machine learning   Scikit-learn, Joblib
  Cloud analytics    Google BigQuery
  Querying           SQL
  Version control    Git, GitHub

## System Architecture

``` mermaid
flowchart TD
    A[Water Quality Datasets] --> C[Data Processing and ETL]
    B[Reservoir and Rainfall Datasets] --> C
    C --> D[Processed Datasets]
    D --> E[Machine Learning Models]
    D --> F[Google BigQuery Integration]
    D --> G[FastAPI Backend]
    E --> G
    F --> G
    G --> H[React Frontend]
    H --> I[Interactive Analytics Dashboard]
```

The diagram shows the intended data flow. Local CSV datasets currently
support much of the dashboard functionality, while BigQuery integration
is partial.

## Main Features

### Water Quality Monitoring

-   Display water-quality information.
-   Analyze parameters such as pH, dissolved oxygen, and biochemical
    oxygen demand (BOD).
-   Present water-quality indicators through visualizations.

### Reservoir Trends

-   Explore historical reservoir storage levels.
-   Visualize changes in water storage.
-   Analyze reservoir and rainfall trends.

### Water Scarcity Prediction

-   Accept reservoir and rainfall-related input parameters.
-   Apply available machine learning or fallback prediction logic.
-   Display an estimated scarcity-risk result.

### Analytics Dashboard

-   Display key performance indicators.
-   Present charts and data visualizations.
-   Provide pages for water quality, reservoir trends, predictions, and
    methodology.

### Cloud Integration

-   Google BigQuery integration for cloud-based data storage and
    querying.
-   SQL scripts for data preparation and analytical operations.
-   Cloud-related ingestion and deployment scripts are included in the
    repository.

**Implementation note:** Cloud deployment services such as Cloud Run and
Cloud Storage should not be considered active deployments unless
separately configured and verified. Much of the current dashboard data
is served from local CSV files.

## Dataset Information

The repository includes datasets related to: - CPCB water-quality
monitoring. - CWC monitoring stations. - Chennai reservoir storage
levels. - Chennai reservoir rainfall.

These datasets are used for data cleaning, analysis, feature
engineering, and machine learning. Refer to `docs/data_dictionary.md`
for available field descriptions and units.

## Repository Structure

``` text
smart-water-quality-analytics/
├── .github/workflows/
├── backend/
│   ├── api/
│   ├── etl/
│   └── models/saved/
├── cloud/
│   └── function/
├── data/
│   ├── raw/
│   └── processed/
├── docs/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── sql/
├── tests/
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Installation and Setup

### Prerequisites

-   Python 3.11 or later
-   Node.js 18 or later
-   npm
-   Git

### 1. Clone the Repository

``` powershell
git clone https://github.com/obi9905/smart-water-quality-analytics.git
cd smart-water-quality-analytics
```

### 2. Backend Setup

Create a virtual environment:

``` powershell
python -m venv .venv
```

Activate it in Windows PowerShell:

``` powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

``` powershell
pip install -r requirements.txt
```

Start FastAPI:

``` powershell
python -m uvicorn backend.api.main:app --reload --host 127.0.0.1 --port 8000
```

-   Backend: http://127.0.0.1:8000
-   API documentation: http://127.0.0.1:8000/docs

### 3. Frontend Setup

Open a second terminal:

``` powershell
cd frontend
npm install
npm run dev
```

Open the **Local** URL printed by Vite. The port may vary depending on
availability.

### 4. Optional: Docker

If Docker and Docker Compose are installed and the configuration is
ready for your environment:

``` powershell
docker-compose up --build
```

## Machine Learning

The repository includes model training code and saved model artifacts
for scarcity-related analysis, including: - Scarcity classification
model. - Reservoir storage regression model. - Feature scaler. - Model
evaluation metrics. - Model training and feature-engineering scripts.

Use the saved evaluation metrics and actual test results when reporting
model performance. Verify the generated evaluation output before quoting
specific accuracy figures.

## Future Enhancements

-   Complete and verify cloud-based data ingestion.
-   Deploy the backend and frontend to cloud hosting.
-   Integrate live water-quality monitoring data.
-   Improve machine learning validation and prediction performance.
-   Add alerts for potential water scarcity.
-   Expand the dashboard with additional analytics.

## Academic Project

**Project:** Smart Water Quality & Scarcity Analytics\
**Course:** Cloud Computing for Data Analytics\
**Cloud platform:** Google Cloud Platform --- BigQuery integration

------------------------------------------------------------------------

Developed as an academic team project.
