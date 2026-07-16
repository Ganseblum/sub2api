# Sub2API VPS 部署指南（源码构建版）

> 本指南适用于：从一台全新的 Ubuntu VPS 开始，完成系统初始化、安全加固、Docker 环境配置，并使用自己的 Git 仓库最新代码源码构建部署 Sub2API。
>
> 假设条件：
> - 操作系统：Ubuntu 22.04/24.04 LTS
> - 已可通过 SSH 登录 `ubuntu` 用户
> - 你使用的 Sub2API 代码来自自己的 Git 仓库（fork 或 clone），不是 Docker Hub 官方镜像
> - 日常更新以 `git pull` 你的仓库最新代码后本地重建镜像为准

---

## 一、系统初始化

### 1.1 更新系统包

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget vim unzip htop git ca-certificates gnupg
```

### 1.2 设置时区

```bash
sudo timedatectl set-timezone Asia/Shanghai
sudo timedatectl set-ntp true
timedatectl
```

确认输出包含：

```
Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
NTP service: active
```

### 1.3 调整文件句柄上限

API 高并发需要更大的文件句柄数：

```bash
echo "ubuntu soft nofile 1048576" | sudo tee -a /etc/security/limits.conf
echo "ubuntu hard nofile 1048576" | sudo tee -a /etc/security/limits.conf
```

**重新 SSH 登录后**验证：

```bash
ulimit -n
# 应输出 1048576
```

---

## 二、安全基线

### 2.1 配置 UFW 防火墙

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH，改端口后需调整
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw --force enable
sudo ufw status numbered
```

如果使用 Nginx/Caddy 反向代理，不要开放 `8080` 到公网；Sub2API 只需要被本机反代访问。

### 2.2 安装并配置 fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban --now
sudo fail2ban-client status sshd
```

### 2.3 SSH 加固（可选但强烈建议）

```bash
sudo nano /etc/ssh/sshd_config
```

修改以下配置：

```ini
Port 2222                  # 改成非 22 端口
PermitRootLogin no
PasswordAuthentication no  # 确保已配置 SSH 密钥登录后再启用
MaxAuthTries 3
```

重启 SSH：

```bash
sudo systemctl restart sshd
```

⚠️ **警告**：修改 `PasswordAuthentication no` 前，务必确认你能用密钥登录，否则会把自己锁在服务器外。

### 2.4 自动安全更新

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

选择 **Yes**。

---

## 三、安装 Docker 与 Compose V2

### 3.1 安装 Docker

```bash
# 添加 Docker 官方源
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 将 ubuntu 用户加入 docker 组
sudo usermod -aG docker ubuntu
```

**重新 SSH 登录后**验证：

```bash
docker -v
docker compose version
```

### 3.2 配置 Docker 镜像加速

海外 VPS 直连 Docker Hub 较慢，建议配置镜像源：

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

### 4.1 拉取你的 Git 仓库

```bash
cd ~
git clone <你的 Sub2API 仓库地址> sub2api
cd sub2api
```

### 4.2 配置环境变量

```bash
cd deploy
cp .env.example .env
```

生成固定密钥：

```bash
JWT_SECRET=$(openssl rand -hex 32)
TOTP_ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "JWT_SECRET=${JWT_SECRET}" >> .env
echo "TOTP_ENCRYPTION_KEY=${TOTP_ENCRYPTION_KEY}" >> .env
```

编辑 `.env`：

```bash
nano .env
```

至少需要修改：

| 变量 | 建议值 |
|------|--------|
| `BIND_HOST` | `127.0.0.1`，通过 Nginx/Caddy 反代时不要公网暴露 8080 |
| `POSTGRES_PASSWORD` | 强密码，必须修改 |
| `REDIS_PASSWORD` | **留空**，避免认证问题 |
| `ADMIN_EMAIL` | 可选，默认 `admin@sub2api.local` |
| `ADMIN_PASSWORD` | 可选，留空则首次启动自动生成 |

### 4.3 源码构建并启动

**使用 `docker-compose.local.yml` 从当前 Git 工作区构建并启动**：

```bash
docker compose -f docker-compose.local.yml up -d --build
```

> 注意：`docker-compose.local.yml` 会从当前 Git 工作区的 `Dockerfile` 构建 `sub2api:local` 镜像，部署的是你当前 Git 工作区的代码。更新代码时先 `git pull`，再重新执行构建命令。

### 4.4 查看日志并获取 admin 密码

```bash
docker compose -f docker-compose.local.yml logs -f sub2api
```

如果 `ADMIN_PASSWORD` 留空，在日志中搜索自动生成的 admin 密码：

```bash
docker compose -f docker-compose.local.yml logs sub2api | grep "admin password"
```

### 4.5 访问 Web UI

浏览器打开：

```
http://你的VPS_IP:8080
```

使用 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 登录。

如果 `.env` 中设置了 `BIND_HOST=127.0.0.1`，公网不能直接访问 `8080`，请继续配置第十一节的 Nginx 或 Caddy，通过域名访问。

---

## 五、部署后验证

```bash
# 查看容器状态
docker compose -f docker-compose.local.yml ps

