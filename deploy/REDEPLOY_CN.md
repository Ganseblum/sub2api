# Sub2API 重新部署指南（Git 源码构建）

本文说明如何在服务器上从 **Git 仓库源码** 重新部署 Sub2API，并避免误删数据库。

适用场景：

- 合并上游（fork 源头）后重新部署
- 从官方 Docker Hub 镜像（`weishaw/sub2api:latest`）切换为 **本地 git 构建**
- 日常更新 sub2api 程序（不动 postgres / redis 数据）

---

## 1. 部署方式说明

| 文件 | 作用 |
|------|------|
| `docker-compose.yml` | 主配置（postgres、redis、环境变量、命名卷） |
| `docker-compose.build.yml` | **仅覆盖 sub2api**：从 git 源码 `build`，镜像名为 `sub2api:latest` |
| `deploy/.env` | 数据库密码、JWT 等密钥（**必须在服务器本地保留**） |
| `upgrade.sh` | 日常更新脚本（拉代码 + 重建 sub2api，需 Compose V2） |

默认 `docker-compose.yml` 使用 `weishaw/sub2api:latest`（Docker Hub 官方镜像）。  
叠加 `docker-compose.build.yml` 后，sub2api 改为从当前 git 目录构建，**与 fork 上游合并不冲突**。

命名卷（数据持久化）示例：

- `deploy_postgres_data` — PostgreSQL 数据库
- `deploy_redis_data` — Redis 持久化
- `deploy_sub2api_data` — 应用配置与数据

卷名前缀 `deploy_` 来自 `deploy/` 目录作为 compose 项目名。

---

## 2. 首次准备（服务器只做一次）

```bash
cd /opt/sub2api-new/sub2api
git pull

cd deploy

# 确认 .env 存在（含 POSTGRES_PASSWORD 等，切勿删除或覆盖）
ls -la .env

# 确认数据卷存在
docker volume ls | grep -E 'postgres|redis|sub2api'
```

若使用 **Compose V2**，可在 `.env` 中追加（可选，方便省略 `-f` 参数）：

```bash
grep -q '^COMPOSE_FILE=' .env || \
  echo 'COMPOSE_FILE=docker-compose.yml:docker-compose.build.yml' >> .env
```

---

## 3. 完整重新部署

### 3.1 使用老版 `docker-compose`（当前可用）

```bash
cd /opt/sub2api-new/sub2api
git pull

cd deploy

# 1) 停止并清理旧容器（不加 -v）
docker-compose -f docker-compose.yml -f docker-compose.build.yml stop
docker rm -f $(docker ps -aq --filter "name=sub2api") 2>/dev/null || true
docker-compose -f docker-compose.yml -f docker-compose.build.yml down --remove-orphans

# 2) 构建并启动（postgres + redis + sub2api）
docker-compose -f docker-compose.yml -f docker-compose.build.yml up -d --build

# 3) 检查状态
docker-compose -f docker-compose.yml -f docker-compose.build.yml ps
docker inspect sub2api --format '{{.Config.Image}}'
docker-compose -f docker-compose.yml -f docker-compose.build.yml logs --tail=50 sub2api
```

期望结果：

- 三个容器均为 `Up` 或 `healthy`
- 镜像名为 `sub2api:latest`（不是 `weishaw/sub2api:latest`）

### 3.2 使用 Compose V2（推荐，见第 6 节待办）

```bash
cd /opt/sub2api-new/sub2api
git pull

cd deploy

docker compose -f docker-compose.yml -f docker-compose.build.yml down --remove-orphans
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
docker compose ps
```

若已在 `.env` 配置 `COMPOSE_FILE=docker-compose.yml:docker-compose.build.yml`：

```bash
cd /opt/sub2api-new/sub2api/deploy
docker compose up -d --build
docker compose ps
```

---

## 4. 日常更新（仅重建 sub2api，不动数据库）

合并上游或 `git pull` 后：

### 老版 docker-compose

```bash
cd /opt/sub2api-new/sub2api
git pull

cd deploy
docker-compose -f docker-compose.yml -f docker-compose.build.yml up -d --build sub2api
```

### Compose V2

```bash
cd /opt/sub2api-new/sub2api/deploy
./upgrade.sh
```

或：

```bash
cd /opt/sub2api-new/sub2api
git pull
cd deploy
docker compose up -d --build sub2api
```

**说明：** 只更新 sub2api 容器；postgres / redis 及其命名卷 **不会被删除或重建**。

---

## 5. 合并 fork 源头后的流程

```bash
cd /opt/sub2api-new/sub2api

# 若已配置 upstream 远程
git fetch upstream
git merge upstream/main
# 或直接：git pull（从你的 fork）

cd deploy
# 然后按第 4 节「日常更新」执行
docker-compose -f docker-compose.yml -f docker-compose.build.yml up -d --build sub2api
```

**无需重新设置：**

- `docker-compose.build.yml` 在你的 git 仓库中，合并后仍在
- `deploy/.env` 在服务器本地，不会被 git 覆盖
- 命名卷独立于容器，合并/重建容器 **不会清空数据库**

**不要重新运行：**

- `docker-deploy.sh` 或 `curl ... docker-deploy.sh | bash`  
  会从 GitHub 官方下载默认 compose，覆盖本地 git 配置。

---

## 6. 严禁操作（会导致数据丢失或无法登录）

