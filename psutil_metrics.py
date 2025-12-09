#!/usr/bin/env python3
import psutil
from datetime import datetime
import os
import tempfile

# Folder for Node Exporter textfile collector
OUT_DIR = "/var/lib/node_exporter/textfile_collector"
OUT_FILE = "psutil.prom"

# Use temp file to avoid partial writes
tmpfd, tmppath = tempfile.mkstemp(prefix="psutil_", dir=OUT_DIR)
os.close(tmpfd)

# Collect metrics
cpu = psutil.cpu_percent(interval=0.1)
mem = psutil.virtual_memory()
disk = psutil.disk_usage('/')

lines = [
    f"psutil_cpu_percent {cpu}",
    f"psutil_memory_percent {mem.percent}",
    f"psutil_disk_used_percent {disk.percent}",
    f"psutil_memory_available_bytes {mem.available}",
    f"psutil_disk_free_bytes {disk.free}",
    f"psutil_collected_timestamp {int(datetime.utcnow().timestamp())}"
]

# Write metrics to temp file, then rename
with open(tmppath, "w") as f:
    f.write("\n".join(lines) + "\n")

os.replace(tmppath, os.path.join(OUT_DIR, OUT_FILE))
