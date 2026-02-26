# Phase 1: Build Frontend (React)
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
RUN npm config set registry https://registry.npmmirror.com
COPY frontend/package*.json ./
COPY frontend/pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ ./
RUN pnpm run build

# Phase 2: Build Backend (FastAPI)
FROM python:3.10-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# Copy backend application
COPY backend/app/ /app/app/

# Copy built frontend assets to static dir
COPY --from=frontend-builder /app/frontend/dist /app/static

EXPOSE 8000
ENV PYTHONPATH=/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
