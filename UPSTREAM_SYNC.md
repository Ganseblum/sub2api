# 上游同步冲突台账

本文档记录 fork 与 `upstream/main` 同步时产生的冲突。强制解决规则见 [AGENTS.md](./AGENTS.md)。

## 解决原则

以上游实现为基线。保留上游行为后，只重新加入仍有必要的 fork 自定义逻辑。每个实际冲突都必须记录，并在同步完成前提示用户。

## 2026-07-19 同步

| 项目 | 提交 |
|------|------|
| Fork 父提交 | `bb22e95c5` |
| 上游父提交 | `d4b9797ff` |
| Merge base | `57914967cbb127ff715719c3879d881c10d75274` |
| 合并提交 | `79c3cb8c2` |
| 后续修复 | `f0f46c9fa` |

Git remerge 分析确认本次有两个实际内容冲突。

### 冲突 1：`frontend/src/main.ts`

**冲突区域**：导入区和启动时品牌初始化。

**上游行为**：

- 从 `@/utils/branding` 导入 `updateFavicon`。
- 注入配置加载后更新 favicon。
- 使用上游字面量 `Sub2API` 比较站点名称。

**Fork 行为**：

- 从 `@/config/brand` 导入 `APP_BRAND_NAME`。
- 使用 fork 品牌常量替代上游字面量。

**第一次错误解决结果**：

- 保留了上游的 `updateFavicon` 导入。
- 保留了 fork 对 `APP_BRAND_NAME` 的调用。
- 丢失 `APP_BRAND_NAME` 导入，产生 `TS2304: Cannot find name 'APP_BRAND_NAME'`。

**最终结果**：

- 保留上游 favicon 初始化。
- 重新加入 fork 品牌常量比较。
- 同时导入两个依赖，组合后的行为可以通过类型检查和构建。

```ts
import { APP_BRAND_NAME } from '@/config/brand'
import { updateFavicon } from '@/utils/branding'
```

### 冲突 2：`frontend/src/views/public/LegalDocumentView.vue`

**冲突区域**：公共设置的导入和初始化。

**上游行为**：

- 使用共享的 `useAppStore` 缓存替代直接调用 `getPublicSettings`。
- 使用 `appStore.fetchPublicSettings()` 并保留加载骨架行为。

**Fork 行为**：

- 使用 `normalizeBrandName` 处理自定义品牌名。
- 使用 `hydrateLoginAgreementDocuments` 补齐 fork 默认法律文档。
- 保留 fork 的法律文档导航和本地合规文档。

**第一次错误解决结果**：

- 保留了上游的 `useAppStore` 导入和初始化。
- 保留了两个 fork helper 的调用。
- 丢失两个 helper 导入，导致 lint 和 typecheck 失败。

**最终结果**：

- 保留上游共享 store 加载流程。
- 重新加入 fork 品牌处理和法律文档补齐逻辑。
- 恢复两个 helper 导入及文档类型推导。

```ts
import { normalizeBrandName } from '@/config/brand'
import { useAppStore } from '@/stores/app'
import { hydrateLoginAgreementDocuments } from '@/utils/loginAgreementDefaults'
```

### 双方都修改但未产生内容冲突的文件

Git 显示以下文件的两个父分支都存在修改，但 remerge 分析没有报告内容冲突：

- `README.md`
- `backend/cmd/server/wire_gen.go`
- `backend/internal/handler/wire.go`
- `deploy/README.md`
- `frontend/src/i18n/locales/en/misc.ts`
- `frontend/src/i18n/locales/zh/misc.ts`
- `frontend/src/views/admin/SettingsView.vue`

这些文件由 Git 自动合并。它们仍属于复查点，因为文本自动合并成功不等于产品语义已经得到验证。

### 修复后验证

| 检查 | 结果 |
|------|------|
| `git diff --check` | 通过 |
| `pnpm --dir frontend run lint:check` | 通过 |
| `pnpm --dir frontend run typecheck` | 通过 |
| `pnpm --dir frontend run build` | 通过；仅有既存的 Vite chunk/dynamic-import 警告 |
| 前端关键 Vitest | 6 个文件通过，94 个用例通过 |

第一次冲突解决引入的三个未定义符号均已修复，仓库中没有遗留冲突标记。

## 2026-07-20 同步（上游 v0.1.162）

| 项目 | 提交 |
|------|------|
| Fork 父提交 | `c88fd528d3e3d1dd14cf3c326d74c531e953b49c` |
| 上游父提交 | `e625ce3b3b3b955b7c3afc93221f7c5f0ae55aa8` |
| Merge base | `6d152893ffd7459f0b83dfe59926df75026e4c87` |
| 备份分支 | `backup/pre-upstream-sync-20260720-2104` |
| 合并提交 | 当前记录随本次 merge commit 一同提交 |

