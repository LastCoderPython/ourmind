# ── Manas Backend – Production Dockerfile ──────────────────────────────────
# Lightweight build: no PyTorch, uses HuggingFace Inference API for ML models.

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies (lightweight — no PyTorch!)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port Render assigns via $PORT
EXPOSE 8000

# Start uvicorn. Render sets $PORT automatically.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
