# Use official Node.js base image (based on Debian Bookworm)
FROM node:20-bookworm

# Install melt and LADSPA plugins
RUN apt-get update && \
    apt-get install -y \
    melt \
    ladspa-sdk \
    swh-plugins && \
    rm -rf /var/lib/apt/lists/*  # Clean up to reduce image size

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