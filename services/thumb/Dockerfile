FROM node:18-alpine

# Install sharp dependencies and other required packages
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
