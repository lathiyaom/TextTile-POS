# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Configure npm for resilience and install dependencies
RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retry-mintimeout 10000 \
    && npm config set fetch-retries 5 \
    && npm install --no-audit

# Copy source code
COPY . .

# Build the application
# Note: VITE_API_BASE_URL can be set via --build-arg if needed, 
# but we are using Nginx proxy /api so default relative path or /api/v1 should work if configured.
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
