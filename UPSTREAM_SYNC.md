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
