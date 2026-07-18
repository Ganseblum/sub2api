# 仓库 Agent 指令

## 上游同步规则

本 fork 与上游同步时，必须遵守以下规则。

- fork 远端：`origin`（`https://github.com/Ganseblum/sub2api.git`）。
- 源头远端：`upstream`（`https://github.com/Wei-Shaw/sub2api.git`）。
- 架构、重构、安全修复、数据库迁移、API 契约和依赖更新以 `upstream/main` 为基线。
- 先理解并保留上游实现，再添加仍有必要的 fork 自定义逻辑。
- 禁止不加判断地对整个冲突文件选择 `ours` 或 `theirs`；merge 与 rebase 中这两个名称的含义会变化，必须明确写出具体远端和提交。

每次同步上游必须执行：

1. 拉取 `origin` 和 `upstream`，记录 fork 提交、上游提交和 merge base。
2. 解决冲突前创建或确认可恢复的备份分支。
3. 每个内容冲突先以上游实现为底稿，再以最小改动重新应用 fork 必需逻辑。
4. 即使 Git 自动合并成功，也要检查双方都修改过的文件；高风险自动合并与实际内容冲突分开记录。
5. 每个实际冲突都必须写入 `UPSTREAM_SYNC.md`，至少包含：
   - 文件和冲突区域；
   - 上游行为；
   - fork 自定义行为；
   - 最终合并结果；
   - 验证命令和结果。
6. 修改冲突前先告诉用户冲突文件；处理完成后，报告保留了哪些上游行为、重新加入了哪些 fork 行为，以及验证结果。
7. 冲突标记未清除，或相关 lint、typecheck、build、test 未通过时，禁止提交、部署或推送冲突解决结果。
8. 如果上游行为与 fork 行为无法共存且会改变产品语义，暂停处理并询问用户仍需保留哪项 fork 行为。

前端冲突解决后的最低检查：

```bash
git diff --check
pnpm --dir frontend run lint:check
pnpm --dir frontend run typecheck
pnpm --dir frontend run build
make test-frontend
```

后端发生冲突时，还必须运行受影响的 Go 测试和后端构建。
