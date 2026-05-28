# Action Index

> 所有行动事项的单一入口。每次工作前看这里，完成后更新状态。  
> 最后更新：2026-05-27（全部 practical needs 已覆盖，开始写代码）

---

## 状态标记
`🔲 待做` · `🔄 进行中` · `⛔ 阻塞` · `✅ 完成`

## 依赖标记（备注列）
`← X` 表示"需要 X 完成才能开始" · `→ X,Y` 表示"完成后解锁 X、Y"

---

## ⚡ 现在可以并行推进的事项

| 事项 | 负责 |
|---|---|
| G2 — 入口屏交互细节 | Zayn + Lisa |
| G3 — 酒吧场景交互地图 | Zayn + Lisa |
| G7 — Mixing Game 题目来源决策 | Zayn |
| G9 — Phoenix 触发游戏通信协议决策 | Zayn |
| **T2 — 项目骨架** | **Zayn** |
| G7 — 经典款步骤写入 Cocktail-List | Zayn |
| **T2 — 项目骨架（可用 1024×576 占位先开始）** | **Zayn** |
| A3 — Phoenix 眨眼帧 | Lisa |
| A4 — Phoenix 说话帧 | Lisa |
| D1 — 确认资产最终版 | Lisa |

---

## 🌍 世界观设定

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| W1 | 确定时代背景 / 世界设定 | Lisa 主导 | ✅ 完成 | 近未来义体化，见 project/Worldbuilding.md |
| W2 | 酒吧的名字、定位、"隐藏感"设定 | Zayn + Lisa | ✅ 完成 | 无名酒吧，存在于麻醉缝隙，无需命名 |
| W3 | 世界观对 Phoenix 角色的影响 → 填入 prompt | Zayn | ✅ 完成 | 已写入 Phoenix-Prompt.md |

---

## 🎮 游戏设计

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| G1 | 确定用户旅程方向 | Zayn + Lisa | ✅ 完成 | 采用 v2，见 design/Flow-v2.md |
| G2 | 场景设计：入口屏交互细节 | Zayn + Lisa | 🔲 待做 | W1/W2 已定，可开始 |
| G3 | 场景设计：酒吧场景交互地图 | Zayn + Lisa | 🔲 待做 | W1/W2 已定 · → 解锁 G5 |
| G4 | 对话 UI 设计：位置 & 样式 | Lisa | 🔲 待做 | 可与 G2/G3 并行 |
| G5 | 酒瓶点击的精确行为 | Zayn | 🔲 待做 | ← G3 · → 解锁 T6 |
| G6 | 配方呈现方式（纯文字 / 弹出卡片 / 其他） | Zayn + Lisa | 🔲 待做 | 可与 G2/G3 并行 |
| G7 | Mixing Game 题目来源 | Zayn | 🔄 进行中 | 18款经典步骤已写入 Cocktail-List.md ✅；13款创意款等 Phoenix 补充（见 Cocktail-Steps-Needed.md）|
| G8 | Mixing Game UI 设计（题目布局/进度条/结果画面） | Lisa | 🔲 待做 | ← G7 |
| G9 | Phoenix 触发 Mixing Game 的通信协议 | Zayn | ✅ 完成 | 结构化标记 `[GAME:cocktail_name]`，前端剥离后触发游戏 |

---

## 🧑‍🎤 角色 & AI

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| A1 | Phoenix system prompt 设计 | Zayn | ✅ 完成 | 见 character/Phoenix-Prompt.md（含逐步引导补丁）|
| A2 | 对话状态管理方案（v2：Phoenix 主导） | Zayn | 🔲 待做 | ← A1 ✅，可开始 |
| A3 | Phoenix 眨眼帧 | Lisa | 🔲 待做 | 无前置 |
| A4 | Phoenix 说话帧 | Lisa | 🔲 待做 | 无前置 |

---