同步前 fork 与上游分别有 41 和 44 个独有提交。`git merge-tree` 预演与实际合并均确认
4 个实际冲突；修改冲突前已向用户列出全部冲突文件。

### 冲突 1：`frontend/public/logo.png`

**冲突区域**：上游删除默认 PNG，fork 修改了同一路径的品牌图片。

**上游行为**：

- 删除旧 `frontend/public/logo.png`。
- 新增 `frontend/public/logo.svg` 和仓库级 `assets/logo.svg`。
- 将默认 favicon、页面 Logo 和 README 品牌图切换到新版 SVG。

**Fork 行为**：

- 使用定制的 YOUC PNG 作为未配置 `site_logo` 时的默认品牌图。
- 使用 `APP_BRAND_NAME` 将默认站点品牌规范为 YOUC。

**最终结果**：

- 完整保留上游两个 SVG 资源和 README 品牌展示。
- 将 fork 图片迁移为 `frontend/public/youc-logo.png`，不再占用上游已删除的路径。
- 新增 `APP_BRAND_LOGO`，由 fork 页面和静态 favicon 显式使用该常量；管理员配置的
  `site_logo` 仍保持最高优先级。
- 通过路径分离消除后续同步再次出现 PNG 修改/删除冲突的根因。

### 冲突 2：`frontend/src/components/layout/AppSidebar.vue`

**冲突区域**：侧边栏默认 Logo 和公共设置加载门控。

**上游行为**：

- 公共设置加载完成后才渲染 Logo。
- 未配置站点 Logo 时使用新版 `/logo.svg`。

**Fork 行为**：

- 使用自定义品牌 Logo，并保留 fork 的侧边栏菜单和功能开关。

**最终结果**：

- 保留上游 `settingsLoaded` 渲染门控并补回对应计算属性。
- 默认图改为 fork 的 `APP_BRAND_LOGO`，其余上游侧边栏行为不变。
- fork 的帮助中心、模型市场等导航逻辑继续保留。

### 冲突 3：`frontend/src/components/layout/AuthLayout.vue`

**冲突区域**：认证页品牌区的默认 Logo 与 fork 布局。

**上游行为**：

- 通过公共设置加载状态控制品牌区。
- 默认使用新版 SVG Logo。

**Fork 行为**：

- 使用 YOUC 品牌回退。
- 保留 fork 的认证页样式，并隐藏站点副标题。

**最终结果**：

- 保留上游公共设置加载流程。
- 在 fork 布局中改用 `APP_BRAND_LOGO`，继续允许 `site_logo` 覆盖默认图。
- 保留 fork 已有的认证页展示语义。

### 冲突 4：`frontend/src/views/HomeView.vue`

**冲突区域**：首页头部默认 Logo；上游修改发生在 fork 完整改版过的首页结构中。

**上游行为**：

- 将默认 Logo 从 PNG 切换为新版 SVG。

**Fork 行为**：

- 使用 v3 首页布局、站点名称与 Logo 自定义、帮助/联系/法律文档入口及自定义页脚。

**最终结果**：

- 保留 fork 首页结构和全部入口。
- 头部与页脚统一使用 `APP_BRAND_LOGO`，并继续优先使用管理员配置的 `site_logo`。
- 上游 SVG 资源仍作为上游品牌资产保留，不覆盖 fork 的显式默认品牌。

### 双方都修改但未产生内容冲突的文件

- `README.md`
- `README_CN.md`
- `frontend/index.html`
- `frontend/src/i18n/locales/en/admin/accounts.ts`
- `frontend/src/i18n/locales/en/common.ts`
- `frontend/src/i18n/locales/en/index.ts`
- `frontend/src/i18n/locales/zh/admin/accounts.ts`
- `frontend/src/i18n/locales/zh/common.ts`
- `frontend/src/i18n/locales/zh/index.ts`
- `frontend/src/views/public/LegalDocumentView.vue`

语义复查确认：README 同时保留上游 SVG 品牌头图与 fork 源码部署说明；中英文 i18n
同时注册上游批量生图文案和 fork 帮助中心、模型市场、联系页面文案；法律文档页保留
fork 本地文档与前后篇导航，并使用统一的 fork 品牌回退。

### 修复后验证

| 检查 | 结果 |
|------|------|
| `git diff --check`、`git diff --cached --check` | 通过 |
| 未合并文件与冲突标记检查 | 通过；无未合并文件，源码无遗留冲突标记 |
| `pnpm --dir frontend run lint:check` | 通过 |
| `pnpm --dir frontend run typecheck` | 通过；首次发现并补回 `settingsLoaded` 后复验通过 |
| `pnpm --dir frontend run build` | 通过 |
| 品牌、i18n、侧边栏定向 Vitest | 4 个文件、16 个用例通过 |
| `make test-frontend` | 6 个文件、95 个用例通过 |
| `go test ./...` | 通过 |
| `golangci-lint v2.9` | 通过，0 issues |
| `make build-backend` | 通过，版本 `0.1.162` |

