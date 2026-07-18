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
