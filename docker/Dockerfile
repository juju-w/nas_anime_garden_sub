# Multi-stage build for frontend and backend
# Phase 1: Build Frontend (React)
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
# Set registry mirror for faster build in China
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

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app

# Command to run the application
# Use app.main:app because main.py is inside the app directory
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
