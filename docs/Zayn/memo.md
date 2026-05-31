# Zayn's Working Notes — Phoenix's Bar

> 这是 Zayn 的内部参考文档，用于 Lisa sync 前的准备  
> 最后更新：2026-05-29

---

## 一、系统架构理解

### Phoenix AI Harness（server.py）

**启动时（一次性）：**
```
读 Phoenix-Prompt.md → 正则提取 ```代码块里的纯文字
读 Cocktail-List.md → 替换 prompt 里的 [INJECT...] 占位符
拼接 GAME TRIGGER PROTOCOL → 告诉 AI 如何追加 [GAME:cocktail_name]

最终 system_message = 性格 + 世界观 + 31款配方 + 触发协议
```

**每次请求：**
```
POST /chat { messages: [...] }
    → _clean_messages()     过滤非法输入
    → _is_opening()         空消息 → 直接返回 "Welcome." 不调 API
    → 调 Minimax API         system_message + clean_messages
    → _strip_game_marker()  检测 [GAME:xxx]，剥离后分开返回

响应：{ reply: "...", game: null | "Whiskey Sour" }
```

**错误处理：** API 挂了 → 返回 Phoenix 风格 fallback 台词，永远不会 500。

**注意：** `max_tokens=260` 目前够用，如果发现 Phoenix 被截断就改到 400。

---

### Canvas 与聊天框的关系

```
<canvas>（Kaplay 画的）
    ↑ position: fixed, 全屏
<div id="ui-layer">（HTML 叠在上面）
    ↑ position: absolute; pointer-events: none（穿透到 canvas）
    ↳ #chat-overlay（pointer-events: auto，可以输入）
    ↳ #game-overlay（Mixing Game 时显示）
```

**关键：Kaplay 不知道聊天框存在。** 两者通过 `window` 全局变量通信：

| 方向 | 函数 | 作用 |
|---|---|---|
| Kaplay → chat.js | `window.injectBottleContext(spirit)` | 点瓶子时触发，chat.js 发消息给 Flask |
| chat.js → Kaplay | `window.setPhoenixState("idle"\|"shake")` | 切换 Phoenix 动画 |
| Kaplay → chat.js | `window.onBarSceneReady()` | 进入 bar 场景，chat.js 触发开场 |

**为什么聊天框不画在 canvas 里：** 文字输入、光标、滚动、换行在 canvas 里要自己实现，成本极高。HTML overlay 是标准做法，不是妥协。

---

## 二、决策地图（Lisa sync 准备）

### 核心原则
**给约束 + 问题，不给设计。** 让 Lisa 出设计，Zayn 来实现。

---

### G2 — 入口屏交互细节

**当前状态：** splash.png 里已有 START/QUIT 文字图形，Codex 在图片上叠了半透明矩形方块来检测点击。两者是否精确重叠——未验证。

**技术约束：** Kaplay sprite 没有原生点击区域，需要用 `area()` 组件或透明覆盖层来检测。

**需要和 Lisa 确认的 3 个问题：**
1. 半透明方块保留还是去掉？（它现在是 UI 的一部分）
2. 入口屏有没有动画？（触手、灯光、雨水——图片里都有，目前静止）
3. START → 酒吧是即时切换还是有过渡？

---

### G3 — 酒吧场景交互地图

**当前状态（重要）：**
```
Layer 3: 7个独立瓶子 sprite（可交互）← 位置是估值，未视觉校准
Layer 2: Phoenix 立绘（可交互）
Layer 1: home.png 背景 ← 里面也画了瓶子（不可交互）
```

独立 sprite 叠在背景图的瓶子上——如果没对齐，会看到两层瓶子偏移。

**技术约束：** 坐标只能靠跑起来目测调，没有其他方法。对齐是视觉校准，不是设计决策。

**需要和 Lisa 讨论的：**

*视觉校准（一起开着游戏调，30 分钟搞定）：*
- 7个瓶子的位置是否和 home.png 里的瓶子对齐？

*设计决策（Lisa 来定）：*
- home.png 里还有哪些元素可以交互？
  - 菜单黑板（右侧 MENU 字样）
  - 右上角菜单牌
  - 水族馆/鱼缸
  - Phoenix 本人
- 点击瓶子除了注入 context，还要有什么视觉反馈？

---

### G4 — 对话 UI

**技术约束（Lisa 需要知道）：**
- 聊天框是 HTML `<div>`，不是画在 canvas 里的
- 可以用任何 CSS 控制——边框、背景、字体、动画
- 当前：右下角，360px 宽，消息区最高 240px，字体 ARCADECLASSIC

**Lisa 要出设计：**
- 用户消息 vs Phoenix 消息的视觉区分
- 输入框和发送按钮的样式
- 整体 border / 背景处理

**产出格式：** 参考图或 CSS 规格，Zayn 对照实现。

---

### G6 — 配方呈现方式

**当前状态：** 完全未实现，Phoenix 推荐酒后配方就是聊天文字。

**三个方案：**
- **A. 纯文字**（零工作量，配方长时读起来费劲）
- **B. 聊天里的样式卡片**（chat.js 识别配方消息，渲染特殊 DOM + CSS）
- **C. 场景里的道具**（Kaplay 渲染，deadline 前风险高）

**建议：** deadline 前用 A，后续升级到 B。需要和 Lisa 快速确认。

---

### browse.png 的用途

**是什么：** home.png 的暗色版本，同样构图，整体压暗。

**最合理的用途：** Mixing Game 触发时切换到这个场景——暗示"气氛变了，考验开始"。

**技术上：** browse.png 已经 loadSprite 进 Kaplay 了，随时可以切。

**需要确认：** 这是不是 Lisa 设计它的意图。

---

### G8 — Mixing Game UI

**当前状态：** `#game-overlay` div 存在，有占位内容，没有实际逻辑。

**有 4 个状态需要设计：**

| 状态 | 内容 |
|---|---|
| 游戏进行中 | 题目 + 4个选项 + 进度条（1/5） |
| 即时反馈 | 高亮正确/错误答案 |
| 结束-成功（≥4/5）| Phoenix 沉默点头 |
| 结束-失败（<4/5）| Phoenix 最刻薄的话 |

**技术约束：**
- 全部 HTML/CSS over canvas，Lisa 全权设计
- browse.png 如果用作背景，canvas 需要切场景
- Phoenix 在游戏期间的状态未定——还在场景里吗？

**产出：** 4 个状态的视觉稿（工作量最大，需要最早拿到）。

---

## 三、Lisa Sync 议程

按优先级排序：

1. **browse.png 用途确认**（一个问题，30 秒）
2. **G2 入口屏 3 个问题**（5 分钟）
3. **G3 瓶子位置校准**（一起看游戏调，30 分钟）
4. **G3 其他交互元素**（她决定哪些可点）
5. **G4 聊天框设计**（给约束，她出设计）
6. **G8 Mixing Game UI 设计**（给状态列表，她出设计，最晚周六交）
7. **G6 配方呈现**（建议先纯文字，确认一下）
8. **Deadline 对齐**（周一下午，她那边的节奏如何）