本机未预装 `golangci-lint`，因此 `make test-backend` 在全部 Go 测试通过后停在工具缺失；
随后使用 CI 固定版本 `v2.9.0` 执行同一 lint，结果为 0 issues。

## 2026-07-22 同步（支付服务商文档）

| 项目 | 提交 |
|------|------|
| Fork 父提交 | `054931265a6614e945299354d1e3ee19efaaf4d5` |
| 上游父提交 | `5a8d6c4e41e38f05cea4164e6ff03443fc0f6923` |
| Merge base | `a978d56c7b03600101dd727446c2756c7f44f4c1` |
| 备份分支 | `backup/pre-upstream-sync-20260722-054931265` |
| 合并提交 | 当前记录随本次 merge commit 一同提交 |

同步前 fork 与上游分别有 43 和 2 个独有提交。上游独有历史由
`c05b2311d` 及其合并提交 `5a8d6c4e4` 组成，只修改支付服务商文档。

### 实际冲突

本次 `git merge --no-ff --no-commit upstream/main` 自动合并成功，没有实际内容冲突、
未合并索引项或冲突标记，因此无需重新应用 fork 逻辑。

### 自动合并复查点

- 上游修改 `docs/PAYMENT.md` 和 `docs/PAYMENT_CN.md`，更新 Kyren Topup 的域名、费率和
  提现说明。
- fork 从 merge base 到同步前提交未修改这两个文件，不属于双方同改文件。
- 最终暂存内容与 `upstream/main` 中的两个文档逐字一致；fork 的品牌、部署和前端自定义
  均未受本次文档合并影响。

### 验证

| 检查 | 结果 |
|------|------|
| `git diff --check`、`git diff --cached --check` | 通过 |
| `git diff --name-only --diff-filter=U`、`git ls-files -u` | 通过；无未合并文件 |
| 冲突标记扫描 | 通过；源码和文档中无遗留冲突标记 |
| `git diff --cached upstream/main -- docs/PAYMENT.md docs/PAYMENT_CN.md` | 通过；最终文档与上游一致 |

本次仅修改 Markdown 文档，不涉及前端、后端、数据库、API 或依赖，因此未额外运行代码测试。

## 2026-08-01 同步（upstream/main 至 v0.1.169）

| 项目 | 提交 |
|------|------|
| 本地 fork 起点 | `06df1568df21cb97bfc7828292d634f6b0ffd6b4` |
| fork 远端起点 | `0bb9378d1bbe6852ffa40f1306e22f9c48f93b74` |
| 上游起点 | `682c4fe0e61b851508fa976ac693e0f68a0639eb` |
| 初始本地与上游 merge base | `5a8d6c4e41e38f05cea4164e6ff03443fc0f6923` |
| 实际 upstream 合并 merge base | `cb24522dd53f8f363d008e3afdc8e4baf9788cab` |
| 备份分支 | `codex/backup-upstream-sync-20260801-002613` |
| 合并提交 | 当前记录随本次 upstream merge commit 一同提交 |

同步流程先 `git fetch origin --prune`、`git fetch upstream --prune`，随后先合入
`origin/main`，再合入 `upstream/main`。`origin/main` 自动合并成功；`upstream/main`
产生以下 2 个实际内容冲突。

### 冲突 1：`backend/cmd/server/wire_gen.go`

**冲突区域**：`initializeApplication` 中 `handler.ProvideHandlers(...)` 的参数列表。

**上游行为**：

- 新增 `passkeyHandler`，注册 passkey 登录/管理处理器。
- 新增 `modelPlazaHandler`，注册模型广场处理器。
- 保留 `optionalJWTAuthMiddleware` 并传给 router。

**Fork 行为**：

- 已有 `modelMarketHandler`，用于 fork 的模型市场功能。

**最终结果**：

- 以上游 `ProvideHandlers` 新签名为底稿。
- 在 `channelMonitorUserHandler` 之后补回 fork 的 `modelMarketHandler`。
- 同时保留 upstream 的 `passkeyHandler`、`modelPlazaHandler` 和
  `optionalJWTAuthMiddleware`。

**验证**：

