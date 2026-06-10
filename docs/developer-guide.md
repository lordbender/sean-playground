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
- `src/SeansPlayground.Core`: EF Core entities, DbContext, migrations, and domain constants.
- `src/SeansPlayground.Web`: Vite React frontend with Material UI.
- `infrastructure/postgres/init.sql`: Docker entrypoint no-op; application schema is EF-managed.
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
- Swagger UI: `http://localhost:5100/swagger`
- OpenAPI spec: `http://localhost:5100/swagger/v1/swagger.json`
- .NET OpenAPI document: `http://localhost:5100/openapi/v1.json`
- Keycloak: `http://localhost:8080`
- Postgres: `localhost:5432`

Run a smoke check:

```bash
make smoke
```

Run the .NET test suite:

```bash
make test
```

The .NET tests include Postgres-backed integration coverage. They start a disposable `postgres:16-alpine` container with Testcontainers, apply EF migrations, verify migration-owned seed data, and exercise the EF-backed `BackgroundService`.

Run the authenticated browser E2E check:

```bash
make e2e
```

The E2E test uses Playwright to sign in through the real Keycloak browser flow and verify the protected `Sean's Background` page. It defaults to the seeded `user` account. Override the test identity when needed:

```bash
E2E_USERNAME=friend E2E_PASSWORD=playground make e2e
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
make test
```

Runs the .NET test suite. Docker must be running because the EF integration tests use Testcontainers.

```bash
make e2e
```

Starts the local Docker stack and runs the Playwright E2E suite.

```bash
make e2e-headed
```

Runs the same E2E suite with a visible browser.

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

## Home Server Deployment

The home-prod style deployment for `https://sean.vertical-stack.com` uses:

```text
docker-compose.home.yml
```

That compose file builds the API and web images on the server, runs app Postgres and project Keycloak, and attaches web, API, and Keycloak to the existing WAF network:

```text
home-coraza-waf_waf_private
```

The WAF routes `sean.vertical-stack.com` as:

- `/realms/*`, `/resources/*`, and `/admin/*` to Keycloak.
- `/api/*` and `/health` to the ASP.NET Core API.
- Everything else to the React/nginx web container.

The deployed frontend is built with:

- API base URL: `https://sean.vertical-stack.com`
- Keycloak realm: `https://sean.vertical-stack.com/realms/seans-playground`
- Keycloak admin console: `https://sean.vertical-stack.com/admin/seans-playground/console/`

The remote application directory is:

```text
/home/swillison/source/applications/seans-playground
```

The remote `.env` file is intentionally not committed and should remain mode `600`.

Redeploy the home server stack from your local checkout:

```bash
make deploy-sacrates-cave
```

The deploy target runs `scripts/deploy-sacrates-cave.sh`. It reads the target host from the ignored local `.env` value `SEANS_PLAYGROUND_LOCAL_DEV_SERVER`, syncs the repository while excluding local secrets and build output, preserves the remote `.env`, rebuilds `docker-compose.home.yml`, and verifies the public health endpoints.

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

## API Specs

The API publishes OpenAPI specs and Swagger UI in the local Development environment:

- Swagger UI: `http://localhost:5100/swagger`
- Swagger JSON: `http://localhost:5100/swagger/v1/swagger.json`
- .NET OpenAPI JSON: `http://localhost:5100/openapi/v1.json`

The Swagger document includes a Bearer security scheme. For protected endpoints, sign in through Keycloak, copy a Keycloak access token, and use the `Authorize` button in Swagger UI.

Swagger is intentionally local/development-only unless the API environment or hosting policy is changed later.

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

Application schema and seed data are owned by EF Core migrations in:

```text
src/SeansPlayground.Core/Migrations
```

The API applies pending migrations on startup. To apply migrations directly:

```bash
dotnet ef database update \
  --project src/SeansPlayground.Core \
  --startup-project src/SeansPlayground.Api \
  --context PlaygroundDbContext
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

## EF Core Migrations

The application data model is owned by `SeansPlayground.Core.Data.PlaygroundDbContext`.
New database work should be modeled with Core entities/configurations and shipped as migrations.

Current EF-managed areas:

- `public.playground_events`
- `background.*` profile, document, social, repository, education, experience, and entitlement tables
- `nasa.apod_images`
- `nasa.donki_events`

Useful commands:

```bash
dotnet ef migrations add MigrationName \
  --project src/SeansPlayground.Core \
  --startup-project src/SeansPlayground.Api \
  --context PlaygroundDbContext

dotnet ef database update \
  --project src/SeansPlayground.Core \
  --startup-project src/SeansPlayground.Api \
  --context PlaygroundDbContext
```

The API also applies pending migrations on startup, so Docker-based local development usually only needs:

```bash
make up
```

## NASA Data

The dashboard uses NASA APOD and DONKI APIs through api.data.gov-style API keys. Put the local key in ignored `.env`:

```bash
DATA_GOV_API_KEY=your-data-gov-key
NASA_API_KEY=your-nasa-key
```

Docker maps those values into the API as `DataGov__ApiKey` and `Nasa__ApiKey`. The NASA-specific key takes precedence when both are set.

APOD uses `Nasa__BaseUrl`, which defaults to `https://api.nasa.gov`. DONKI uses `Nasa__DonkiBaseUrl`, which defaults to the CCMC backend `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get` because the `api.nasa.gov/DONKI/*` proxy may return upstream `503` errors even when the API key is valid.

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
make up
```

If Postgres already has an old volume and you want a completely fresh database, stop the stack and remove the named volume:

```bash
make down
docker volume rm seans-playground_postgres-data
make up
```

Use that reset only when you are okay losing local database changes.

If the browser tab does not show the latest favicon, hard refresh the page or clear the browser favicon cache. Browsers are surprisingly stubborn about tab icons.
