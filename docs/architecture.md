# Architecture

Sean's Playground is a locally hosted .NET and React application that can run fully on a workstation with Docker Compose, or on the home server behind Cloudflare and the Coraza WAF.

## Runtime Topology

```text
Internet users
    |
    v
Cloudflare
    - DNS for sean.vertical-stack.com
    - TLS edge and public ingress
    - Routes traffic to the home server
    |
    v
Home server: sacrates-cave.local
    |
    v
Coraza WAF / Caddy reverse proxy container
    - Terminates the home-server side of public routing
    - Applies WAF policy before traffic reaches app containers
    - Routes sean.vertical-stack.com to Sean's Playground
    - Routes eyes.vertical-stack.com to Grafana
    |
    +-----------------------------+
    | Docker networks             |
    |                             |
    | waf_private                 |
    |   - WAF-facing app aliases  |
    |                             |
    | seans-playground app        |
    |   - API                     |
    |   - Web                     |
    |   - Postgres                |
    |   - Keycloak                |
    |                             |
    | Grafana stack               |
    |   - Grafana at             |
    |     eyes.vertical-stack.com |
    +-----------------------------+
```

## Application Stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | Vite, React, TypeScript, Material UI | Authenticated dashboard shell, APOD/DONKI views, background/resume pages, markdown docs viewer |
| API | ASP.NET Core | REST endpoints, JWT validation, health checks, NASA dashboard API, registration API |
| Contracts | C# shared contracts project | Typed API response/request models shared by services and API |
| Services | C# service project | NASA ingestion, dashboard reads, Keycloak user creation, background/profile reads |
| Core | C# core project | EF Core entities, DbContext, migrations, domain constants |
| Database | Postgres 16 | Application data, APOD binary image storage, DONKI event payloads, profile/background data |
| Identity Provider | Keycloak | OIDC login, realm roles, local registration, admin/friend/user roles |
| Reverse Proxy / WAF | Caddy with Coraza WAF | Public routing and WAF policy before requests reach app containers |
| Edge | Cloudflare | Public DNS, TLS edge, internet-facing traffic management |
| Observability | Grafana on the home server | Home-server dashboards exposed separately at `eyes.vertical-stack.com` |

## Request Flow

### Web Application

```text
Browser
  -> Cloudflare
  -> Coraza WAF / Caddy
  -> seans-playground-web container
  -> static React bundle
```

The React app then calls API endpoints from the browser:

```text
Browser
  -> Cloudflare
  -> Coraza WAF / Caddy
  -> seans-playground-api container
  -> Postgres / Keycloak / external NASA APIs as needed
```

### Authentication

```text
Browser
  -> Keycloak realm through sean.vertical-stack.com
  -> OIDC authorization code with PKCE
  -> React app stores the OIDC user locally
  -> API receives bearer tokens for protected endpoints
```

The user roles are realm roles:

- `Admins`
- `Friends`
- `Users`

Admin users can open the Keycloak admin console from the profile menu. Public registration creates users through the app's registration endpoint and assigns the `Users` role.

## NASA Data Flow

APOD and DONKI data are fetched by a hosted background service in `SeansPlayground.Services`.

```text
NasaDailyIngestionHostedService
  -> APOD via https://api.nasa.gov/planetary/apod
  -> image download from the APOD media URL
  -> Postgres nasa.apod_images, including image bytea

NasaDailyIngestionHostedService
  -> DONKI via https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/{eventType}
  -> Postgres nasa.donki_events, including raw JSON payload
```

The dashboard reads from Postgres, not directly from NASA. This keeps page loads fast, avoids leaking API keys to the browser, and lets the app survive NASA API outages with the most recently stored data.

DONKI uses the CCMC backend directly because the `api.nasa.gov/DONKI/*` proxy can return upstream `503` responses even with a valid API key.

## Database Model

The app now has an EF Core application context:

```text
SeansPlayground.Core.Data.PlaygroundDbContext
```

The current EF-managed schema is:

```text
nasa.apod_images
nasa.donki_events
```

Older background/resume tables still exist from the initial Postgres bootstrap script. They should be pulled into EF with a baseline migration before making larger model changes.

## Deployment Shape

Local development uses:

```bash
docker compose up --build -d
```

Home-server deployment uses:

```bash
make deploy-sacrates-cave
```

The deploy target syncs the repository to:

```text
/home/swillison/source/applications/seans-playground
```

It preserves the remote `.env`, rebuilds `docker-compose.home.yml`, and verifies the public health endpoints.

## Public Endpoints

| Endpoint | Purpose |
| --- | --- |
| `https://sean.vertical-stack.com/` | Sean's Playground web app |
| `https://sean.vertical-stack.com/api/system/status` | App/database/identity status |
| `https://sean.vertical-stack.com/api/nasa/dashboard` | APOD metadata and DONKI dashboard data |
| `https://sean.vertical-stack.com/api/nasa/apod/latest/image` | Latest stored APOD image bytes |
| `https://eyes.vertical-stack.com/` | Grafana stack on the same home server |

## Operational Notes

- Cloudflare is the internet-facing edge for the public hostnames.
- Coraza WAF is part of the home-server ingress path before app containers.
- Grafana is hosted on the same server as a separate Docker stack and is routed through the same public ingress pattern.
- Secrets live in `.env` files and are not committed.
- APOD images are stored as binary data in Postgres daily.
- DONKI event records are idempotently stored by event type and external event ID.