## 🛠 技术

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| T1 | 确定内部渲染分辨率 | Zayn | 🔲 待做 | ← D1 · 可先用 1024×576 占位 |
| T2 | 搭建项目骨架（index.html + main.js + chat.js + style.css + server.py） | Zayn | 🔲 待做 | 1024×576 + crisp:true · HTML overlay 聊天框 · PhoenixAI harness · CORS · → 解锁 T3 |
| T3 | Kaplay 接入，两个场景可切换 | Zayn | 🔲 待做 | ← T2 · → 解锁 T4, T8, T9 |
| T4 | HTML overlay 聊天框基础实现 | Zayn | 🔲 待做 | ← T3 · → 解锁 T6, T7 |
| T5 | Flask /chat 路由接入 AI API | Zayn | 🔲 待做 | ← A1 ✅, G9 · 可与 T3/T4 并行 |
| T6 | 酒瓶点击 → 注入 context 打通 | Zayn | 🔲 待做 | ← T4 + G5 + G9 |
| T7 | Typewriter 打字效果 | Zayn | 🔲 待做 | ← T4 |
| T8 | 灯光闪烁动画 | Zayn | 🔲 待做 | ← T3 |
| T9 | 场景切换过渡动画 | Zayn | 🔲 待做 | ← T3 |
| T10 | 更新 CLAUDE.md（新技术栈） | Zayn | ✅ 完成 | — |
| T11 | 部署方案确认 | Zayn | ✅ 完成 | Docker 打包 → 自有云服务器 + 自有域名，前端静态文件由 nginx 托管 |
| T13 | 编写 Dockerfile + docker-compose.yml | Zayn | 🔲 待做 | ← T2 完成后 · nginx + gunicorn + Flask 打进同一个 compose |
| T14 | 换用 Gunicorn 作生产服务器 | Zayn | 🔲 待做 | ← T2 · gunicorn -w 4 server:app · 写进 Dockerfile CMD |
| T15 | Phoenix AI Harness（PhoenixAI 类，包住 Minimax API） | Zayn | 🔲 待做 | ← T2 · 负责 prompt 拼装 / [GAME:] 解析 / 错误处理 |
| T12 | Phoenix 知识库注入方式 | Zayn | ✅ 完成 | 全量注入，见 project/Cocktail-List.md（31款）|

---

## 🖼 设计资产

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| D1 | 确认所有现有资产为最终版 | Lisa | 🔲 待做 | W1 已定，可开始 · → 解锁 T1 |
| D2 | Phoenix 眨眼帧交付 | Lisa | 🔲 待做 | = A3，无前置 |
| D3 | Phoenix 说话帧交付 | Lisa | 🔲 待做 | = A4，无前置 |
| D4 | 像素字体选型 | Lisa | ✅ 完成 | ARCADECLASSIC |

---

## ✅ 已完成

| 事项 | 完成时间 |
|---|---|
| 确认项目 pivot 方向（像素风 AI 酒吧） | 2026-05-21 |
| 确认技术栈（Kaplay + Flask） | 2026-05-27 |
| 建立 v2 branch，清理 v1 代码 | 2026-05-27 |
| 设计资产初版交付（bar/entrance/Phoenix/6瓶子） | 2026-05-27 |
| Phoenix 性格问卷收回（character/Phoenix-Answers.md） | 2026-05-27 |
| 建立 docs 索引（README.md） | 2026-05-27 |
| Kaplay 技术笔记整理 | 2026-05-27 |
| 用户旅程 Brainstorm 原料存档 | 2026-05-27 |
| 确认用户旅程方向：v2 高自由度（Phoenix 主导） | 2026-05-27 |
| 更新 CLAUDE.md（Kaplay + Flask 新技术栈） | 2026-05-27 |
| Phoenix system prompt 完整版（性格 + 世界观 + 逐步引导）| 2026-05-27 |
| Asset Spec 文档发给 Lisa | 2026-05-27 |
| 像素字体确认：ARCADECLASSIC | 2026-05-27 |
| W1 完成：近未来义体化赛博朋克世界观（Lisa） | 2026-05-27 |
| W2 完成：酒吧无名，存在于麻醉缝隙 | 2026-05-27 |
| W3 完成：Phoenix 角色世界观写入 prompt | 2026-05-27 |
| A1 完成：Phoenix system prompt 完整版 | 2026-05-27 |
| T12 完成：全量注入，Cocktail-List.md（31款含秘密配方）| 2026-05-27 |
| 确认全部 practical needs 已覆盖 | 2026-05-27 |
