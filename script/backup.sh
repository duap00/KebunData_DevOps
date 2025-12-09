#!/bin/bash
DATE=$(date +%F_%H-%M-%S)
BACKUP_DIR="./backup/$DATE"
mkdir -p $BACKUP_DIR

# Backup Postgres DB
docker exec -t robo_db pg_dump -U odoo postgres > $BACKUP_DIR/db.sql

# Backup Odoo volume
docker run --rm -v robo_odoo_data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/odoo_data.tar.gz /data

echo "✅ Backup completed in $BACKUP_DIR"
