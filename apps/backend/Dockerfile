FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose HTTP API port (5000) and Local SMTP port (2525)
EXPOSE 5000 2525

# Launch server
CMD ["node", "src/server.js"]
