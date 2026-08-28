# ==============================================================================
# Stage 1: Build React 19 Frontend with Vite
# ==============================================================================
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ==============================================================================
# Stage 2: Serve with Nginx Alpine (Lightweight Web Server)
# ==============================================================================
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built static files from build stage
COPY --from=build /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
