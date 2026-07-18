# Sub2API 生产环境部署 + S3 备份同步指南

> 本文档面向 Ubuntu 22.04/24.04 LTS 服务器，使用 Docker Compose 部署 Sub2API 完整生产环境，并配置 S3 兼容对象存储实现数据库备份同步。

---

## 目录

1. [环境准备](#一环境准备)
2. [系统初始化与安全加固](#二系统初始化与安全加固)
3. [安装 Docker](#三安装-docker)
4. [部署 Sub2API](#四部署-sub2api)
5. [反向代理与 HTTPS](#五反向代理与-https)
6. [S3 备份同步配置](#六s3-备份同步配置)
7. [备份与恢复](#七备份与恢复)
8. [日常运维](#八日常运维)
9. [监控与告警](#九监控与告警)
10. [故障排查](#十故障排查)
11. [禁止操作与数据安全](#十一禁止操作与数据安全)
12. [附录：软件包说明](#附录软件包说明)
13. [附录：常用命令速查](#附录常用命令速查)

---

## 一、环境准备

### 1.1 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核 | 4 核及以上 |
| 内存 | 4 GB | 8 GB 及以上 |
| 磁盘 | 40 GB SSD | 100 GB SSD 及以上 |
| 系统 | Ubuntu 22.04/24.04 LTS | Ubuntu 24.04 LTS |
| 网络 | 公网 IP | 公网 IP + 域名 |

### 1.2 需要开放的端口

| 端口 | 用途 | 是否必须 |
|------|------|---------|
| 22 | SSH | 是（建议改为非标准端口） |
| 80 | HTTP / ACME 验证 | 是（如果使用 HTTPS） |
| 443 | HTTPS | 是（生产环境强烈建议） |
| 8080 | Sub2API 服务端口 | 可选（仅当不通过反向代理暴露时） |

---

## 二、系统初始化与安全加固

### 2.1 更新系统

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget vim unzip htop git ca-certificates gnupg ufw fail2ban
```

### 2.1.1 这些软件包是做什么的？

| 包名 | 作用说明 |
|------|---------|
| `curl` | 命令行 HTTP 客户端，用于下载脚本、测试接口 |
| `wget` | 文件下载工具 |
| `vim` | 文本编辑器，用于修改配置文件 |
| `unzip` | 解压 `.zip` 文件 |
| `htop` | 交互式进程查看器，比 `top` 更易用 |
| `git` | 版本控制工具，用于拉取 Sub2API 代码 |
| `ca-certificates` | SSL/TLS 根证书，确保 HTTPS 连接可信 |
| `gnupg` | GPG 签名验证工具，安装 Docker 等第三方软件源时验证包签名 |
| `ufw` | Uncomplicated Firewall，简化的防火墙管理工具 |
| `fail2ban` | 防止暴力破解（如 SSH、HTTP 登录），自动封禁异常 IP |

> 这些包都属于系统基础工具，不运行额外服务（除 `ufw`、`fail2ban` 外），对性能影响极小。

### 2.2 设置时区

```bash
sudo timedatectl set-timezone Asia/Shanghai
sudo timedatectl set-ntp true
```

### 2.3 调整文件句柄上限

```bash
echo "ubuntu soft nofile 1048576" | sudo tee -a /etc/security/limits.conf
echo "ubuntu hard nofile 1048576" | sudo tee -a /etc/security/limits.conf
```

**重新 SSH 登录后验证：**

```bash
ulimit -n
# 应输出 1048576
```

### 2.4 配置 UFW 防火墙

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # 如果修改了 SSH 端口，请相应调整
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# sudo ufw allow 8080/tcp  # 如果不使用反向代理，直接暴露 8080
sudo ufw --force enable
sudo ufw status numbered
```

### 2.5 启用 fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban --now
sudo fail2ban-client status sshd
```

### 2.6 自动安全更新

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

选择 **Yes**。

### 2.7 SSH 加固（可选但强烈建议）

```bash
sudo nano /etc/ssh/sshd_config
```

修改：

```ini
Port 2222                  # 改成非 22 端口
PermitRootLogin no
PasswordAuthentication no  # 确保已配置 SSH 密钥登录后再启用
MaxAuthTries 3
```

```bash
sudo systemctl restart sshd
```

> ⚠️ 启用 `PasswordAuthentication no` 前，务必确认你能用密钥登录，否则会把自己锁在服务器外。

---

## 三、安装 Docker

```bash
# 添加 Docker 官方 GPG 密钥和软件源
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 将当前用户加入 docker 组
sudo usermod -aG docker $USER
```

**退出并重新登录后验证：**

```bash
docker -v
docker compose version
```

### 配置 Docker 镜像加速（中国大陆服务器建议）

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://docker.1panel.live",
    "https://dockerpull.org"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

## 四、部署 Sub2API

### 4.1 创建部署目录

推荐将项目放在 `/opt` 下，便于后续 systemd/docker 维护：

```bash
sudo mkdir -p /opt/sub2api
sudo chown $USER:$USER /opt/sub2api
cd /opt/sub2api
```

### 4.2 克隆代码

```bash
# 使用你自己的 Fork（推荐）
git clone https://github.com/Ganseblum/sub2api.git .

# 或者使用上游仓库
# git clone https://github.com/Wei-Shaw/sub2api.git .
```

### 4.3 配置环境变量

```bash
cd deploy
cp .env.example .env
chmod 600 .env
```

生成固定密钥（**必须**，否则每次重启后登录态会失效）：

```bash
JWT_SECRET=$(openssl rand -hex 32)
TOTP_ENCRYPTION_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 32)

sed -i "s/^BIND_HOST=.*/BIND_HOST=127.0.0.1/" .env
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
sed -i "s/^TOTP_ENCRYPTION_KEY=.*/TOTP_ENCRYPTION_KEY=${TOTP_ENCRYPTION_KEY}/" .env
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASSWORD}/" .env
```

编辑 `.env` 中的关键项：

```bash
nano .env
```

| 变量 | 建议值 | 说明 |
|------|--------|------|
| `BIND_HOST` | `127.0.0.1` | 使用反向代理时不要向公网暴露 8080 |
| `POSTGRES_PASSWORD` | 已自动生成 | 必须固定，勿用默认值 |
| `REDIS_PASSWORD` | 可留空 | 非空时 Compose 会同步配置 Redis、应用和健康检查 |
| `JWT_SECRET` | 已自动生成 | 必须固定 |
| `TOTP_ENCRYPTION_KEY` | 已自动生成 | 必须固定，否则 2FA 失效 |
| `ADMIN_EMAIL` | 你的邮箱 | 默认 `admin@sub2api.local` |
| `ADMIN_PASSWORD` | 强密码 | 留空则首次启动自动生成 |
| `SERVER_PORT` | 8080 | 宿主机映射端口 |
| `TZ` | Asia/Shanghai | 时区 |

> **重要**：如果 `ADMIN_PASSWORD` 留空，首次启动后需在日志中查找自动生成的密码：
> ```bash
> docker compose -f docker-compose.local.yml logs sub2api | grep "admin password"
> ```

### 4.4 启动服务

使用 `docker-compose.local.yml`（本地源码构建 + 本地目录挂载，便于备份迁移）：

```bash
cd /opt/sub2api/deploy

# 构建并启动（会从 /opt/sub2api/Dockerfile 构建你自己的代码）
docker compose -f docker-compose.local.yml up -d --build
```

> 说明：`docker-compose.local.yml` 会从当前 Git 工作区构建 `sub2api:local` 镜像，不会拉取上游官方镜像。如果你不想构建、只想用上游官方镜像，请使用 `docker-compose.yml`。

查看启动日志：

```bash
docker compose -f docker-compose.local.yml logs -f sub2api
```

等待日志出现 `Server started on 0.0.0.0:8080` 后，按 `Ctrl+C` 退出日志跟踪。

### 4.5 验证部署

```bash
# 查看容器状态
docker compose -f docker-compose.local.yml ps

# 健康检查
curl http://localhost:8080/health
# 应返回 {"status":"ok"}

# 检查数据库
docker compose -f docker-compose.local.yml exec postgres pg_isready

# 检查 Redis
docker compose -f docker-compose.local.yml exec redis redis-cli ping
```

---

## 五、反向代理与 HTTPS

推荐使用 **Caddy** 自动 HTTPS，配置最简单。

### 5.1 安装 Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### 5.2 配置 Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

```
your-domain.com {
    reverse_proxy localhost:8080
    encode gzip zstd
}
```

```bash
sudo systemctl reload caddy
```

Caddy 会自动申请并续期 Let's Encrypt 证书。

### 5.3 使用 Nginx 的备选配置

如果你更习惯 Nginx，推荐配合 **Certbot** 自动申请 Let's Encrypt 证书：

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Sub2API 会使用带下划线的请求头（例如 `session_id`）。在 Nginx 主配置 `/etc/nginx/nginx.conf` 的 `http` 块中加入：

```nginx
underscores_in_headers on;
```

#### 方案 A：配置文件放在 `/etc/nginx/conf.d/`（推荐，管理方便）

```bash
sudo nano /etc/nginx/conf.d/sub2api.conf
```

```nginx
server {
    listen 80;
    server_name ai.youc.online;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ai.youc.online;

    # SSL 证书路径（Certbot 会自动管理）
    ssl_certificate /etc/letsencrypt/live/ai.youc.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai.youc.online/privkey.pem;

    # 上传文件大小限制，Sub2API 可能需要处理较大请求体
    client_max_body_size 500M;

    # 长连接/流式响应优化
    proxy_buffering off;
    proxy_cache off;
    gzip off;
    chunked_transfer_encoding on;

    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 申请并自动配置 HTTPS 证书
sudo certbot --nginx -d ai.youc.online

# 测试并重载
sudo nginx -t
sudo systemctl reload nginx
```

#### 方案 B：配置文件放在 `/etc/nginx/sites-available/`

```bash
sudo nano /etc/nginx/sites-available/sub2api
```

配置内容与方案 A 相同，然后启用：

```bash
sudo ln -s /etc/nginx/sites-available/sub2api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 如果你的 Nginx 还代理 WebSocket 服务

比如同时有另一个服务跑在 `127.0.0.1:3001`（如 s2a-manager），增加一段：

```nginx
server {
    listen 443 ssl http2;
    server_name s2a.youc.online;

    ssl_certificate /etc/letsencrypt/live/s2a.youc.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/s2a.youc.online/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

```bash
sudo certbot --nginx -d s2a.youc.online
```

### 5.4 Nginx 配置关键参数说明

| 参数 | 作用 | 建议值 |
|------|------|--------|
| `client_max_body_size 500M` | 允许客户端上传最大 500MB 的请求体 | 根据业务调整，Sub2API 建议 500M 起步 |
| `proxy_buffering off` | 关闭后端响应缓冲，适合流式输出 | 关闭 |
| `proxy_cache off` | 关闭代理缓存 | 关闭 |
| `gzip off` | 关闭 gzip，避免与流式响应冲突 | 关闭 |
| `chunked_transfer_encoding on` | 支持分块传输 | 开启 |
| `proxy_read_timeout 600s` | 后端读取超时时间 | 600s 或更长 |
| `proxy_send_timeout 600s` | 后端发送超时时间 | 600s 或更长 |
| `proxy_http_version 1.1` | 使用 HTTP/1.1 保持长连接 | 1.1 |

---

## 六、S3 备份同步配置

Sub2API 支持将 PostgreSQL 数据库备份自动上传到 **S3 兼容对象存储**，支持 Cloudflare R2、AWS S3、阿里云 OSS、MinIO 等。

> 管理后台“数据管理”功能需要额外部署宿主机 `datamanagementd`。Docker Socket、权限和服务配置见 [DATAMANAGEMENTD_CN.md](./DATAMANAGEMENTD_CN.md)。

### 6.1 支持的 S3 服务商配置示例

#### Cloudflare R2（推荐）

| 字段 | 值 |
|------|-----|
| Endpoint | `https://<account_id>.r2.cloudflarestorage.com` |
| Region | `auto` |
| Bucket | 你创建的 bucket 名称 |
| Prefix | `backups/` |
| Force Path Style | 不勾选 |

#### AWS S3

| 字段 | 值 |
|------|-----|
| Endpoint | 留空 |
| Region | `ap-northeast-1` 或你的区域 |
| Bucket | 你的 bucket 名称 |
| Prefix | `backups/` |
| Force Path Style | 不勾选 |

#### 阿里云 OSS

| 字段 | 值 |
|------|-----|
| Endpoint | `https://oss-cn-hangzhou.aliyuncs.com` |
| Region | `cn-hangzhou` |
| Bucket | 你的 bucket 名称 |
| Prefix | `backups/` |
| Force Path Style | **勾选** |

#### MinIO / 自托管 S3

| 字段 | 值 |
|------|-----|
| Endpoint | `https://minio.example.com` |
| Region | `us-east-1` 或你的区域 |
| Bucket | 你的 bucket 名称 |
| Prefix | `backups/` |
| Force Path Style | **勾选** |

### 6.2 在管理后台配置 S3

1. 使用管理员账号登录 Sub2API
2. 进入 **管理后台** → **数据管理** → **备份管理**
3. 找到 **S3 存储配置** 区域
4. 填写上表对应参数
5. 点击 **测试连接**，确认能访问 bucket
6. 点击 **保存**

### 6.3 配置定时自动备份

在管理后台同一页面配置定时任务：

| 字段 | 建议值 | 说明 |
|------|--------|------|
| 启用定时备份 | 勾选 | |
| Cron 表达式 | `0 2 * * *` | 每天凌晨 2 点 |
| 保留天数 | 14 | 14 天后自动清理 |
| 保留份数 | 10 | 最多保留 10 份 |

> Cron 表达式说明：`0 2 * * *` = 每天 02:00。

### 6.4 权限最小化原则

为 Sub2API 备份单独创建一个 IAM/Access Key，只授予目标 bucket 的最小权限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/backups/*"
      ]
    }
  ]
}
```

---

## 七、备份与恢复

### 7.1 手动立即备份

在管理后台 **备份管理** 页面：

1. 设置 **过期天数**（0 = 永不过期）
2. 点击 **立即备份**
3. 等待状态变为 `completed`

### 7.2 从备份恢复

> ⚠️ 恢复会覆盖当前数据库，操作前请确认。

1. 在备份列表中找到目标备份
2. 点击 **恢复**
3. 输入管理员密码确认
4. 等待恢复完成

### 7.3 下载备份文件

点击备份记录右侧的 **下载**，系统会生成一个 1 小时有效的预签名 URL。

### 7.4 完整服务器迁移（含本地数据）

迁移期间不要让新旧实例同时接受写请求，否则用户、令牌、余额和用量数据会分叉。推荐提前降低 DNS TTL，并安排短维护窗口。

#### 7.4.1 确认旧服务器部署方式

```bash
docker compose ls
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

以下命令默认旧服务器位于 `/opt/sub2api/deploy`，并使用 `docker-compose.local.yml`。如果实际使用 `docker-compose.yml`，修改 `COMPOSE_FILE` 即可。数据库采用逻辑备份，不依赖底层是本地目录还是命名卷。

#### 7.4.2 旧服务器最终备份并停服

先停止应用写入，保留 PostgreSQL 运行以生成一致的逻辑备份：

```bash
cd /opt/sub2api/deploy
export COMPOSE_FILE=docker-compose.local.yml
export BACKUP_ID="$(date +%Y%m%d_%H%M%S)"
export BACKUP_DIR="$HOME/sub2api-migration-$BACKUP_ID"
mkdir -p "$BACKUP_DIR/data" "$BACKUP_DIR/redis_data"

docker compose -f "$COMPOSE_FILE" stop sub2api

docker compose -f "$COMPOSE_FILE" exec -T postgres sh -c \
  'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "$BACKUP_DIR/database.sql.gz"
```

数据库备份成功后，停止依赖服务并从容器导出应用和 Redis 数据：

```bash
docker compose -f "$COMPOSE_FILE" stop postgres redis
docker cp sub2api:/app/data/. "$BACKUP_DIR/data/"
docker cp sub2api-redis:/data/. "$BACKUP_DIR/redis_data/"
cp .env "$BACKUP_DIR/.env"

docker compose -f "$COMPOSE_FILE" down

sudo tar -C "$BACKUP_DIR" -czf "$HOME/sub2api-migration-$BACKUP_ID.tar.gz" .
sudo chown "$USER":"$USER" "$HOME/sub2api-migration-$BACKUP_ID.tar.gz"
sha256sum "$HOME/sub2api-migration-$BACKUP_ID.tar.gz"
```

`down` 会移除容器和网络，但保留原数据。不要执行 `down -v`，也不要删除旧服务器，直到新服务器稳定运行并完成异地备份。

传输备份：

```bash
scp "$HOME/sub2api-migration-$BACKUP_ID.tar.gz" root@新服务器IP:/tmp/
```

#### 7.4.3 新服务器从自己的 Git 仓库恢复

新服务器完成前三章的系统与 Docker 安装后，拉取自己的代码：

```bash
sudo git clone https://github.com/Ganseblum/sub2api.git /opt/sub2api
sudo chown -R "$USER":"$USER" /opt/sub2api
```

解压迁移包并恢复旧服务器配置和运行时数据：

```bash
export BACKUP_FILE=/tmp/sub2api-migration-YYYYMMDD_HHMMSS.tar.gz
export RESTORE_DIR=/tmp/sub2api-restore

sudo mkdir -p "$RESTORE_DIR"
sudo tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

cd /opt/sub2api/deploy
sudo cp "$RESTORE_DIR/.env" .env
sudo mkdir -p data redis_data postgres_data
sudo cp -a "$RESTORE_DIR/data/." data/
sudo cp -a "$RESTORE_DIR/redis_data/." redis_data/
sudo chown "$USER":"$USER" .env
chmod 600 .env
```

迁移时必须使用旧服务器的 `.env`，不要重新生成 `POSTGRES_PASSWORD`、`JWT_SECRET` 或 `TOTP_ENCRYPTION_KEY`。

先初始化新的 PostgreSQL 容器：

```bash
docker compose -f docker-compose.local.yml up -d postgres
docker compose -f docker-compose.local.yml ps postgres
```

确认 PostgreSQL 状态为 `healthy` 后恢复数据库：

```bash
gzip -dc "$RESTORE_DIR/database.sql.gz" | \
  docker compose -f docker-compose.local.yml exec -T postgres sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

构建自己的代码并启动服务：

```bash
cd /opt/sub2api
git status --short --branch
git pull --ff-only origin main

cd deploy
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs --tail=100 sub2api
curl -fsS http://127.0.0.1:8080/health
```

#### 7.4.4 切换域名与保留回滚点

1. 在新服务器恢复 Caddy/Nginx 配置，反向代理到 `127.0.0.1:8080`。
2. 用临时域名或本地 `hosts` 验证登录、后台数据和实际 API 调用。
3. 将 DNS A/AAAA 记录切换到新服务器。
4. 从外部检查 `https://你的域名/health` 和实际 API 请求。
5. 旧服务器保持停服至少 24 小时，确认无误后再下线。

需要回切时，先停止新服务器应用，恢复旧服务器容器，再把 DNS 指回旧服务器。不要让两边同时接受写入。

---

## 八、日常运维

### 8.1 更新 Sub2API

更新前先确认工作区没有服务器手工修改，并查看将要拉取的提交：

```bash
cd /opt/sub2api
git status --short
git fetch origin
git log --oneline HEAD..origin/main
```

如果 `git status --short` 有输出，先保存或提交这些修改，不要直接覆盖。然后备份数据库并更新：

```bash
cd /opt/sub2api/deploy
docker compose -f docker-compose.local.yml exec -T postgres sh -c \
  'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "$HOME/sub2api-before-update-$(date +%Y%m%d_%H%M%S).sql.gz"

cd /opt/sub2api
git pull --ff-only origin main

cd deploy
docker compose -f docker-compose.local.yml build --pull sub2api
docker compose -f docker-compose.local.yml up -d --no-deps sub2api
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs --tail=100 sub2api
curl -fsS http://127.0.0.1:8080/health
```

`--no-deps` 只重建应用容器，不重建 PostgreSQL 和 Redis。应用启动时会自动执行尚未应用的数据库迁移。

如果新版无法启动，可临时切换到上一个已知可用提交并重新构建：

```bash
cd /opt/sub2api
git log --oneline -10
git switch --detach <上一个可用commit>

cd deploy
docker compose -f docker-compose.local.yml up -d --build --no-deps sub2api
```

下次更新前先执行 `git switch main`。数据库迁移是前向执行的；如果旧代码与新数据库结构不兼容，需要停服并恢复更新前的数据库备份，不能只回退 Git。

### 8.2 查看日志

```bash
cd /opt/sub2api/deploy

# 实时日志
docker compose -f docker-compose.local.yml logs -f sub2api

# 最近 100 行
docker compose -f docker-compose.local.yml logs --tail=100 sub2api

# Caddy 日志
sudo journalctl -u caddy -f
```

### 8.3 重启服务

```bash
cd /opt/sub2api/deploy
docker compose -f docker-compose.local.yml restart sub2api
```

### 8.4 备份 `.env` 文件

```bash
cd /opt/sub2api/deploy
cp .env .env.backup.$(date +%Y%m%d)
```

---

## 九、监控与告警

### 9.1 安装 Netdata（可选）

```bash
curl https://get.netdata.cloud/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh
```

访问 `http://your-server-ip:19999`。

### 9.2 健康检查脚本

创建 `/opt/sub2api/healthcheck.sh`：

```bash
#!/bin/bash
if ! curl -fsS http://localhost:8080/health > /dev/null; then
  echo "$(date): Sub2API health check failed" >> /var/log/sub2api-healthcheck.log
  cd /opt/sub2api/deploy
  docker compose -f docker-compose.local.yml restart sub2api
fi
```

```bash
chmod +x /opt/sub2api/healthcheck.sh
```

添加到 crontab：

```bash
crontab -e
```

```
*/5 * * * * /opt/sub2api/healthcheck.sh
```

---

## 十、故障排查

### 10.1 容器无法启动

```bash
cd /opt/sub2api/deploy
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs --tail=200 sub2api
```

### 10.2 数据库连接失败

- 检查 `.env` 中 `POSTGRES_PASSWORD` 是否正确
- 确认 PostgreSQL 容器已启动：
  ```bash
  docker compose -f docker-compose.local.yml exec postgres pg_isready
  ```
- 如果数据库已经初始化后误改了 `POSTGRES_PASSWORD`，先恢复旧 `.env` 中的密码。需要轮换密码时，应在 PostgreSQL 内执行 `ALTER ROLE`，再同步更新 `.env`；不要通过删除数据目录解决密码不一致。

### 10.3 Redis healthcheck 失败

当前 Compose 会把 `REDIS_PASSWORD` 同时传给 Redis、应用和 healthcheck。先检查最终配置和日志：

```bash
docker compose -f docker-compose.local.yml config --quiet
docker compose -f docker-compose.local.yml logs --tail=100 redis sub2api
```

`REDIS_PASSWORD` 可以留空，也可以设置非空密码；修改后需要同时重建 Redis 和应用容器：

```bash
docker compose -f docker-compose.local.yml up -d --force-recreate redis sub2api
```

### 10.4 登录态每次重启后失效

原因：`JWT_SECRET` 为空，每次启动随机生成。

解决：

```bash
cd /opt/sub2api/deploy
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
docker compose -f docker-compose.local.yml up -d
```

### 10.5 2FA 失效

原因：`TOTP_ENCRYPTION_KEY` 为空。

解决方式同上，固定 `TOTP_ENCRYPTION_KEY`。

### 10.6 S3 备份失败

- 检查 Endpoint、Region、Bucket、Access Key、Secret Key 是否正确
- 确认 IAM 权限包含 `s3:PutObject`、`s3:GetObject`、`s3:DeleteObject`、`s3:ListBucket`
- 阿里云 OSS 需要勾选 **Force Path Style**
- 查看日志：
  ```bash
  docker compose -f docker-compose.local.yml logs --tail=200 sub2api | grep -i backup
  ```

### 10.7 端口被占用

如果 8080 被其他服务占用，修改 `.env`：

```bash
SERVER_PORT=8090
```

然后同步修改 Caddy/Nginx 的 `proxy_pass` 端口。

---

## 十一、禁止操作与数据安全

> ⚠️ **本节是文档中最重要的部分之一。生产环境的数据是核心资产，任何误操作都可能导致服务不可用或数据永久丢失。**

### 11.1 绝对禁止的操作

以下操作**严禁**在生产环境直接执行，除非你已经完整理解其后果并做好了异地备份：

| 禁止操作 | 后果 | 正确做法 |
|---------|------|---------|
| `docker compose -f docker-compose.local.yml down -v` | 删除命名卷，PostgreSQL 和 Redis 数据**永久丢失** | 如需清理，先完整备份 `.env`、源码目录和数据目录 |
| `rm -rf /opt/sub2api/deploy/postgres_data` | 直接删除数据库文件，**所有用户、订单、配置全部丢失** | 永远不要手动删除该目录 |
| `rm -rf /opt/sub2api/deploy/data` | 删除 Sub2API 运行时数据（配置、日志等） | 先备份再操作 |
| `docker volume prune` | 可能误删未被容器使用的数据卷 | 生产环境避免使用 |
| `docker system prune -a --volumes` | 删除所有容器、镜像、构建缓存和数据卷 | 绝对禁止 |
| 修改 `.env` 中的 `POSTGRES_PASSWORD` 后未同步数据库 | 应用无法连接数据库，服务崩溃 | 要么同时修改数据库内密码，要么不修改 |
| 在数据库运行时直接复制/修改 `postgres_data` 文件 | 数据损坏，数据库无法启动 | 使用 `pg_dump` 或快照备份 |
| 在管理后台随意点击「恢复备份」 | 当前数据库被备份覆盖，可能丢失恢复点之后的所有数据 | 恢复前必须再次确认备份版本，并先手动备份当前数据 |

### 11.2 任何数据操作前的强制 checklist

在对数据库、数据目录、备份记录做任何**修改、删除、恢复、迁移**之前，必须完成以下步骤：

- [ ] 已经创建当前数据库的手动备份或确认 S3 上有一份最新的 `completed` 备份
- [ ] 已经备份 `.env` 文件
- [ ] 已按第 7.4 节备份 PostgreSQL、`.env`、应用数据和 Redis 数据；没有复制运行中的 `postgres_data/`
- [ ] 已经通知相关用户或将服务切换到维护模式
- [ ] 已经记录下当前操作的回滚方案

### 11.3 删除操作特别警示

#### 删除备份记录

在管理后台点击「删除」备份记录时：

- 会同时删除 S3 上的备份文件
- 删除后**无法恢复**
- 建议保留至少最近 2 周的备份

#### 删除用户 / 订单 / 渠道

管理后台删除以下数据属于高危操作：

- 用户账号
- 订单记录
- API Key
- 渠道 / 账号
- 分组配置

这些操作通常**没有回收站**，删除前请务必确认是否有业务依赖。

#### 删除 Docker 数据目录

```bash
# 以下命令会摧毁生产数据，绝对禁止在生产环境执行：
rm -rf /opt/sub2api/deploy/postgres_data
rm -rf /opt/sub2api/deploy/redis_data
rm -rf /opt/sub2api/deploy/data
```

### 11.4 恢复操作特别警示

从备份恢复数据库时：

1. **恢复会覆盖当前数据库**，不是合并
2. 恢复前必须先手动备份当前数据库
3. 恢复过程中服务不可用
4. 恢复完成后需要验证数据完整性
5. 如果恢复失败，必须能用恢复前的备份回滚

### 11.5 修改 `.env` 的安全规则

| 变量 | 首次启动后能否修改 | 修改风险 |
|------|------------------|---------|
| `POSTGRES_PASSWORD` | ❌ 不能直接修改 | 数据库内密码不会自动同步，导致连接失败 |
| `JWT_SECRET` | ✅ 可以修改 | 修改后所有用户需要重新登录 |
| `TOTP_ENCRYPTION_KEY` | ✅ 可以修改 | 修改后所有 2FA 需要重新绑定 |
| `REDIS_PASSWORD` | ✅ 可修改并重建容器 | 必须同时重建 Redis 和 Sub2API 容器 |
| `ADMIN_EMAIL` | ✅ 可以修改 | 仅影响首次自动创建的管理员账号 |
| `ADMIN_PASSWORD` | ✅ 可以修改 | 首次启动后建议在 Web UI 修改 |

### 11.6 安全备份命令参考

```bash
cd /opt/sub2api/deploy

# 1. 创建备份目录并备份 .env
BACKUP_DIR="$HOME/sub2api-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp .env "$BACKUP_DIR/.env"

# 2. 备份数据库（推荐）
docker compose -f docker-compose.local.yml exec -T postgres sh -c \
  'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "$BACKUP_DIR/database.sql.gz"

# 3. 完整灾难恢复备份
# 安排维护窗口，并按第 7.4.2 节停止写入后导出 /app/data 和 Redis 数据。
# 不要在 PostgreSQL 运行时直接打包 postgres_data/。
```

---

## 附录：软件包说明

部署过程中安装的软件包及其用途：

| 包名 | 用途 | 是否运行服务 |
|------|------|------------|
| `curl` | 命令行 HTTP 客户端，用于下载脚本、调用 API、测试健康状态 | 否 |
| `wget` | 文件下载工具 | 否 |
| `vim` | 文本编辑器，修改 `.env`、Caddyfile、Nginx 配置等 | 否 |
| `unzip` | 解压 zip 文件 | 否 |
| `htop` | 交互式系统监控工具，查看 CPU/内存/进程 | 否 |
| `git` | 版本控制，拉取 Sub2API 代码、更新版本 | 否 |
| `ca-certificates` | SSL/TLS 根证书，保证 HTTPS 连接安全 | 否 |
| `gnupg` | GPG 签名工具，安装 Docker 等第三方源时验证软件包签名 | 否 |
| `ufw` | 防火墙，控制服务器入站/出站流量 | 是 |
| `fail2ban` | 入侵防御，自动封禁暴力破解来源 IP | 是 |
| `docker-ce` | Docker 容器引擎 | 是 |
| `docker-compose-plugin` | Docker Compose V2，编排多容器应用 | 否（Docker 插件） |
| `caddy` | 反向代理与自动 HTTPS | 是 |

### Docker 相关组件说明

| 组件 | 作用 |
|------|------|
| `docker-ce` | Docker 容器运行时 |
| `docker-ce-cli` | Docker 命令行工具 |
| `containerd.io` | 容器底层运行时 |
| `docker-buildx-plugin` | 构建多平台镜像 |
| `docker-compose-plugin` | Docker Compose V2，用于启动 `docker-compose.local.yml` |

---

## 附录：常用命令速查

```bash
# 启动
cd /opt/sub2api/deploy
docker compose -f docker-compose.local.yml up -d

# 停止
docker compose -f docker-compose.local.yml down

# 重启 sub2api
docker compose -f docker-compose.local.yml restart sub2api

# 更新自己的 Git 仓库代码（完整流程见 8.1）
cd /opt/sub2api
git pull --ff-only origin main
cd deploy
docker compose -f docker-compose.local.yml up -d --build --no-deps sub2api

# 进入 PostgreSQL
docker compose -f docker-compose.local.yml exec postgres psql -U sub2api -d sub2api

# 手动备份数据库
docker compose -f docker-compose.local.yml exec -T postgres sh -c \
  'pg_dump --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "sub2api_manual_$(date +%Y%m%d_%H%M%S).sql.gz"

# 查看 S3 备份配置是否正确（进入容器后无此命令，请在管理后台测试）
```

---

> 本文档基于 Sub2API 当前代码结构编写，如后续部署方式变化，请以仓库最新 `deploy/README.md` 为准。
