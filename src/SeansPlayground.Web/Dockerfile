FROM node:24-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_KEYCLOAK_ADMIN_URL
ARG VITE_KEYCLOAK_AUTHORITY
ARG VITE_KEYCLOAK_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_KEYCLOAK_ADMIN_URL=$VITE_KEYCLOAK_ADMIN_URL
ENV VITE_KEYCLOAK_AUTHORITY=$VITE_KEYCLOAK_AUTHORITY
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

COPY src/SeansPlayground.Web/package*.json ./
RUN npm install
COPY src/SeansPlayground.Web/ ./
RUN npm run build

FROM nginx:1.26-alpine AS runtime
COPY src/SeansPlayground.Web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
