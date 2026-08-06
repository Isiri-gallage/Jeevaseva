# ─── Stage 1: build the static bundle ──────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# CRA inlines REACT_APP_* variables at build time, so the API URL must be known
# here — it cannot be changed by setting an env var on the running container.
ARG REACT_APP_API_URL=http://localhost:8000/api/v1
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# ─── Stage 2: serve with nginx ─────────────────────────────
# Only the built assets reach the final image: no node_modules, no source.
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
