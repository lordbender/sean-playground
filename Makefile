SHELL := /bin/sh

SOLUTION := SeansPlayground.slnx
WEB_DIR := src/SeansPlayground.Web
API_HEALTH_URL := http://localhost:5100/health
API_STATUS_URL := http://localhost:5100/api/system/status
WEB_URL := http://localhost:3000/
KEYCLOAK_URL := http://localhost:8080/realms/seans-playground/.well-known/openid-configuration

.PHONY: help install build build-api build-web up down restart ps logs logs-api logs-web logs-keycloak logs-postgres smoke clean

help:
	@printf "%s\n" "Sean's Playground targets:"
	@printf "%s\n" "  make install        Install frontend dependencies"
	@printf "%s\n" "  make build          Build .NET solution and React app"
	@printf "%s\n" "  make build-api      Build the .NET solution"
	@printf "%s\n" "  make build-web      Build the Vite React app"
	@printf "%s\n" "  make up             Build and start the Docker stack"
	@printf "%s\n" "  make down           Stop and remove Docker containers"
	@printf "%s\n" "  make restart        Restart the Docker stack"
	@printf "%s\n" "  make ps             Show Docker service status"
	@printf "%s\n" "  make logs           Follow all Docker logs"
	@printf "%s\n" "  make smoke          Check web, API, database status, and Keycloak"
	@printf "%s\n" "  make clean          Remove local build output"

install:
	npm install --prefix $(WEB_DIR)

build: build-api build-web

build-api:
	dotnet build $(SOLUTION)

build-web:
	npm run build --prefix $(WEB_DIR)

up:
	docker compose up --build -d

down:
	docker compose down

restart: down up

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-web:
	docker compose logs -f web

logs-keycloak:
	docker compose logs -f keycloak

logs-postgres:
	docker compose logs -f postgres

smoke:
	curl -sS $(WEB_URL) >/dev/null
	curl -sS $(API_HEALTH_URL)
	@printf "\n"
	curl -sS $(API_STATUS_URL)
	@printf "\n"
	curl -sS $(KEYCLOAK_URL) >/dev/null
	@printf "%s\n" "Smoke checks passed."

clean:
	dotnet clean $(SOLUTION)
	rm -rf $(WEB_DIR)/dist

