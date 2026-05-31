# Action Index

> 所有行动事项的单一入口。每次工作前看这里，完成后更新状态。  
> 最后更新：2026-05-29

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
| G4 — 对话 UI 设计 | Lisa |
| G6 — 配方呈现方式 | Zayn + Lisa |
| G8 — Mixing Game UI 设计 | Lisa |
| A3 — Phoenix 眨眼帧 | Lisa |
| A4 — Phoenix 说话帧 | Lisa |
| D1 — 确认资产最终版 | Lisa |
| T9 — 场景切换过渡动画 | Zayn |
| T13 — Dockerfile + docker-compose.yml | Zayn |

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
| G2 | 场景设计：入口屏交互细节 | Zayn + Lisa | 🔲 待做 | — |
| G3 | 场景设计：酒吧场景交互地图 | Zayn + Lisa | 🔲 待做 | → 解锁 G5 |
| G4 | 对话 UI 设计：位置 & 样式 | Lisa | 🔲 待做 | — |
| G5 | 酒瓶点击的精确行为 | Zayn | 🔲 待做 | ← G3 |
| G6 | 配方呈现方式 | Zayn + Lisa | 🔲 待做 | 建议先用纯文字，后续升级卡片 |
| G7 | Mixing Game 题目来源 | Zayn | ✅ 完成 | 全部 31 款步骤已整合进 Cocktail-List.md |
| G8 | Mixing Game UI 设计（题目布局/进度条/结果画面） | Lisa | 🔲 待做 | — |
| G9 | Phoenix 触发 Mixing Game 的通信协议 | Zayn | ✅ 完成 | `[GAME:cocktail_name]` 标记，server.py 已实现 |

---

## 🧑‍🎤 角色 & AI

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| A1 | Phoenix system prompt 设计 | Zayn | ✅ 完成 | 见 character/Phoenix-Prompt.md |
| A2 | 对话状态管理 | Zayn | ✅ 完成 | chat.js 里 messages 数组，全历史随每次请求发送 |
| A3 | Phoenix 眨眼帧 | Lisa | ✅ 完成 | 无前置 |
| A4 | Phoenix 说话帧 | Lisa | ✅ 完成 | 无前置 |

---

## 🛠 技术

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| T1 | 确定内部渲染分辨率 | Zayn | ✅ 完成 | 1024×576，已在 main.js 里确认 |
| T2 | 项目骨架 | Codex | ✅ 完成 | PR #23 merged，含 T3-T8/T15/A2 |
| T3 | Kaplay 接入，两个场景可切换 | Codex | ✅ 完成 | main.js |
| T4 | HTML overlay 聊天框基础实现 | Codex | ✅ 完成 | index.html + chat.js |
| T5 | Flask /chat 路由接入 AI API | Codex | ✅ 完成 | server.py |
| T6 | 酒瓶点击 → 注入 context 打通 | Codex | ✅ 完成 | main.js onClick + chat.js injectBottleContext |
| T7 | Typewriter 打字效果 | Codex | ✅ 完成 | chat.js typewriter() |
| T8 | 灯光闪烁动画 | Codex | ✅ 完成 | main.js dimmer opacity onUpdate |
| T9 | 场景切换过渡动画 | Zayn | 🔲 待做 | 目前是即时切换，需要加淡入淡出 |
| T10 | 更新 CLAUDE.md（新技术栈） | Zayn | ✅ 完成 | — |
| T11 | 部署方案确认 | Zayn | ✅ 完成 | Docker → 自有云服务器 + 域名，nginx + gunicorn |
| T12 | Phoenix 知识库注入方式 | Zayn | ✅ 完成 | 全量注入，server.py 启动时读取 Cocktail-List.md |
| T13 | Dockerfile + docker-compose.yml | Zayn | 🔲 待做 | nginx + gunicorn + Flask |
| T14 | Gunicorn 生产服务器 | Zayn | 🔲 待做 | 写进 Dockerfile CMD，requirements.txt 已有 |
| T15 | Phoenix AI Harness | Codex | ✅ 完成 | server.py PhoenixAI 类 |

---

## 🖼 设计资产

| # | 事项 | 负责 | 状态 | 备注 |
|---|---|---|---|---|
| D1 | 确认所有现有资产为最终版 | Lisa | 🔲 待做 | → 解锁 T1（已占位 1024×576，最终确认后微调）|
| D2 | Phoenix 眨眼帧交付 | Lisa | ✅ 完成 | = A3，600×900，透明背景 |
| D3 | Phoenix 说话帧交付 | Lisa | ✅ 完成 | = A4，600×900，透明背景 |
| D4 | 像素字体选型 | Lisa | ✅ 完成 | docs/Lisa/Press_Start_2P |

---

## ✅ 已完成

| 事项 | 完成时间 |
|---|---|
| 确认项目 pivot 方向（像素风 AI 酒吧） | 2026-05-21 |
| 确认技术栈（Kaplay + Flask） | 2026-05-27 |
| 建立 v2 branch，清理 v1 代码 | 2026-05-27 |
| 设计资产初版交付（splash/home/Phoenix/7瓶子） | 2026-05-27 |
| Phoenix 性格问卷收回 | 2026-05-27 |
| 建立 docs 索引 | 2026-05-27 |
| 确认用户旅程方向：v2 高自由度 | 2026-05-27 |
| 更新 CLAUDE.md | 2026-05-27 |
| Phoenix system prompt 完整版 | 2026-05-27 |
| Asset Spec 发给 Lisa | 2026-05-27 |
| 像素字体确认：ARCADECLASSIC | 2026-05-27 |
| W1/W2/W3 世界观全部完成 | 2026-05-27 |
| A1 Phoenix system prompt | 2026-05-27 |
| G7 全部 31 款鸡尾酒步骤整合完成 | 2026-05-28 |
| G9 通信协议确定（[GAME:] 标记）| 2026-05-28 |
| T11 部署方案确定 | 2026-05-28 |
| T12 知识库注入方式确定 | 2026-05-28 |
| T2 项目骨架完成（PR #23 merged）| 2026-05-28 |
