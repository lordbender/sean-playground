# Developer Guide

This guide covers local development for Sean's Playground: the .NET API, Vite React frontend, Postgres database, Keycloak identity provider, and optional pgAdmin setup.

## Prerequisites

- Docker Desktop
- .NET SDK 10
- Node.js 24 or newer
- npm
- curl
- Optional: pgAdmin 4 Desktop, if you prefer a local desktop database GUI

## Project Layout

- `src/SeansPlayground.Api`: ASP.NET Core API.
- `src/SeansPlayground.Contracts`: shared API DTOs.
- `src/SeansPlayground.Services`: injected application services.
- `src/SeansPlayground.Core`: constants and core domain concepts.
- `src/SeansPlayground.Web`: Vite React frontend with Material UI.
- `infrastructure/postgres/init.sql`: local database schema and seed data.
- `infrastructure/keycloak/seans-playground-realm.json`: local Keycloak realm import.
- `docker-compose.yml`: local Postgres, Keycloak, API, and web stack.

## First Run

From the repository root:

```bash
cp .env.example .env
```

Update `.env` with local-only values. The current local development server target is stored as:

```text
SEANS_PLAYGROUND_LOCAL_DEV_SERVER=your-user@your-dev-host.local
```

The real `.env` file is ignored by git. Keep `.env.example` clean and commit-safe.

```bash
make up
```

Then open:

- Web: `http://localhost:3000`
- API health: `http://localhost:5100/health`
- Keycloak: `http://localhost:8080`
- Postgres: `localhost:5432`

Run a smoke check:

```bash
make smoke
```

## Local Credentials

Keycloak admin console:

- URL: `http://localhost:8080`
- Username: `admin`
- Password: `admin`

Seeded site users:

| Role | Username | Password |
| --- | --- | --- |
| Admins | `sean` | `playground` |
| Friends | `friend` | `playground` |
| Users | `user` | `playground` |

Public registration is enabled. Newly registered users receive the `Users` role by default.

## Useful Commands

```bash
make build
```

Builds the .NET solution and the Vite frontend.

```bash
make install
```

Installs frontend npm dependencies.

```bash
make ps
```

Shows Docker service status.

```bash
make logs
```

Follows all Docker logs.

```bash
make down
```

Stops the local stack.

## Running Pieces Separately

The simplest local workflow is Docker-first with `make up`. If you want to run parts manually:

1. Keep Postgres and Keycloak running with Docker.
2. Run the API from `src/SeansPlayground.Api`.
3. Run the frontend from `src/SeansPlayground.Web`.

Frontend development server:

```bash
npm run dev --prefix src/SeansPlayground.Web
```

API build:

```bash
dotnet build SeansPlayground.slnx
```

The frontend expects:

- API base URL: `http://localhost:5100`
- Keycloak realm: `http://localhost:8080/realms/seans-playground`

## Database

Postgres runs from Docker Compose.

Connection details:

- Host from your host machine: `localhost`
- Port: `5432`
- Database: `seans_playground`
- Username: `seans_playground`
- Password: `seans_playground`

Docker Compose reads these values from `.env` when present:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

The local schema and seed data live in:

```text
infrastructure/postgres/init.sql
```

The seed script is idempotent. You can apply it to the running database after editing it:

```bash
docker compose exec -T postgres psql -U seans_playground -d seans_playground -f /docker-entrypoint-initdb.d/init.sql
```

## pgAdmin Desktop Setup

Use these steps if you installed pgAdmin 4 directly on your machine.

1. Open pgAdmin 4.
2. Right-click `Servers`.
3. Select `Register` then `Server`.
4. On the `General` tab, set `Name` to `Sean's Playground Local`.
5. On the `Connection` tab, enter:

| Field | Value |
| --- | --- |
| Host name/address | `localhost` |
| Port | `5432` |
| Maintenance database | `seans_playground` |
| Username | `seans_playground` |
| Password | `seans_playground` |

6. Enable `Save password` for local convenience.
7. Click `Save`.

The seeded background data is under the `background` schema.

## pgAdmin in Docker

If you do not want to install pgAdmin locally, run pgAdmin in Docker:

```bash
docker run --name seans-playground-pgadmin \
  -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@seans-playground.local \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -d dpage/pgadmin4:latest
```

Open pgAdmin:

```text
http://localhost:5050
```

Login:

- Email: `admin@seans-playground.local`
- Password: `admin`

Register a server with these connection values:

| Field | Value |
| --- | --- |
| Host name/address | `host.docker.internal` |
| Port | `5432` |
| Maintenance database | `seans_playground` |
| Username | `seans_playground` |
| Password | `seans_playground` |

On Docker Desktop for macOS, `host.docker.internal` lets the pgAdmin container reach the Postgres port published on your host.

To stop and remove the pgAdmin container:

```bash
docker stop seans-playground-pgadmin
docker rm seans-playground-pgadmin
```

## Keycloak

The local realm import lives in:

```text
infrastructure/keycloak/seans-playground-realm.json
```

The realm is named `seans-playground`.

Important local settings:

- Public registration is enabled.
- New users receive the `Users` role.
- The application roles are `Admins`, `Friends`, and `Users`.
- The `sean` user has the `Admins` role and realm-management admin access.
- The web client uses Authorization Code with PKCE.
- The web client includes an audience mapper for `seans-playground-api`.

Docker Compose reads these Keycloak bootstrap values from `.env` when present:

- `KEYCLOAK_ADMIN_USERNAME`
- `KEYCLOAK_ADMIN_PASSWORD`

## Entitlements

The `Sean's Background` section is intentionally role-entitled through database rows:

```sql
select section_key, role_name
from background.section_entitlements
order by section_key, role_name;
```

Current allowed roles:

- `Admins`
- `Friends`
- `Users`

To change who can see the section later, update `background.section_entitlements` instead of changing React page logic.

## Troubleshooting

If a service is stale after changing Docker, rebuild:

```bash
docker compose up --build -d
```

If Postgres already has an old volume and you want a completely fresh database, stop the stack and remove the named volume:

```bash
docker compose down
docker volume rm seans-playground_postgres-data
make up
```

Use that reset only when you are okay losing local database changes.

If the browser tab does not show the latest favicon, hard refresh the page or clear the browser favicon cache. Browsers are surprisingly stubborn about tab icons.
