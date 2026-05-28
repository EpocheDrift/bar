# Project Pivot — 像素风 AI 酒吧

> 最后更新：2026-05-27 · 状态：游戏设计方向已定（v2），技术选型已定，待开始开发

---

## 背景

原版本（HangoverGPT / Pour Decisions v1）是一个功能完整但缺乏创意的 CRUD+AI 鸡尾酒应用，是快速假设实现的一版。现决定全面重构，目标是做一个 portfolio 级别的 creative project。

---

## 项目现状

| 项目 | 内容 |
|---|---|
| **团队** | Zayn（Developer）+ Lisa（Designer） |
| **硬性 Deadline** | ~9天（作业交付）|
| **后续计划** | 交作业后花更多时间打磨成真正有趣的产品 |
| **作业性质** | Vibe Coding 练习，无 domain/技术限制 |

---

## 新方向：像素风 AI 酒吧

### 核心概念

用户打开页面，进入一个**像素风格的酒吧场景**。吧台后面站着一个以朋友真实形象为原型的像素风酒保 **Phoenix**，其背后接入 AI。用户可以和 Phoenix 自由对话，Phoenix 根据心情、口味、偏好推荐鸡尾酒并有自己的性格。场景中有可交互的元素（酒瓶等）辅助对话。

### 创意核心（必须有）

1. **场景感** — 用户感觉"进入"了一个像素风酒吧
2. **AI 酒保角色** — Phoenix，有真实人物原型的性格，不是普通 chatbot

---

## 设计资产（Lisa 已交付）

存放于 `docs/pics/`

| 文件 | 内容 |
|---|---|
| `Entrance.png` | 入口/标题屏（暗黑哥特风，带 START / QUIT 按钮） |
| `bar.png` | 主酒吧场景（水族馆背景 + Phoenix 在吧台后 + 吧台瓶子） |
| `Figure-Phx.png` | Phoenix 全身立绘（独立 sprite，用于对话叠加） |
| `Gin.png` | Gin 瓶子 sprite |
| `Rum.png` | Rum 瓶子 sprite |
| `Whisky.png` | Whiskey 瓶子 sprite |
| `Vodka.png` | Vodka 瓶子 sprite |
| `Tequila.png` | Tequila 瓶子 sprite |
| `Brandy.png` | Brandy 瓶子 sprite |

目前所有资产均为 **reference**，可根据最终设计调整。

---

## 交互模型

**混合模式：对话驱动主线 + 场景交互辅助**

```
入口屏（Entrance） → 点 START → 酒吧场景（Bar）
                                      ↓
                            Phoenix 开口问候
                                      ↓
主路径：用户自由打字对话          辅助路径：点击酒瓶 / 菜单
  → Phoenix 推荐鸡尾酒         → 自动注入对话上下文
  → 给出配方 / 步骤            （告诉 Phoenix 感兴趣的烈酒）
  → 有性格地聊天
```

**交互元素（瓶子、菜单等）是对话的快捷方式，不是独立功能。**

---

## 从旧版提炼的 Practical Needs

以下四点通过对话流全部可以满足：

1. **配方发现** — Phoenix 对话中给出配方
2. **AI 推荐** — Phoenix 根据心情/口味/点击的瓶子推荐
3. **逐步引导** — Phoenix 在对话中 step-by-step 教调酒
4. **Web 可访问** — 浏览器直接打开

---

## 技术栈（已定）

| 层 | 技术 | 原因 |
|---|---|---|
| **游戏渲染** | **Kaboom.js** | 内置像素风渲染管线（内部低分辨率 + nearest-neighbor 放大）；场景/sprite 管理开箱即用；比 Phaser 轻，适合我们规模 |
| **后端** | Flask（极简） | 单路由 `/chat`，转发 AI API 调用 |
| **AI** | OpenAI / Minimax API | 沿用现有 key |

### 为什么不用 HTML div + PNG 堆叠

像素风游戏的正确渲染方式是：在统一的低分辨率画布上绘制所有元素，再整体 nearest-neighbor 放大到屏幕。CSS 定位的浮点坐标会导致亚像素渲染，破坏像素风的硬边缘质感。Kaboom.js 的 Canvas 管线天然解决这个问题。

---

## 动画优先级

### 第一梯队（纯 JS/CSS，不需要新资产）

1. **Typewriter 打字效果** — Phoenix 说话时文字逐字出现，视觉小说感的核心，最高优先
2. **灯光闪烁** — 酒吧灯微弱随机闪烁，氛围感
3. **酒瓶 hover / 点击反馈** — 悬停上浮 + 点击下压
4. **场景切换过渡** — Entrance → Bar 的淡入淡出
5. **Entrance 触手摆动** — 极慢的 rotate 动画，不需改图

### 第二梯队（需要 Lisa 提供额外帧）

6. **Phoenix 眨眼动画** — 1 张额外帧，每 4-6s 切换，角色"活了"
7. **Phoenix 说话动画** — 1 张嘴微开帧，AI 生成中切换

### 第三梯队（有余力再做）

8. 水族馆鱼动画（CSS 叠加游动小鱼）
9. 环境粒子（灯光下浮尘）

---

## 待讨论 / 下次继续

- [ ] **Phoenix 性格 system prompt** — 等 Zayn 向朋友收集信息后设计
- [ ] **Kaboom.js 上手** — Zayn 需要了解基本 API（场景、sprite、input）
- [ ] **对话 UI 在 Kaboom 里怎么做** — 原生 canvas 绘制 vs HTML overlay
- [ ] **酒瓶点击的具体行为** — 点击后 Phoenix 说什么 / 注入什么 context
- [ ] **内部渲染分辨率确定** — 根据 Lisa 资产尺寸决定（如 480×270）
- [ ] **Lisa 额外交付物** — Phoenix 眨眼帧 + 说话帧（第二梯队动画前提）