# 查看 Sub2API 健康状态
curl http://localhost:8080/health

# 检查 PostgreSQL
docker compose -f docker-compose.local.yml exec postgres pg_isready

# 检查 Redis
docker compose -f docker-compose.local.yml exec redis redis-cli ping
```

---

## 六、从老服务器迁移与切换

如果老服务器已经跑过 Sub2API，先确认老服务器的配置和数据，再切换到新服务器。不要让新老两个实例长期同时对外提供写入服务，否则用户、令牌、额度、日志等数据会分叉。

### 6.1 老服务器需要查看的内容

在老服务器上先确认部署目录、Compose 文件、环境变量、反向代理配置和数据存储方式：

```bash
# 查看容器和 Compose 项目
docker ps
docker compose ls

# 常见部署目录，按实际情况进入
cd ~/sub2api/deploy

# 查看当前使用的 compose 文件和环境变量
ls -la
docker compose ps
docker compose config > compose.current.yml

# 记录老服务器实际使用的 Compose 命令，后续备份/停服都复用它
# 源码构建版通常是：
export OLD_COMPOSE="docker compose -f docker-compose.local.yml"
# 如果老服务器是普通镜像版，改成：
# export OLD_COMPOSE="docker compose -f docker-compose.yml"
# 如果老服务器是本地目录版，改成：
# export OLD_COMPOSE="docker compose -f docker-compose.local.yml"

# 重点查看这些文件
sed -n '1,220p' .env
sed -n '1,220p' docker-compose.local.yml
sed -n '1,220p' docker-compose.yml
test -f config.yaml && sed -n '1,220p' config.yaml

# 查看 Nginx/Caddy 配置
sudo nginx -T 2>/dev/null | sed -n '/server_name/,+80p'
sudo test -f /etc/caddy/Caddyfile && sudo sed -n '1,220p' /etc/caddy/Caddyfile
```

至少要保留这些值：

| 内容 | 说明 |
|------|------|
| `.env` | `POSTGRES_PASSWORD`、`JWT_SECRET`、`TOTP_ENCRYPTION_KEY`、`ADMIN_EMAIL`、端口、OAuth 等配置 |
| `config.yaml` | 如果有手动挂载或在 `/app/data/config.yaml` 里生成过，需要迁移 |
| PostgreSQL 数据 | 用户、令牌、账单、用量、设置等核心数据 |
| Redis 数据 | 缓存/队列数据，通常可以迁移，也可以按业务接受丢弃 |
| Nginx/Caddy 配置 | 域名、证书、`proxy_pass`、上传大小、超时 |

### 6.2 老服务器备份

先备份 `.env` 和数据库：

```bash
cd ~/sub2api/deploy
mkdir -p backup

cp .env backup/.env.$(date +%Y%m%d_%H%M%S)

${OLD_COMPOSE} exec -T postgres pg_dump \
  -U ${POSTGRES_USER:-sub2api} \
  -d ${POSTGRES_DB:-sub2api} \
  > backup/sub2api_$(date +%Y%m%d_%H%M%S).sql
```

如果使用的是本地目录版 `docker-compose.local.yml`，再打包数据目录：

```bash
cd ~/sub2api
tar czf sub2api-deploy-backup-$(date +%Y%m%d_%H%M%S).tar.gz deploy/.env deploy/data deploy/postgres_data deploy/redis_data
```

如果使用的是命名卷版 `docker-compose.yml`，再打包命名卷：

```bash
cd ~/sub2api/deploy

