FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Only copy server-side files — static assets are served by Caddy
COPY server.py .
COPY docs/character/ docs/character/
COPY docs/project/ docs/project/

RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "60", "server:app"]