- `go test ./...`：通过。
- `go test ./internal/pkg/servertiming ./internal/server/middleware ./internal/service ./internal/handler ./internal/handler/admin ./internal/repository`：通过。
- `golangci-lint run ./...`：通过，`0 issues`。
- `make build-backend`：通过，版本 `0.1.169`。
- `git diff --name-only --diff-filter=U`、`git ls-files -u`：通过；无未合并文件。
- 冲突标记扫描：通过；无 Git 冲突标记。

**已提示用户**：是，冲突文件在处理前已报告。

### 冲突 2：`frontend/src/components/layout/AppHeader.vue`

**冲突区域**：`<script setup>` import 区。

**上游行为**：

- 新增 `FeatureFlags` 与 `isFeatureFlagEnabled`，用于 `modelPlazaEnabled` 计算属性。

**Fork 行为**：

- 使用 `localizeCustomMenuLabel` 本地化 fork 自定义菜单项。

**最终结果**：

- 保留 upstream 的 feature flag import，模型广场入口继续受开关控制。
- 重新加入 fork 的 `localizeCustomMenuLabel` import，自定义菜单标签继续本地化。

**验证**：

- `pnpm --dir frontend run lint:check`：通过。
- `pnpm --dir frontend run typecheck`：首次发现 `HomeView.vue` 自动合并缺少
  `siteSubtitle`，补回后复验通过。
- `pnpm --dir frontend run build`：通过；仅有 Vite 分块/动态导入警告。
- `make test-frontend`：通过，6 个文件、103 个用例通过。
- `git diff --check`、`git diff --cached --check`：通过。
- 冲突标记扫描：通过；无 Git 冲突标记。

**已提示用户**：是，冲突文件在处理前已报告。

### 自动合并复查点

双方都修改但 Git 自动合并成功的文件共 23 个：

- `README.md`
- `README_CN.md`
- `backend/cmd/server/wire_gen.go`
- `backend/internal/handler/handler.go`
- `backend/internal/handler/wire.go`
- `backend/internal/server/routes/user.go`
- `backend/internal/service/pricing_service.go`
- `deploy/docker-compose.local.yml`
- `frontend/src/components/account/CreateAccountModal.vue`
- `frontend/src/components/layout/AppHeader.vue`
- `frontend/src/i18n/locales/en/admin/accounts.ts`
- `frontend/src/i18n/locales/en/admin/channels.ts`
- `frontend/src/i18n/locales/en/admin/overview.ts`
- `frontend/src/i18n/locales/en/common.ts`
- `frontend/src/i18n/locales/zh/admin/accounts.ts`
- `frontend/src/i18n/locales/zh/admin/channels.ts`
- `frontend/src/i18n/locales/zh/admin/overview.ts`
- `frontend/src/i18n/locales/zh/common.ts`
- `frontend/src/router/index.ts`
- `frontend/src/stores/app.ts`
- `frontend/src/views/HomeView.vue`
- `frontend/src/views/admin/SettingsView.vue`
- `frontend/src/views/auth/RegisterView.vue`

高风险自动合并与复查结果：

- 后端 DI/handler：保留 fork 的 `ModelMarket`，并保留 upstream 的 `Passkey`、
  `ModelPlaza`、`OptionalJWTAuthMiddleware`。
- 用户路由：保留 upstream 的 panel rate limit 与 passkey 路由；fork 用户路由未被移除。
- 定价服务：保留 upstream 的 GPT-5.6 Luna/Terra、Gemini thinking tier、Claude Opus
  5/4.8 回退逻辑；同时保留 fork 模型市场依赖的定价服务。
- 前端路由/设置/store：保留 upstream 的 model plaza、passkey、compact home、panel
  rate limit 开关；保留 fork 的 model market、自定义菜单、品牌和注册入口逻辑。
- `HomeView.vue`：自动合并后 typecheck 发现缺少 `siteSubtitle`，已补接
  `cachedPublicSettings.site_subtitle`。
- 后端 lint 复查：对 caller-controlled HTTP timing wrapper、测试 server 转发、operator
  配置的调试/定价文件路径添加了带说明的 gosec 抑制；OIDC EC JWK 点校验改用
  `crypto/ecdh`；`reflect.Ptr` 更新为 `reflect.Pointer`。

### 验证

| 检查 | 结果 |
|------|------|
| `git diff --check`、`git diff --cached --check` | 通过 |
| `git diff --name-only --diff-filter=U`、`git ls-files -u` | 通过；无未合并文件 |
| 冲突标记扫描 | 通过；无 Git 冲突标记 |
| `pnpm --dir frontend run lint:check` | 通过 |
| `pnpm --dir frontend run typecheck` | 通过；首次失败后补回 `siteSubtitle`，复验通过 |
| `pnpm --dir frontend run build` | 通过；仅 Vite 警告 |
| `make test-frontend` | 通过；6 个文件、103 个用例 |
| `go test ./...` | 通过 |
| 受影响 Go 包复验 | 通过 |
| `golangci-lint run ./...` | 通过，`0 issues` |
| `make build-backend` | 通过，版本 `0.1.169` |

