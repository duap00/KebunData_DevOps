FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir psutil prometheus_client

COPY psutil_exporter.py /app/

EXPOSE 9101

CMD ["python3", "psutil_exporter.py"]
