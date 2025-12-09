FROM prom/node-exporter:latest

# Switch to root to install Python
USER root

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Install psutil
RUN pip3 install psutil

# Create directory for textfile metrics
RUN mkdir -p /var/lib/node_exporter/textfile_collector
WORKDIR /var/lib/node_exporter/textfile_collector

# Copy your Python script into the container
COPY psutil_metrics.py /var/lib/node_exporter/textfile_collector/psutil_metrics.py

# Run the Python script every 30 seconds in background and start node-exporter
CMD ["sh", "-c", "while true; do python3 /var/lib/node_exporter/textfile_collector/psutil_metrics.py; sleep 30; done & /bin/node_exporter --collector.textfile --collector.textfile.directory=/var/lib/node_exporter/textfile_collector --path.procfs=/host/proc --path.rootfs=/rootfs --path.sysfs=/host/sys"]
