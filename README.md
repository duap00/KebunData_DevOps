# 🌱 KebunData DevOps

![Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Oracle_Cloud_%7C_Raspberry_Pi-blue)
![Stack](https://img.shields.io/badge/Stack-Docker_%7C_Odoo_%7C_Python-orange)

**KebunData** is a smart farming platform integrating IoT monitoring, Odoo ERP, and cloud automation. This repository contains the **Infrastructure as Code (IaC)**, **Application Logic**, and **DevOps pipelines** required to deploy the system.

---

## 🏗 System Architecture

The system operates on a hybrid cloud-edge model:

1.  **Cloud (Oracle VM):**
    * **Role:** Central Server & ERP.
    * **Tech:** Docker, Odoo 17, PostgreSQL, Nginx.
    * **Goal:** Management, inventory, and historical data analysis.

2.  **Edge (Raspberry Pi CM4):**
    * **Role:** IoT Field Unit.
    * **Tech:** Python, Firebase Admin SDK.
    * **Goal:** Real-time data capture (pH, Temperature, VPD) and sync to cloud.

---

## 📂 Repository Structure

| Directory | Description |
| :--- | :--- |
| **`infra/`** | **Infrastructure:** Docker Compose files and Server configurations for the Oracle VM. |
| **`app/`** | **Application:** Custom Python logic, Odoo addons, and IoT sensor connection scripts. |
| **`ci-cd/`** | **Automation:** GitHub Actions workflows and deployment pipelines. |
| **`script/`** | **Utilities:** Helper scripts for automated backups, restoration, and setup. |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone [https://github.com/duap00/KebunData_DevOps.git](https://github.com/duap00/KebunData_DevOps.git)
cd KebunData_DevOps
```
### 2. Project Initialization (Create Folders)
```bash
# Create the application logic folder
mkdir -p app/iot_sensor_code

# Create the requirements file for Python dependencies
echo "firebase-admin" > app/iot_sensor_code/requirements.txt
```
### 3. Infrastructure Setup (Oracle VM)
```bash
cd infra
docker-compose up -d
```
### 4. Application Setup (IoT Logic)
```bash
cd ../app/iot_sensor_code
pip install -r requirements.txt
# python main.py  <-- Uncomment to run the sensor logic
```
