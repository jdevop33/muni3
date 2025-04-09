FROM node:18-slim

WORKDIR /app

# Install puppeteer dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Create package.json if it doesn't exist
RUN echo '{"name":"maxun-service","version":"1.0.0","main":"server.js","dependencies":{"express":"^4.18.2","puppeteer":"^21.0.0","pg":"^8.11.3","@neondatabase/serverless":"^0.6.0","@google-cloud/storage":"^7.0.0"}}' > package.json

# Install dependencies
RUN npm install

# Copy application files
COPY . ./

# Create robots directory if it doesn't exist
RUN mkdir -p robots

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the server
CMD ["node", "server.js"]