docker run --rm \
  -v deploy_sub2api_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/sub2api_data_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

docker run --rm \
  -v deploy_postgres_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

docker run --rm \
  -v deploy_redis_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/redis_data_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

把备份传到新服务器：

```bash
scp backup/sub2api_*.sql ubuntu@新服务器IP:~/
scp backup/.env.* ubuntu@新服务器IP:~/sub2api.env
```

### 6.3 新服务器恢复并验证

在新服务器拉取你自己的 Git 仓库最新代码：

```bash
cd ~
git clone <你的 Sub2API 仓库地址> sub2api
cd ~/sub2api/deploy
cp ~/sub2api.env .env
```

确认 `.env` 至少包含：

```ini
BIND_HOST=127.0.0.1
SERVER_PORT=8080
POSTGRES_PASSWORD=老服务器同一个值
JWT_SECRET=老服务器同一个值
TOTP_ENCRYPTION_KEY=老服务器同一个值
```

先只启动 PostgreSQL 和 Redis：

```bash
docker compose -f docker-compose.local.yml up -d --build postgres redis
```

恢复数据库 SQL 备份：

```bash
docker compose -f docker-compose.local.yml exec -T postgres psql \
  -U ${POSTGRES_USER:-sub2api} \
  -d ${POSTGRES_DB:-sub2api} \
  < ~/sub2api_YYYYMMDD_HHMMSS.sql
```

再构建并启动应用：

```bash
docker compose -f docker-compose.local.yml up -d --build sub2api
docker compose -f docker-compose.local.yml logs -f sub2api
```

本机验证：

```bash
curl http://127.0.0.1:8080/health
```

Nginx 配好后，用域名验证：

```bash
curl -I https://your-domain.com/health
```

### 6.4 停老服务器与切换域名

推荐切换顺序：

1. 提前把域名 DNS TTL 调低，例如 60 秒。
2. 新服务器部署完成并通过 `curl http://127.0.0.1:8080/health` 验证。
3. 进入维护窗口，停止老服务器应用，避免产生新写入。
4. 老服务器停服后再做一次最终数据库备份。
5. 把最终备份恢复到新服务器。
6. 新服务器启动 `sub2api`，验证健康检查和登录。
7. 修改 DNS A 记录到新服务器 IP。
8. 确认域名访问新服务器后，老服务器保持停止状态至少观察 24 小时。

老服务器停应用但保留数据库和数据卷：

```bash
cd ~/sub2api/deploy
${OLD_COMPOSE} stop sub2api
```

如果确认已经完成切换，可以停止老服务器全部服务，但不要立刻删除卷：

```bash
cd ~/sub2api/deploy
${OLD_COMPOSE} down
```

不要执行 `docker compose down -v`，除非已经确认备份可用且不再需要老数据。

---

## 七、日常更新（git pull 后重建）

每次更新自己的 Git 仓库后，只重建 `sub2api` 容器，不动数据库：

```bash
cd ~/sub2api
git fetch origin
git status
git pull --ff-only

cd deploy
docker compose -f docker-compose.local.yml up -d --build sub2api
docker compose -f docker-compose.local.yml logs -f sub2api
curl http://127.0.0.1:8080/health
```

更新前建议先备份数据库：

```bash
cd ~/sub2api/deploy
mkdir -p backup
docker compose -f docker-compose.local.yml exec -T postgres pg_dump \
  -U ${POSTGRES_USER:-sub2api} \
  -d ${POSTGRES_DB:-sub2api} \
  > backup/sub2api_before_update_$(date +%Y%m%d_%H%M%S).sql
```

如果更新后应用无法启动，先回到上一个 Git 提交重新构建：

```bash
cd ~/sub2api
git log --oneline -5
git checkout <上一个可用commit>

cd deploy
docker compose -f docker-compose.local.yml up -d --build sub2api
docker compose -f docker-compose.local.yml logs -f sub2api
```

如果这次更新包含数据库迁移，代码回滚不一定能回滚数据库结构；需要用更新前的数据库备份恢复。

---