## 2026-08-12 同步（upstream/main 至 v0.1.175）

| 项目 | 提交 |
|------|------|
| 同步前本地 `main` | `0bb9378d1bbe6852ffa40f1306e22f9c48f93b74` |
| Fork 父提交（`origin/main`） | `4e8f7aff85f91e0e48da7785e374c0652a0ee4f0` |
| 上游父提交（`upstream/main`） | `5935e674a84341c3536e27e6a968384f67d9062b` |
| Merge base | `7e2e9ba05026b7126318aa0754c1afa0ac00bc58` |
| 备份分支 | `backup/main-before-upstream-sync-20260812-203735` |
| 合并提交 | 当前记录随本次 merge commit 一同提交 |

同步流程先依次执行 `git fetch --prune origin`、`git fetch --prune upstream`，再将本地
`main` fast-forward 到 `origin/main`。同步前 fork 与上游分别有 50 和 308 个独有提交。
`git merge-tree` 预演与实际 `git merge --no-commit --no-ff upstream/main` 均确认 9 个
实际内容冲突；修改冲突前已向用户列出冲突文件。

本次合并中 `HEAD` 明确指 fork `origin/main@4e8f7aff8`，被合入端明确指
`upstream/main@5935e674a`。以下解决均以上游实现为底稿，再重新应用 fork 必需逻辑。

### 冲突 1：`.gitignore`

- **冲突区域**：仓库根测试与 Vite 缓存忽略项。
- **上游行为**：忽略根目录 `.vite/`。
- **Fork 行为**：忽略 `.test-results/`。
- **最终结果**：同时保留 `.test-results/` 与 `.vite/`。
- **验证**：`git diff --check` 与 `git diff --cached --check` 通过。
- **已提示用户**：是。

### 冲突 2：`backend/cmd/server/wire_gen.go`

- **冲突区域**：用户 handler 构造及 `handler.ProvideHandlers(...)` 参数列表。
- **上游行为**：构造并注入 `ChannelMonitorV2Handler`。
- **Fork 行为**：构造并注入 `ModelMarketHandler`。
- **最终结果**：在上游 V2 监控依赖链上补回模型市场 handler；同步修正
  `handler.ProviderSet` 中历史遗失的 `NewModelMarketHandler`，随后执行
  `go generate ./cmd/server` 重新生成该文件，避免手工生成代码与 Wire 源声明不一致。
- **验证**：Wire 生成通过；`go test ./cmd/server`、完整 Go 测试和后端构建通过。
- **已提示用户**：是。

### 冲突 3：`backend/internal/handler/handler.go`

- **冲突区域**：顶层 `Handlers` 字段。
- **上游行为**：新增 `ChannelMonitorV2`。
- **Fork 行为**：保留 `ModelMarket`。
- **最终结果**：两个 handler 字段并存，分别服务上游渠道监控 V2 与 fork 模型市场。
- **验证**：handler、routes 定向测试及完整 Go 测试通过。
- **已提示用户**：是。

### 冲突 4：`backend/internal/handler/wire.go`

- **冲突区域**：`ProvideHandlers` 参数、返回结构和 Wire provider 集合。
- **上游行为**：注入并注册 `ChannelMonitorV2Handler`。
- **Fork 行为**：注入 `ModelMarketHandler`。
- **最终结果**：以上游签名为基线补回 `ModelMarketHandler`，并显式注册
  `NewModelMarketHandler`；生成代码与声明现已一致。
- **验证**：`go generate ./cmd/server`、handler 定向测试、完整 Go 测试与构建通过。
- **已提示用户**：是。

### 冲突 5：`backend/internal/server/routes/user.go`

- **冲突区域**：认证用户路由末尾。
- **上游行为**：新增带重限流和模式门控的 `/channel-monitor-v2` 被动视图接口。
- **Fork 行为**：保留 `/model-market` 用户模型市场接口。
- **最终结果**：两个独立路由组均保留；V2 路由继续使用
  `panelRateLimiter.Heavy()` 与 `channelMonitorModeV2Guard`。
- **验证**：routes 定向测试及完整 Go 测试通过。
- **已提示用户**：是。

### 冲突 6：`backend/internal/service/pricing_service.go`

- **冲突区域**：确定性模型价格识别 API。
- **上游行为**：新增 `GetIdentifiedModelPricing`，返回已确定识别的价格对象，避免系列猜测。
- **Fork 行为**：`HasExactModelPricing` 为模型市场判断价格目录中是否存在精确候选项。
- **最终结果**：保留上游查询 API，并在其后重新加入 fork 精确存在性 API；二者继续使用
  各自语义，调用方不互相替代。
