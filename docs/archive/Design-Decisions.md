# Design Decisions

> 最后更新：2026-05-29

---

## ✅ 已定

| 决策 | 结论 |
|---|---|
| **G7 Mixing Game 题目来源** | 步骤题。全部 31 款配方步骤已整合进 Cocktail-List.md |
| **G9 Phoenix 触发游戏协议** | 结构化标记 `[GAME:cocktail_name]`，server.py 解析，前端剥离后触发 |
| **T11 部署方案** | Docker 打包 → 自有云服务器 + 自有域名，nginx + gunicorn |
| **T12 Phoenix 知识库注入** | 全量注入，server.py 启动时读取 Cocktail-List.md 拼入 system message |

---

## 🔲 待定

| 决策 | 选项 / 说明 |
|---|---|
| **G6 配方呈现方式** | 纯文字对话 / 弹出卡片 / 其他——需 Zayn + Lisa 对齐 |
