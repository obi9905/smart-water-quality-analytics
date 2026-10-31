# ==============================================================================
# Multi-Stage Dockerfile for Smart Water Analytics Platform
# Stage 1: Build React 18 TypeScript Frontend
# Stage 2: Python 3.11 Analytical Engine & FastAPI API Server
# ==============================================================================

# --- Stage 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Backend & Production Server ---
FROM python:3.11-slim AS production
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, models, data, and SQL
COPY backend/ ./backend/
COPY data/ ./data/
COPY sql/ ./sql/

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start FastAPI server
CMD ["python", "-m", "uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