- **验证**：service 定向测试、`pricing_service_test.go` 覆盖及完整 Go 测试通过。
- **已提示用户**：是。

### 冲突 7：`frontend/src/components/admin/account/AccountTestModal.vue`

- **冲突区域**：测试模式选项与 Gemini 模型优先级。
- **上游行为**：新增 Grok 文本、图片、视频、搜索、TTS、STT、Realtime 测试模式。
- **Fork 行为**：将 `gemini-3.6-flash` 放入优先模型列表。
- **最终结果**：完整保留上游 Grok 测试模式，并在上游列表前补回
  `gemini-3.6-flash`。
- **验证**：前端 lint、typecheck、build 与关键 Vitest 通过。
- **已提示用户**：是。

### 冲突 8：`frontend/src/views/auth/EmailVerifyView.vue`

- **冲突区域**：公共设置状态和挂载时初始化。
- **上游行为**：加载腾讯天御与阿里云验证码开关、站点和凭证公开字段。
- **Fork 行为**：默认站点名使用 `APP_BRAND_NAME`，服务端站点名经
  `normalizeBrandName` 统一品牌回退。
- **最终结果**：保留全部上游验证码状态与赋值，并重新应用 fork 品牌初始化和规范化。
- **验证**：前端 lint、typecheck、build 与包含验证码流程的关键 Vitest 通过。
- **已提示用户**：是。

### 冲突 9：`frontend/src/views/auth/RegisterView.vue`

- **冲突区域**：注册页公共设置状态和挂载时初始化。
- **上游行为**：接入腾讯天御、阿里云验证码及地域配置。
- **Fork 行为**：使用 `APP_BRAND_NAME` 与 `normalizeBrandName` 保持 YOUC 品牌回退。
- **最终结果**：保留上游多验证码流程，并重新应用 fork 品牌回退；注册、OAuth、
  登录协议及域名限量逻辑均继续存在。
- **验证**：前端 lint、typecheck、build 与关键 Vitest 通过。
- **已提示用户**：是。

### 双方都修改但未产生内容冲突的文件

共 27 个自动合并复查点（另 9 个双方同改文件已在上方作为实际冲突记录）：

- `DEV_GUIDE.md`
- `README.md`
- `README_CN.md`
- `backend/internal/handler/admin/setting_handler_update.go`
- `backend/internal/handler/auth_oidc_oauth.go`
- `backend/internal/pkg/antigravity/claude_types.go`
- `backend/internal/pkg/antigravity/claude_types_test.go`
- `backend/internal/repository/usage_log_repo_request_type_test.go`
- `backend/internal/service/gateway_service.go`
- `frontend/src/components/account/CreateAccountModal.vue`
- `frontend/src/components/keys/UseKeyModal.vue`
- `frontend/src/components/keys/__tests__/UseKeyModal.spec.ts`
- `frontend/src/components/layout/AppSidebar.vue`
- `frontend/src/composables/__tests__/useModelWhitelist.spec.ts`
- `frontend/src/composables/useModelWhitelist.ts`
- `frontend/src/i18n/locales/en/admin/accounts.ts`
- `frontend/src/i18n/locales/en/admin/channels.ts`
- `frontend/src/i18n/locales/en/admin/overview.ts`
- `frontend/src/i18n/locales/en/common.ts`
- `frontend/src/i18n/locales/en/index.ts`
- `frontend/src/i18n/locales/zh/admin/accounts.ts`
- `frontend/src/i18n/locales/zh/admin/channels.ts`
- `frontend/src/i18n/locales/zh/admin/overview.ts`
- `frontend/src/i18n/locales/zh/common.ts`
- `frontend/src/i18n/locales/zh/index.ts`
- `frontend/src/stores/app.ts`
- `frontend/src/views/admin/SettingsView.vue`

逐项比较最终索引与 `origin/main`、`upstream/main` 后确认：

- 文档保留 fork 的源码构建/本地目录部署说明，同时采用上游 Go 1.26.5、赞助商和
  Grok CLI 身份版本更新。
- 后端保留 fork 模型市场所需的 Claude 5、Gemini 3.6、精确定价及既有安全 lint
  修复；同时采用上游验证码、渠道监控 V2、响应模型计费、Grok 搜索/音视频和 Codex
  指纹收敛实现。
- 前端保留 fork 的 YOUC 品牌回退、模型市场、帮助/联系入口、自定义菜单本地化与登录
  协议默认文档；同时采用上游多验证码、渠道监控 V2、Grok 全模式测试和新版客户端配置。
