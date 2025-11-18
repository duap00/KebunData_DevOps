# Robot People - Monitoring Infrastructure

Central monitoring system for Robot People IoT smart farming devices.

## 🏗️ Architecture
```
┌─────────────────────────────────────┐
│  Oracle Cloud Gateway (1GB RAM)    │
│  - Grafana (Dashboards)            │
│  - Prometheus (Metrics DB)         │
│  - Node Exporter (System Metrics)  │
│  - psutil Exporter (Python Metrics)│
└─────────────────────────────────────┘
         │
         │ (Future: VPN Connection)
         │
┌─────────────────────────────────────┐
│  Edge Devices (CM4, Pi4, etc.)     │
│  - Monitoring Agents               │
│  - Odoo ERP                        │
│  - IoT Services                    │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Oracle Cloud Free Tier account
- Ubuntu 20.04/24.04 VM
- Docker & Docker Compose installed

### Installation

1. **Clone this repository:**
```bash
git clone https://github.com/duap00/robotpeople-monitoring.git
cd robotpeople-monitoring
```

2. **Start the monitoring stack:**
```bash
docker-compose up -d
```

3. **Access Grafana:**
```
URL: http://YOUR_IP:3000
Username: admin
Password: robotpeople2024
```

4. **Access Prometheus:**
```
URL: http://YOUR_IP:9090
```

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Grafana | 3000 | Visualization dashboards |
| Prometheus | 9090 | Metrics database |
| Node Exporter | 9100 | System metrics |
| psutil Exporter | 9101 | Detailed Python metrics |

## 🔧 Configuration

### Prometheus
Edit `prometheus/prometheus.yml` to add your devices:
```yaml
scrape_configs:
  - job_name: 'your-device'
    static_configs:
      - targets: ['device-ip:9100']
        labels:
          device: 'device-name'
```

Then restart Prometheus:
```bash
docker-compose restart prometheus
```

## 📈 Dashboards

### Pre-configured Dashboards:
1. **psutil Dashboard** - Detailed system metrics
2. **Node Exporter** - Standard system monitoring

### Import Additional Dashboards:
- Grafana → Dashboards → Import
- Use dashboard ID: 1860 (Node Exporter Full)

## 🎯 Monitoring Metrics

**System Metrics:**
- CPU usage (total & per-core)
- Memory usage & breakdown
- Disk usage & I/O
- Network traffic
- System load
- Process counts
- Uptime

**Container Metrics:**
- Docker container stats (future)
- Resource usage per container

## 🔐 Security

**Change default passwords:**
```bash
# Edit docker-compose.yml
# Change GF_SECURITY_ADMIN_PASSWORD value
docker-compose up -d grafana
```

**Firewall rules (Oracle Cloud):**
- Port 3000: Grafana (add ingress rule)
- Port 9090: Prometheus (optional)
- Ports 9100-9101: Exporters (internal only)

## 💾 Data Retention

**Default settings:**
- Prometheus: 15 days
- Logs (Loki): 7 days

**Change retention:**
Edit `docker-compose.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'
```

## 🌐 Network Usage

**Expected bandwidth:**
- 1 device: ~100 MB/day
- 5 devices: ~500 MB/day (~15 GB/month)
- Well within Oracle Free Tier (10 TB/month)

## 📱 Future Features

- [ ] WireGuard VPN for secure device connections
- [ ] Alerting via Telegram/Email
- [ ] IoT sensor data collection
- [ ] Odoo performance monitoring
- [ ] Mobile app access
- [ ] Multi-site deployment

## 🛠️ Troubleshooting

**Containers won't start:**
```bash
docker-compose logs <service-name>
```

**Prometheus not scraping:**
- Check targets: http://YOUR_IP:9090/targets
- Verify device IPs in prometheus.yml

**Grafana dashboard empty:**
- Verify Prometheus data source
- Check time range (top right)

## 📚 Documentation

- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Docker Compose](https://docs.docker.com/compose/)

## 🤝 Contributing

This is a personal project for Robot People smart farming infrastructure.

## 📄 License

MIT License

## 👤 Author

**Robot People**
- GitHub: [@duap00](https://github.com/duap00)

## 🌟 Acknowledgments

- Oracle Cloud Free Tier
- Prometheus & Grafana communities
- Open source monitoring tools

---

**Built with ❤️ for Smart Farming** 🌱🤖
