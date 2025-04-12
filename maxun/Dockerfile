FROM node:22-slim

WORKDIR /app

# Step 1: Install prerequisites
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Step 2: Add Google Chrome repository and key using gpg --dearmor
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | \
    gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Step 3: Install Chrome and required fonts/libs
RUN apt-get update && \
    apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends && \
    # Clean up apt lists after install
    rm -rf /var/lib/apt/lists/*

# Step 4: Install original puppeteer dependencies (potentially redundant now, but safe)
# Combine update and install, clean up after
RUN apt-get update && apt-get install -y --no-install-recommends \
    # ca-certificates -- already installed
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
    #libxss1 -- already installed in step 3
    libxtst6 \
    lsb-release \
    xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Step 5: Install npm packages
COPY package*.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install --legacy-peer-deps

# Step 6: Copy remaining app code
COPY . .

EXPOSE 8080
ENV PORT=8080
ENV HOST=0.0.0.0
CMD ["node", "server.js"]
