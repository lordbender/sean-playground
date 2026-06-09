# Sean's Playground

Local .NET 10 API, shared contracts, service layer, core project, Vite React frontend, Material UI dashboard, Postgres, and Keycloak.

## Projects

- `SeansPlayground.Api`: ASP.NET Core API with dashboard and system status endpoints.
- `SeansPlayground.Contracts`: shared API contracts.
- `SeansPlayground.Services`: application services.
- `SeansPlayground.Core`: core constants and domain concepts.
- `SeansPlayground.Web`: Vite React app with Material UI and Keycloak sign-in.

## Run Locally

```bash
make up
```

Then open:

- Web: http://localhost:3000
- API health: http://localhost:5100/health
- Keycloak: http://localhost:8080
- Postgres: `localhost:5432`

Keycloak admin credentials are `admin` / `admin`.

Seeded app user:

- Admin username: `sean`
- Password: `playground`

Seeded role examples:

- Admins: `sean` / `playground`
- Friends: `friend` / `playground`
- Users: `user` / `playground`

Public registration is enabled in Keycloak. Newly registered users are assigned the `Users` role by default.

## Local Development

```bash
make build
```

```bash
make install
make build-web
```

Useful commands:

- `make ps`: show running containers.
- `make logs`: follow all Docker logs.
- `make smoke`: verify web, API, database status, and Keycloak endpoints.
- `make down`: stop the local stack.
