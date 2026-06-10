#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
LOCAL_ENV_FILE="${ROOT_DIR}/.env"

read_local_env() {
    key="$1"

    if [ ! -f "$LOCAL_ENV_FILE" ]; then
        return 0
    fi

    grep -E "^${key}=" "$LOCAL_ENV_FILE" | tail -n 1 | cut -d= -f2-
}

REMOTE_HOST="${SEANS_PLAYGROUND_LOCAL_DEV_SERVER:-$(read_local_env SEANS_PLAYGROUND_LOCAL_DEV_SERVER)}"
REMOTE_DIR="${SEANS_PLAYGROUND_REMOTE_DIR:-$(read_local_env SEANS_PLAYGROUND_REMOTE_DIR)}"
REMOTE_DOCKER_CONFIG="${SEANS_PLAYGROUND_REMOTE_DOCKER_CONFIG:-$(read_local_env SEANS_PLAYGROUND_REMOTE_DOCKER_CONFIG)}"
PUBLIC_URL="${SEANS_PLAYGROUND_PUBLIC_URL:-$(read_local_env SEANS_PLAYGROUND_PUBLIC_URL)}"
SSH_OPTS="${SEANS_PLAYGROUND_SSH_OPTS:-$(read_local_env SEANS_PLAYGROUND_SSH_OPTS)}"

REMOTE_DIR="${REMOTE_DIR:-/home/swillison/source/applications/seans-playground}"
REMOTE_DOCKER_CONFIG="${REMOTE_DOCKER_CONFIG:-/tmp/seans-playground-docker-config}"
PUBLIC_URL="${PUBLIC_URL:-https://sean.vertical-stack.com}"

if [ -z "$REMOTE_HOST" ]; then
    printf "%s\n" "SEANS_PLAYGROUND_LOCAL_DEV_SERVER is required. Set it in .env or the environment." >&2
    exit 1
fi

printf "%s\n" "Deploying Sean's Playground to ${REMOTE_HOST}:${REMOTE_DIR}"

ssh ${SSH_OPTS} "$REMOTE_HOST" \
    "REMOTE_DIR='${REMOTE_DIR}' REMOTE_DOCKER_CONFIG='${REMOTE_DOCKER_CONFIG}' sh -s" <<'REMOTE'
set -eu

mkdir -p "$REMOTE_DIR"
cd "$REMOTE_DIR"

if [ ! -f .env ]; then
    umask 077
    {
        printf "POSTGRES_DB=seans_playground\n"
        printf "POSTGRES_USER=seans_playground\n"
        printf "POSTGRES_PASSWORD="
        openssl rand -base64 30 | tr -d "\n"
        printf "\n"
        printf "KEYCLOAK_ADMIN_USERNAME=admin\n"
        printf "KEYCLOAK_ADMIN_PASSWORD="
        openssl rand -base64 30 | tr -d "\n"
        printf "\n"
        printf "WAF_NETWORK=home-coraza-waf_waf_private\n"
    } > .env
    chmod 600 .env
fi

mkdir -p "$REMOTE_DOCKER_CONFIG"
printf "{}\n" > "${REMOTE_DOCKER_CONFIG}/config.json"
REMOTE

rsync -az --delete \
    -e "ssh ${SSH_OPTS}" \
    --exclude ".git/" \
    --include ".env.example" \
    --exclude ".env" \
    --exclude ".env.*" \
    --exclude "node_modules/" \
    --exclude "bin/" \
    --exclude "obj/" \
    --exclude "dist/" \
    "${ROOT_DIR}/" "${REMOTE_HOST}:${REMOTE_DIR}/"

ssh ${SSH_OPTS} "$REMOTE_HOST" \
    "REMOTE_DIR='${REMOTE_DIR}' REMOTE_DOCKER_CONFIG='${REMOTE_DOCKER_CONFIG}' sh -s" <<'REMOTE'
set -eu

cd "$REMOTE_DIR"
DOCKER_CONFIG="$REMOTE_DOCKER_CONFIG" docker compose -f docker-compose.home.yml up --build -d
DOCKER_CONFIG="$REMOTE_DOCKER_CONFIG" docker compose -f docker-compose.home.yml ps
REMOTE

ssh ${SSH_OPTS} "$REMOTE_HOST" \
    "PUBLIC_URL='${PUBLIC_URL}' REMOTE_DIR='${REMOTE_DIR}' REMOTE_DOCKER_CONFIG='${REMOTE_DOCKER_CONFIG}' sh -s" <<'REMOTE'
set -eu

cd "$REMOTE_DIR"
DOCKER_CONFIG="$REMOTE_DOCKER_CONFIG" docker compose -f docker-compose.home.yml ps --status running >/dev/null
curl -k -fsS "${PUBLIC_URL}/health" >/dev/null
curl -k -fsS "${PUBLIC_URL}/realms/seans-playground/.well-known/openid-configuration" >/dev/null
REMOTE

curl -fsS "${PUBLIC_URL}/api/system/status"
printf "\n%s\n" "Deployment complete: ${PUBLIC_URL}"
