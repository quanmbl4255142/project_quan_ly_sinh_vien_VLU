# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app with VITE_API_BASE from environment
# Railway will set this during build if configured
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Railway auto-injects PORT env var
# Default port for local development
ENV PORT=80
# API_BASE for backend - should be set in Railway as environment variable
ENV API_BASE=http://localhost:5000/api

# Expose the port
EXPOSE $PORT

# Use entrypoint script to inject API_BASE and start nginx
CMD ["/entrypoint.sh"]