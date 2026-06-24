# Sub2API 待办清单

本文件记录部署与 UI 重构等尚未完成的事项。完成一项可在方框中打 `[x]`。

相关文档：[REDEPLOY_CN.md](./REDEPLOY_CN.md)

---

## 一、部署 / 基础设施

### 1.1 升级 Docker Compose V2（服务器）

> **状态：待完成（计划明日升级）**  
> 当前云服务器若为 `docker-compose` 1.29.2，需升级以避免 `ContainerConfig` 等兼容问题。  
> 升级前日常更新仍可用老版 `docker-compose` + `-f docker-compose.build.yml`（无需删旧容器，见 [REDEPLOY_CN.md](./REDEPLOY_CN.md) 第 4.1 节）。

- [ ] 检查版本：`docker compose version` / `docker-compose --version`
- [ ] 安装 V2 插件（手动）：

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins

sudo curl -SL "https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose

sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

docker compose version
```

- [ ] （可选）让 `docker-compose` 命令也走 V2：

```bash
sudo apt-get remove -y docker-compose 2>/dev/null || true
echo 'docker compose "$@"' | sudo tee /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

- [ ] 在 `deploy/.env` 中确认（可选）：

```bash
COMPOSE_FILE=docker-compose.yml:docker-compose.build.yml
```

- [ ] 验证日常更新：`cd deploy && ./upgrade.sh`

ARM 服务器将 URL 中的 `x86_64` 改为 `aarch64`（先 `uname -m`）。

---

## 二、UI 重构（YOUC 组件，commit `51b73a99` 后续）

> **说明：** 本次重构为分批进行，不影响功能与部署构建，但部分页面新旧样式混用。

### 2.1 设置页 `SettingsView.vue` — 开关样式未统一

外层 `div.card` → `SectionCard` 已完成。简单开关约 **44 处**已改为 `SettingToggleRow`，仍有 **16 处**使用旧 `flex + Toggle`。

**优先改（Gateway → 转发行为，同一卡片内新旧混用最明显）：**

- [ ] Claude OAuth System Prompt Injection（约 3468 行）→ `SettingToggleRow`
- [ ] Anthropic Cache TTL 1h Injection（约 3699 行）→ `SettingToggleRow`

**其余仍用旧 Toggle 的位置（复杂区块可暂缓）：**

- [ ] 约 589、1405、1825、1853、1926、2006 行 — 各 Tab 内嵌套表单
- [ ] 约 2699、2713、2727 — 多选项并列 Toggle
- [ ] 约 3081、3149 — Users / 配额相关
- [ ] 约 3578、3656 — Claude OAuth 系统块内部（`block.enabled`、`cacheControlEnabled`，嵌套 UI，可保留或单独设计）
- [ ] 约 4768 — 登录协议 Tab（`login_agreement_enabled`，含自定义 header 布局）

**可选结构优化（非必须）：**

- [ ] `security`、`gateway` Tab 在文件中各拆成两段 `v-show`（197 + 3380 等），功能正常但维护成本高；可考虑合并为单个 Tab 容器

### 2.2 其它仍用旧 `<div class="card">` 的页面

- [ ] `frontend/src/views/admin/RiskControlView.vue`
- [ ] `frontend/src/views/admin/settings/EmailTemplateEditor.vue`
- [ ] `frontend/src/views/user/RedeemView.vue`
- [ ] `frontend/src/views/user/UsageView.vue`
- [ ] `frontend/src/components/user/profile/ProfileBalanceNotifyCard.vue`
- [ ] `frontend/src/components/user/profile/ProfileTotpCard.vue`
- [ ] `frontend/src/components/user/dashboard/UserDashboardRecentUsage.vue`
- [ ] `frontend/src/components/user/dashboard/UserDashboardQuickActions.vue`
- [ ] `frontend/src/components/payment/PaymentProviderList.vue`

### 2.3 已在 `51b73a99` 中改过的区域（作对照，一般无需再动）

- 后台弹窗：Accounts、Users、Groups、Monitor、Proxy、Payment 等 Modal
- 设置页大部分 SectionCard / SettingToggleRow
- Usage 相关：`UsageFilters.vue`、`UsageTable.vue`、`UsageFilterSearch.vue`

---

## 三、已完成（记录）

- [x] `SettingsView.vue` Web Search 区块多余 `</div>` 导致 Docker 构建失败 — 已修复
- [x] `docker-compose.yml` redis 命令 `$$` 转义 — 已修复
- [x] `docker-compose.build.yml` + `upgrade.sh` — 已添加（git 源码构建，避免被 `weishaw/sub2api` 覆盖）
- [x] `REDEPLOY_CN.md` 重新部署文档 — 已添加
- [x] 本地 `pnpm run build` / Vue 模板解析 — 已通过

---

## 四、本地校验命令（改 UI 或部署前）

```bash
# 前端构建
cd frontend && pnpm run build

# Vue 模板（SettingsView）
cd frontend && node -e "
const fs=require('fs');
const {parse}=require('./node_modules/.pnpm/@vue+compiler-dom@3.5.26/node_modules/@vue/compiler-dom/dist/compiler-dom.cjs.prod.js');
const t=fs.readFileSync('src/views/admin/SettingsView.vue','utf8').match(/<template>([\\s\\S]*)<\\/template>/)[1];
const e=[]; parse(t,{onError:x=>e.push(x)});
console.log(e.length?e.map(x=>x.message).join('\\n'):'template OK');
"

# Compose 配置
cd deploy && POSTGRES_PASSWORD=test docker-compose -f docker-compose.yml -f docker-compose.build.yml config >/dev/null && echo compose OK

# Docker 镜像（需 Docker Desktop 运行）
cd .. && docker build -t sub2api:latest -f Dockerfile .
```

---

## 五、日常更新要点（摘要）

与 [REDEPLOY_CN.md](./REDEPLOY_CN.md) 第 4、4.1 节一致：

- **不用**整站停机维护，**不用**日常删除旧 Docker 容器
- **不会**丢数据库（禁止 `down -v`）
- 只重建 **sub2api**；postgres / redis 常驻
- `docker build` 期间旧服务仍在；**换容器时**有短暂中断（几十秒～2 分钟）
- 推荐：`build sub2api` → `up -d sub2api`（或 `./upgrade.sh`，需 V2）
