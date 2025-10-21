# Use official Node.js base image (based on Debian)
FROM node:20-bookworm

# Install melt via apt
RUN apt-get update && apt-get install -y melt

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]