| 命令 / 操作 | 后果 |
|-------------|------|
| `docker-compose down -v` 或 `docker compose down -v` | **删除命名卷，PostgreSQL 数据库永久丢失** |
| `docker volume rm deploy_postgres_data` | **同上，数据库永久丢失** |
| 重新运行 `docker-deploy.sh` 并覆盖 `.env` | 可能生成新密码，与已有数据库认证不一致，导致无法连接 |
| 修改 `.env` 中的 `POSTGRES_PASSWORD` | 卷内仍是旧密码，应用无法连接数据库 |
| 修改 `POSTGRES_USER` / `POSTGRES_DB` | 可能连错库或初始化失败 |
| 在未备份情况下删除 `deploy/.env` | 丢失 JWT/TOTP/数据库密码，可能导致无法登录或需手动恢复 |

### 相对安全的操作

| 命令 | 说明 |
|------|------|
| `docker-compose stop` / `docker compose stop` | 仅停止容器，数据在卷中 |
| `docker rm <容器名>` | 仅删除容器，**不删卷** |
| `docker-compose down`（**无 `-v`**） | 删除容器和网络，**保留命名卷** |
| `docker-compose up -d --build` | 重建容器并挂载原卷，数据库保留 |

### 备份建议（重大操作前）

```bash
# 备份 .env
cp deploy/.env deploy/.env.backup.$(date +%Y%m%d)

# 备份 postgres 卷（示例）
docker run --rm \
  -v deploy_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz -C /data .
```

---

## 7. 常见问题

### 7.1 `Invalid interpolation format`（redis command）

Docker Compose 会把 `${...}` 当变量解析。redis 启动命令中的 shell 语法需写成 `$$`：

```yaml
$${REDIS_PASSWORD:+--requirepass "$$REDIS_PASSWORD"}
```

请确保服务器上的 `docker-compose.yml` 已从 git 拉取最新版本。

### 7.2 `KeyError: 'ContainerConfig'`

老版 `docker-compose` 1.29.x 与新 Docker Engine 不兼容，在 **Recreating** 容器时触发。

**临时处理：**

```bash
docker rm -f $(docker ps -aq --filter "name=sub2api") 2>/dev/null || true
docker-compose -f docker-compose.yml -f docker-compose.build.yml down --remove-orphans
docker-compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

**永久处理：** 见第 8 节 Compose V2 升级待办。

### 7.3 容器名带 hash 前缀（如 `4be4ea0d6c16_sub2api-postgres`）

上次 recreate 失败留下的残留容器，需先删除再 `up`：

```bash
docker rm -f $(docker ps -aq --filter "name=sub2api") 2>/dev/null || true
```

### 7.4 确认当前跑的是 git 构建还是官方镜像

```bash
docker inspect sub2api --format '{{.Config.Image}}'
docker images | grep sub2api
```

- `weishaw/sub2api:latest` → Docker Hub 官方镜像
- `sub2api:latest` 且 LOCAL 有 BUILD 记录 → git 源码构建

---

## 8. 待办：升级 Docker Compose V2

> **状态：待完成**  
> 当前服务器若仍为 `docker-compose` 1.29.2，建议尽快升级，以永久解决 `ContainerConfig` 等问题。

### 8.1 检查当前版本

```bash
docker compose version    # V2（期望有输出）
docker-compose --version  # 老版（如 1.29.2）
```

### 8.2 手动安装 V2 插件

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins

sudo curl -SL "https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose

sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

docker compose version
```

ARM 服务器将 URL 中的 `x86_64` 改为 `aarch64`（先执行 `uname -m` 确认）。

### 8.3 可选：让 `docker-compose` 命令也走 V2

```bash
sudo apt-get remove -y docker-compose 2>/dev/null || true
echo 'docker compose "$@"' | sudo tee /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 8.4 升级后部署命令变更

| 老版 | V2 |
|------|-----|
| `docker-compose` | `docker compose`（空格） |
| `-f a.yml -f b.yml` | 相同，或在 `.env` 设 `COMPOSE_FILE` |
| `./upgrade.sh` | 直接使用（脚本内为 `docker compose`） |

升级完成后，日常更新：

```bash
cd /opt/sub2api-new/sub2api/deploy
./upgrade.sh
```

---

## 9. 命令速查

```bash
# 完整重部署（老版 compose）
cd /opt/sub2api-new/sub2api && git pull && cd deploy
docker-compose -f docker-compose.yml -f docker-compose.build.yml down --remove-orphans
docker-compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
docker-compose -f docker-compose.yml -f docker-compose.build.yml ps

# 仅更新 sub2api
docker-compose -f docker-compose.yml -f docker-compose.build.yml up -d --build sub2api

# 查看日志
docker-compose -f docker-compose.yml -f docker-compose.build.yml logs -f sub2api

# 重启 sub2api（不 rebuild）
docker-compose -f docker-compose.yml -f docker-compose.build.yml restart sub2api
```

---

## 10. 相关文件

| 文件 | 说明 |
|------|------|
| `deploy/docker-compose.yml` | 主 compose（可与上游合并） |
| `deploy/docker-compose.build.yml` | git 源码构建覆盖层 |
| `deploy/upgrade.sh` | V2 日常更新脚本 |
| `deploy/.env.example` | 环境变量模板（勿直接覆盖已有 `.env`） |
| `deploy/README.md` | 通用部署说明 |