- 中英文 i18n 同时包含 fork 页面键与上游新增的验证码、渠道监控、计费和测试模式键；
  `zh/admin/overview.ts` 中模型路由文案保持在正确对象层级。
- 上游新增 `docs/channel-monitor-v2-safe-defaults.md` 原有 3 处行尾空格导致
  `git diff --check` 首次失败；已仅调整 Markdown 换行表达，复验通过。

### 验证

| 检查 | 结果 |
|------|------|
| `git diff --check`、`git diff --cached --check` | 通过 |
| `git diff --name-only --diff-filter=U`、`git ls-files -u` | 通过；无未合并索引项 |
| 冲突标记扫描 | 通过；无 Git 冲突标记 |
| `go generate ./cmd/server` | 通过；Wire 生成代码与 provider 声明一致 |
| 受影响 Go 包定向测试 | 通过；`cmd/server`、handler、routes、service、antigravity、repository |
| `go test ./...` | 通过 |
| `make build-backend` | 通过，版本 `0.1.175` |
| `pnpm --dir frontend run lint:check` | 通过 |
| `pnpm --dir frontend run typecheck` | 通过 |
| `pnpm --dir frontend run build` | 通过；仅有既存的大 chunk 提示 |
| `make test-frontend` | 通过；13 个文件、163 个用例 |

## 2026-08-15 同步（upstream/main 至 v0.1.176）

| 项目 | 提交 |
|------|------|
| Fork 父提交 | `f580036c1` |
| 上游父提交 | `fbfdcef81` |
| Merge base | `5935e674a84341c3536e27e6a968384f67d9062b` |
| 合并提交 | `8794cc016` |
| 备份分支 | `backup/pre-upstream-sync-20260815-014854` |

本次无 Git 内容冲突标记；`ort` 策略自动合并成功。按规则复查了 8 个双方都修改过的文件。

### 实际冲突

无。

### 自动合并复查点

双方都修改的文件：

- `backend/cmd/server/wire_gen.go`
- `backend/internal/service/billing_service.go`
- `frontend/src/composables/__tests__/useModelWhitelist.spec.ts`
- `frontend/src/composables/useModelWhitelist.ts`
- `frontend/src/i18n/locales/en/admin/channels.ts`
- `frontend/src/i18n/locales/en/admin/overview.ts`
- `frontend/src/i18n/locales/zh/admin/channels.ts`
- `frontend/src/i18n/locales/zh/admin/overview.ts`

语义复查结果：

- `wire_gen.go`：采用上游 DI 变更，并保留 fork 的 `modelMarketHandler` 注入与
  `ProvideHandlers` 参数。
- `billing_service.go`：采用上游 Grok 4.6 / x_search / 长上下文与媒体计费改动；保留
  fork 对 `gemini-3.1-pro` 的长上下文倍率，以及既有 Gemini 3.6 回退价卡。
- `useModelWhitelist.ts` / 对应测试：采用上游白名单更新，并保留 fork 的
  `gemini-3.6-flash` 列表、Antigravity 条目与预设映射。
- `en/zh admin/channels.ts`：采用上游 video 计费文案，并保留 fork 的
  `noGroupsSelected` / `emptyModelsInPricing`（ChannelsView 仍在使用）。
- `en/zh admin/overview.ts`：采用上游 `modelPricing` 分组定价文案；保留 fork 的
  `passwordCopied`、`accountsUnit` 文案（UserEditModal / GroupsView 仍在使用）。
- `zh/admin/overview.ts` 高风险点：上游把 `claudeMaxSimulation` 错误嵌进
  `modelRouting`，并把 `removeRule` 等键挤到其后；最终索引保持 fork 正确层级——
  `modelRouting` 自洽关闭，`claudeMaxSimulation` 作为同级对象。英文文件与上游结构一致，
  证实应保留该结构而非跟随上游中文嵌套错误。

### 上游纳入要点

- VERSION `0.1.176`
- Grok JWT 档位 / grok-4.6、分组逐模型定价、长上下文阶梯开关
- 独立 `/x_search`、Chat/Responses 保留 x_search
- 定时备份 leader 锁、分组平台变更失效渠道缓存
- Responses 探测 inconclusive 不再误判为不支持

### 验证

| 检查 | 结果 |
|------|------|
| `git diff --check` | 通过 |
| 冲突标记扫描 | 通过；无 Git 冲突标记 |
| `pnpm --dir frontend run lint:check` | 通过 |
| `pnpm --dir frontend run typecheck` | 通过 |
| `pnpm --dir frontend run build` | 通过；仅有既存的大 chunk 提示 |
| `make test-frontend` | 通过；13 个文件、163 个用例 |
| `go test ./internal/service/ ./internal/handler/ -count=1` | 通过 |
| `go build ./cmd/server/` | 通过 |

