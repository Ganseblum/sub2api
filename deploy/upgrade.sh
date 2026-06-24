#!/usr/bin/env bash
# Pull latest git code and rebuild sub2api from source.
# Postgres/Redis volumes and deploy/.env are not touched.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"
git pull

cd "${SCRIPT_DIR}"
export COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml:docker-compose.build.yml}"

docker compose up -d --build sub2api
docker compose ps
