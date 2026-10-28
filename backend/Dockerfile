FROM node:20-slim

WORKDIR /app

# Install Python and dependencies for scikit-learn model inference
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir --break-system-packages scikit-learn joblib numpy

# Install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

EXPOSE 5000

ENV PORT=5000
ENV PYTHON_PATH=python3

CMD ["node", "server.js"]
