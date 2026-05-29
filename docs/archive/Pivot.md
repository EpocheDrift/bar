# Project Pivot — 像素风 AI 酒吧

> 最后更新：2026-05-29 · 状态：骨架完成，视觉调整 + Mixing Game 阶段

---

## 项目现状

| 项目 | 内容 |
|---|---|
| **团队** | Zayn（Developer）+ Lisa（Designer） |
| **Deadline** | 2026-06-02 周一下午 |
| **作业性质** | Vibe Coding 练习，无 domain/技术限制 |
| **后续计划** | 交作业后继续打磨为正式 portfolio 作品 |

---

## 核心概念

像素风 AI 酒吧游戏。用户在义体手术的麻醉间隙进入一间无名酒吧，和 AI 酒保 **Phoenix**（冷淡毒舌，以真实朋友为原型）对话，得到一杯专属鸡尾酒推荐。场景中有可交互的酒瓶作为对话快捷方式。Phoenix 会在合适时机发起 Mixing Game 挑战。

完整世界观见 `docs/project/Worldbuilding.md`。

---

## 技术栈（已定）

| 层 | 技术 |
|---|---|
| 游戏渲染 | **Kaplay**（Kaboom.js 社区维护 fork），1024×576 内部分辨率，crisp:true |
| 后端 | **Flask** + **Gunicorn**（生产），单路由 `/chat` |
| AI | **Minimax API**（OpenAI-compatible），PhoenixAI harness 包装 |
| 部署 | **Docker** → 自有云服务器 + 自有域名，nginx 反代 |

---

## 设计资产（当前版本，存于 `docs/assets/`）

| 文件 | 内容 | 状态 |
|---|---|---|
| `splash.png` | 入口屏（暗黑哥特风，带 START/QUIT）| reference |
| `home.png` | 主酒吧场景（水族馆 + Phoenix + 吧台）| reference |
| `browse.png` | 暗色酒吧场景（用途待确认）| reference |
| `standing.png` | Phoenix 站立 / idle 立绘 | reference |
| `shake_1.png` | Phoenix 摇酒动作帧 | reference |
| `Gin/Rum/Whiskey/Vodka/Tequila/Brandy/Cointreau.png` | 7 种酒瓶 sprite | reference |

---

## 交互模型（v2 — 已定）

Phoenix 主导，无固定路径。用户自由对话，Phoenix 自己决定何时推荐、何时发起 Mixing Game。
酒瓶点击 = 注入对话 context 的快捷方式，不是独立功能。

完整流程见 `docs/design/Flow-v2.md`。

---

## Practical Needs（全部已覆盖）

1. **配方发现** → Phoenix 对话中给出配方
2. **AI 推荐** → Phoenix 根据心情/口味/点击的瓶子推荐
3. **逐步引导** → Phoenix 在对话中教调酒；Mixing Game 是游戏化版本
4. **Web 可访问** → 浏览器直接打开

---

## 动画优先级

### 第一梯队（已完成）
- ✅ Typewriter 打字效果
- ✅ 灯光闪烁（dimmer onUpdate）
- ✅ 酒瓶 hover 上浮反馈

### 第二梯队（待 Lisa 交付帧）
- 🔲 Phoenix 眨眼动画（`phoenix_blink.png`）
- 🔲 Phoenix 说话动画（`phoenix_talk.png`）

### 第三梯队（有余力再做）
- 场景切换淡入淡出
- 水族馆鱼动画
