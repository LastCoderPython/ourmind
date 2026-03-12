# ── Manas Backend – Production Dockerfile ──────────────────────────────────
# Lightweight build: no PyTorch, uses HuggingFace Inference API for ML models.

FROM python:3.11-slim

# Force Python to unbuffer stdout/stderr (vital for immediate Render logs)
ENV PYTHONUNBUFFERED=1

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --group appuser

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Assign ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Add a healthcheck so Render knows if the app is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Expose the port Render assigns via $PORT
EXPOSE 8000

# Start uvicorn. Render sets $PORT automatically.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
