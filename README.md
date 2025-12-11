 # KebunData DevOps

 KebunData DevOps is the central IoT platform for smart farming. It hosts the web dashboard, Python backend, and SQLite database to monitor Edge devices on Oracle Cloud.

 ## Installation

 Use [Docker Compose](https://docs.docker.com/compose/) to build and run the platform.

 ```bash
 git clone [https://github.com/duap00/KebunData_DevOps.git](https://github.com/duap00/KebunData_DevOps.git)
 cd KebunData_DevOps

 # Create database directory
 mkdir -p data

 # Start the application
 docker-compose up -d --build
 ```

 ## Architecture

 The system connects the cloud dashboard to edge devices via HTTP/JSON.

 ```text
 Oracle Cloud VM (Gateway)
 ├── Frontend (Web Dashboard)
 ├── Backend (Python Flask)
 └── Database (SQLite)
        ▲
        │ (HTTP / JSON)
        ▼
 KebunData Edge (CM4 / RPi)
 ```

 ## Usage

 Once the containers are running, you can access the platform via your browser.

 ```bash
 # Open the Dashboard
 http://YOUR_IP:5000

 # API Endpoint Status
 http://YOUR_IP:5000/api/status
 ```

 ## Contributing

 Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

 Please make sure to update tests as appropriate.

 ## License

 [MIT](https://choosealicense.com/licenses/mit/)
