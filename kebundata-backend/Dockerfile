# Use a lightweight Node.js version
FROM node:18-slim

# Install libraries required for Oracle
RUN apt-get update && apt-get install -y libaio1 && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package info first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Open the port
EXPOSE 3000

# Start the engine
CMD ["node", "server.js"]
