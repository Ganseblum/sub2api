# Sub2API VPS 部署指南（源码构建版）

> 本指南适用于：从一台全新的 Ubuntu VPS 开始，完成系统初始化、安全加固、Docker 环境配置，并使用自己的 Git 仓库源码构建部署 Sub2API。
>
> 假设条件：
> - 操作系统：Ubuntu 22.04/24.04 LTS
> - 已可通过 SSH 登录 `ubuntu` 用户
> - 你使用的 Sub2API 代码来自自己的 Git 仓库（fork 或 clone），不是 Docker Hub 官方镜像

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
sudo ufw allow 8080/tcp    # Sub2API 默认端口
sudo ufw --force enable
sudo ufw status numbered
```

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
| `POSTGRES_PASSWORD` | 强密码，必须修改 |
| `REDIS_PASSWORD` | **留空**，避免认证问题 |
| `ADMIN_EMAIL` | 可选，默认 `admin@sub2api.local` |
| `ADMIN_PASSWORD` | 可选，留空则首次启动自动生成 |

### 4.3 源码构建并启动

**因为使用自己的 Git 仓库源码，必须叠加 `docker-compose.build.yml`**：

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

> ⚠️ 注意：不要直接用 `docker-compose.local.yml` 启动，它引用的镜像是 `sub2api:local`，而 `docker-compose.build.yml` 构建出来的镜像是 `sub2api:latest`，两者不兼容。

### 4.4 查看日志并获取 admin 密码

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml logs -f sub2api
```

如果 `ADMIN_PASSWORD` 留空，在日志中搜索自动生成的 admin 密码：

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml logs sub2api | grep "admin password"
```

### 4.5 访问 Web UI

浏览器打开：

```
http://你的VPS_IP:8080
```

使用 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 登录。

---

## 五、部署后验证

```bash
# 查看容器状态
docker compose -f docker-compose.yml -f docker-compose.build.yml ps

# 查看 Sub2API 健康状态
curl http://localhost:8080/health

# 检查 PostgreSQL
docker compose -f docker-compose.yml -f docker-compose.build.yml exec postgres pg_isready

# 检查 Redis
docker compose -f docker-compose.yml -f docker-compose.build.yml exec redis redis-cli ping
```

---

## 六、日常更新（git pull 后重建）

每次更新自己的 Git 仓库后，只重建 `sub2api` 容器，不动数据库：

```bash
cd ~/sub2api
git pull

cd deploy
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build sub2api
```

或使用项目自带的升级脚本：

```bash
cd ~/sub2api/deploy
./upgrade.sh
```

---

## 七、备份与恢复

### 7.1 备份 `.env` 文件

```bash
cd ~/sub2api/deploy
cp .env .env.backup.$(date +%Y%m%d)
```

### 7.2 备份数据库

```bash
cd ~/sub2api/deploy

docker compose -f docker-compose.yml -f docker-compose.build.yml exec postgres pg_dump \
  -U sub2api \
  -d sub2api \
  > sub2api_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 7.3 备份命名卷（完整备份）

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

## 八、常见问题

### 8.1 Redis healthcheck 失败

通常是因为设置了 `REDIS_PASSWORD` 但 healthcheck 没拿到密码。解决方案：`.env` 中 `REDIS_PASSWORD=` 留空。

### 8.2 找不到 `sub2api:local` 镜像

说明你用了 `docker-compose.local.yml` 但没叠加 build 文件。源码部署请使用：

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

### 8.3 数据库连接失败

- 检查 `POSTGRES_PASSWORD` 是否正确
- 不要修改 `.env` 中的 `POSTGRES_PASSWORD`，数据库卷内仍是旧密码
- 确认 `PGDATA=/var/lib/postgresql/data` 已设置

### 8.4 登录态每次重启后失效

因为 `JWT_SECRET` 留空，每次启动生成随机值。首次部署时务必设置固定的 `JWT_SECRET`。

### 8.5 2FA 失效

因为 `TOTP_ENCRYPTION_KEY` 留空，每次启动生成随机值。首次部署时务必设置固定的 `TOTP_ENCRYPTION_KEY`。

---

## 九、不需要安装的说明

以下工具**生产部署不需要安装**：

| 工具 | 不需要的原因 |
|------|-------------|
| Node.js | 前端已在 Docker 镜像中构建完成 |
| pnpm | 同上 |
| Go | 后端已在 Docker 镜像中编译完成 |

只有本地开发或改代码后需要手动构建时才需要这些工具。

---

## 十、可选增强

### 10.1 安装 Netdata 监控

```bash
curl https://get.netdata.cloud/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh
```

访问 `http://你的VPS_IP:19999`。

### 10.2 配置域名与 HTTPS

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

## 十一、命令速查

```bash
# 启动
cd ~/sub2api/deploy
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build

# 停止
docker compose -f docker-compose.yml -f docker-compose.build.yml down

# 查看日志
docker compose -f docker-compose.yml -f docker-compose.build.yml logs -f sub2api

# 重启 sub2api
docker compose -f docker-compose.yml -f docker-compose.build.yml restart sub2api

# 更新（git pull 后）
cd ~/sub2api && git pull && cd deploy
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build sub2api
```
