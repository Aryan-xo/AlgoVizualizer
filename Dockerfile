# Stage 1: Build C++ Backend
FROM gcc:latest AS cpp-builder
WORKDIR /app/backend/cpp
COPY backend/cpp/algorithms.cpp .
RUN g++ -std=c++17 -O3 -o algorithms algorithms.cpp

# Stage 2: Build React Frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 3: Setup Python Runtime & Serve
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if any needed for python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code (Source)
COPY backend/ /app/backend/

# Copy C++ Executable (Linux Binary)
COPY --from=cpp-builder /app/backend/cpp/algorithms /app/backend/cpp/algorithms

# Copy Frontend Build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