## 八、备份与恢复

### 8.1 备份 `.env` 文件

```bash
cd ~/sub2api/deploy
cp .env .env.backup.$(date +%Y%m%d)
```

### 8.2 备份数据库

```bash
cd ~/sub2api/deploy

docker compose -f docker-compose.local.yml exec postgres pg_dump \
  -U sub2api \
  -d sub2api \
  > sub2api_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 8.3 备份命名卷（完整备份）

```bash
cd ~/sub2api/deploy

docker run --rm \
  -v deploy_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .

docker run --rm \
  -v deploy_redis_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/redis_data_$(date +%Y%m%d).tar.gz -C /data .
```

---

## 九、常见问题

### 9.1 Redis healthcheck 失败

通常是因为设置了 `REDIS_PASSWORD` 但 healthcheck 没拿到密码。解决方案：`.env` 中 `REDIS_PASSWORD=` 留空。

### 9.2 找不到 `sub2api:local` 镜像

说明你想从源码构建但没有加 `--build`。源码部署请使用：

```bash
docker compose -f docker-compose.local.yml up -d --build
```

### 9.3 数据库连接失败

- 检查 `POSTGRES_PASSWORD` 是否正确
- 不要修改 `.env` 中的 `POSTGRES_PASSWORD`，数据库卷内仍是旧密码
- 确认 `PGDATA=/var/lib/postgresql/data` 已设置

### 9.4 登录态每次重启后失效

因为 `JWT_SECRET` 留空，每次启动生成随机值。首次部署时务必设置固定的 `JWT_SECRET`。

### 9.5 2FA 失效

因为 `TOTP_ENCRYPTION_KEY` 留空，每次启动生成随机值。首次部署时务必设置固定的 `TOTP_ENCRYPTION_KEY`。

---

## 十、不需要安装的说明

以下工具**生产部署不需要安装**：

| 工具 | 不需要的原因 |
|------|-------------|
| Node.js | 前端已在 Docker 镜像中构建完成 |
| pnpm | 同上 |
| Go | 后端已在 Docker 镜像中编译完成 |

只有本地开发或改代码后需要手动构建时才需要这些工具。

---

## 十一、可选增强

### 11.1 安装 Netdata 监控

```bash
curl https://get.netdata.cloud/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh
```

访问 `http://你的VPS_IP:19999`。

### 11.2 使用 Nginx 配置域名与 HTTPS

如果你主要用 Nginx，把域名解析到 VPS 后安装 Nginx：

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

创建站点配置：

```bash
sudo nano /etc/nginx/sites-available/sub2api
```

先写入 HTTP 反代配置，证书稍后由 Certbot 自动补齐：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 256m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 900s;
        proxy_read_timeout 900s;
    }
}
```

启用配置并测试：

```bash
sudo ln -s /etc/nginx/sites-available/sub2api /etc/nginx/sites-enabled/sub2api
sudo nginx -t
sudo systemctl reload nginx
```

申请 HTTPS 证书：

```bash
sudo certbot --nginx -d your-domain.com
```

证书申请完成后，Certbot 会自动把 `80` 跳转 `443` 并配置证书路径。确认访问：

```bash
curl -I https://your-domain.com/health
```

生产环境建议 `.env` 保持：

```ini
BIND_HOST=127.0.0.1
SERVER_PORT=8080
```

这样 8080 只监听本机，公网只开放 Nginx 的 `80/443`。

### 11.3 使用 Caddy 配置域名与 HTTPS

推荐使用 Caddy 自动 HTTPS：

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

配置 `/etc/caddy/Caddyfile`：

```
your-domain.com {
    reverse_proxy localhost:8080
}
```

```bash
sudo systemctl reload caddy
```

---

## 十二、命令速查

```bash
# 启动
cd ~/sub2api/deploy
docker compose -f docker-compose.local.yml up -d --build

# 停止
docker compose -f docker-compose.local.yml down

# 查看日志
docker compose -f docker-compose.local.yml logs -f sub2api

# 重启 sub2api
docker compose -f docker-compose.local.yml restart sub2api

# 更新（git pull 后）
cd ~/sub2api && git pull --ff-only && cd deploy
docker compose -f docker-compose.local.yml up -d --build sub2api
```