## 2026-08-17 同步（upstream/main 至 v0.1.177）

| 项目 | 提交 |
|------|------|
| 同步前本地 fork 提交 | `f580036c1` |
| 同步前 origin/main | `0031690e9` |
| Fork 合并提交 | `6679e6602` |
| 上游父提交 | `e330c243a` |
| Merge base | `fbfdcef8184ae4b2e224d5cfc47cf1d0e3742710` |
| 上游合并提交 | `f3b2cf929` |
| 备份分支 | `backup/main-before-upstream-sync-20260817-164757` |

本次先整合 `origin/main` 的最新 28 个提交，再同步 `upstream/main`。合并前使用
`git merge-tree --write-tree` 预演，`ort` 策略自动合并成功，无实际内容冲突。

### 实际冲突

无。无未合并索引项，源码中无 Git 冲突标记；`backend/internal/pkg/antigravity/request_transformer.go`
中的等号行属于已有的 MCP 协议文本，不是冲突标记。

### 自动合并复查点

双方都修改的文件：

- `DEV_GUIDE.md`
- `backend/cmd/server/wire_gen.go`
- `backend/internal/handler/handler.go`
- `backend/internal/handler/wire.go`
- `frontend/src/components/account/CreateAccountModal.vue`
- `frontend/src/composables/useModelWhitelist.ts`
- `frontend/src/i18n/locales/en/admin/accounts.ts`
- `frontend/src/i18n/locales/en/admin/overview.ts`
- `frontend/src/i18n/locales/zh/admin/accounts.ts`
- `frontend/src/i18n/locales/zh/admin/overview.ts`
- `frontend/src/views/admin/SettingsView.vue`

语义复查结果：

- `DEV_GUIDE.md` 采用上游 Go 1.26.6、CI 版本断言和 Docker 构建镜像说明，保留 fork
  的源码构建与本地部署指引。
- `wire_gen.go`、`handler.go`、`wire.go` 纳入上游 Kimi/Zhipu/DeepSeek 管理处理器和
  依赖注入，同时保留 fork 的 Model Market、Model Plaza 等处理器注册。
- `CreateAccountModal.vue` 纳入国产供应商账号模式、API 协议、密钥提示和端点预设，保留
  既有 OpenAI/Gemini/Grok/Anthropic 创建流程及 fork 的模型白名单入口。
- `useModelWhitelist.ts` 纳入 Kimi 新模型和 `kimi` 平台别名，同时保留 fork 已有模型
  市场条目与 Antigravity、Gemini 扩展模型。
- 中英文账号与概览 i18n 纳入国产供应商、平台配额及昨日用量文案，同时保留 fork 的自定义
  账号、模型市场和管理页面文案。
- `SettingsView.vue` 纳入上游 OpenAI Fast/Flex 目标模型摘要、回退策略和无障碍标识，保留
  fork 的支付、认证、品牌与运营设置。

### 上游纳入要点

- VERSION 更新为 `0.1.177`，Go 版本更新为 `1.26.6`。
- Kimi/Zhipu/DeepSeek 一等供应商支持、配额/余额监控和多协议账号配置。
- 分组用量日报汇总、时区隔离、逐模型定价和长上下文阶梯配置。
- Codex turn state 透传、指纹收敛 opt-in、原生 compaction v2 探测与路由。
- Grok 搜索、音视频、订阅档位及新模型目录相关更新。

### 验证

| 检查 | 结果 |
|------|------|
| `git diff --check` | 通过 |
| `git diff --name-only --diff-filter=U`、`git ls-files -u` | 通过；无未合并文件 |
| Git 冲突标记扫描 | 通过；无遗留冲突标记 |
| `GOCACHE=/tmp/sub2api-go-test go test ./...` | 通过 |
| `pnpm --dir frontend run lint:check` | 通过 |
| `pnpm --dir frontend run typecheck` | 通过 |
| `pnpm --dir frontend run build` | 通过；仅有既存 chunk 大小和 Browserslist 提示 |
| `make test-frontend` | 通过；13 个文件、164 个用例 |
| `GOCACHE=/tmp/sub2api-go-build-cache make build-backend` | 通过，版本 `0.1.177` |

## 后续记录模板

以后每次同步复制以下章节：


```markdown
## YYYY-MM-DD 同步

- Fork 父提交：`<commit>`
- 上游父提交：`<commit>`
- Merge base：`<commit>`
- 合并提交：`<commit 或 pending>`

### 冲突：`path/to/file`

- 冲突区域：
- 保留的上游行为：
- 重新加入的 fork 行为：
- 最终结果：
- 验证：
- 已提示用户：是/否

### 自动合并复查点

- 双方都修改的文件：
- 语义复查结果：
```
