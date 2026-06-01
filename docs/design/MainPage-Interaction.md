# Main Page — Interaction Design

> 最后更新：2026-05-31  
> 范围：bar scene 主场景的 UI 布局 + 3 个 AI 通信接口 + 酒瓶信号设计

---

## 一、页面布局（Figma 2048×1152 坐标空间）

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  [Phoenix]  ╔══════════════════════════════════════╗        │
│  417,397    ║  Speech Bubble — Phoenix 回复         ║        │
│  248×718    ║  left:661  top:397  width:945  h:124 ║        │
│             ╚══════════════════════════════════════╝        │
│                                                              │
│  ── bar counter (top:803) ───────────────────────────────── │
│  🍶Tequila  🍸Gin   🍺Rum   🍶Vodka  🥃Whiskey  ✨Mystery  │
│  780,636    906     1029    1154     1276        1400        │
│                                                              │
│  ┌ chat panel (141,930 · 1791×179) ─────────────────────┐  │
│  │  Say Something to Phoenix...  [Quick Bubble]  [  →  ] │  │
│  │  input: 175,950 · w:1265      1469,863         1879   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Phoenix sprite: `phoenix_idle.png` 600×900，在 2048 空间内渲染为 248×718。  
坐标系：全场景用 `transform: scale(Math.min(vw/2048, vh/1152))` 缩放，所有坐标为 Figma 原始值。

---

## 二、3 个 AI 通信接口

### ① 用户文字输入

| 项 | 值 |
|---|---|
| 触发 | 底部 input 打字 + Enter / 点击 → 按钮 |
| 处理 | 取出 pendingBottleSignal（若有）拼入 context，清空 signal |
| 发送 | `POST /chat { messages: [..., { role:"user", content }] }` |
| 回复 | 写入 Speech Bubble |

### ② 快捷提示词 Bubble

| 项 | 值 |
|---|---|
| 位置 | Figma `1469,863`，463×48（Group34 pill 区域） |
| 触发 | 点击预设 prompt（内容待定，如 "Recommend something"） |
| 处理 | 同 ①，把 prompt 当 user message，取出 pendingBottleSignal |
| 发送 | 同 `POST /chat` |
| 回复 | 同写入 Speech Bubble |
| 当前状态 | 独立于酒瓶信号，内容 TBD |

### ③ Phoenix 回复显示

| 项 | 值 |
|---|---|
| 位置 | Speech Bubble，`left:661 top:397 width:945 height:124` |
| 内容 | 最新一条 Phoenix 回复（不保留历史滚动） |
| 状态 | idle 时显示上一条；AI 思考中显示 `...` |

---

## 三、酒瓶信号接口

### 设计原则

- 瓶子点击**只负责发信号**，不直接触发 AI 调用
- 信号是**一次性的**：被消费（随下一次发送）后自动清空
- **单信号**：后点的覆盖前点的，同一时刻最多一个待消费信号
- 酒瓶信号与 Quick Bubble（②）**完全独立**，暂不联动

### 接口定义

```js
// 当前待消费信号（null = 无信号）
let pendingBottleSignal = null;  // { spirit: "gin" } | null

// 瓶子点击时调用
function emitBottleSignal(spirit) {
  pendingBottleSignal = { spirit };
  // TODO: 视觉反馈（高亮选中瓶子）
}

// 发送消息前调用，取出并清空信号
function consumeBottleSignal() {
  const signal = pendingBottleSignal;
  pendingBottleSignal = null;
  return signal;  // { spirit: "gin" } 或 null
}
```

### 消费示例（发送消息时）

```js
function sendToAI(userText) {
  const signal = consumeBottleSignal();
  const content = signal
    ? `[User is looking at the ${signal.spirit}]\n${userText}`
    : userText;
  // POST /chat { messages: [..., { role:"user", content }] }
}
```

### 扩展预留

| 扩展点 | 说明 |
|---|---|
| 信号影响 Quick Bubble | 点瓶子后 pill 区域出现相关提示词（如点 Gin → "Make me a G&T"） |
| 信号持久化 | 改为"持续附着"模式，直到用户主动清除 |
| 多信号叠加 | 允许同时选多个瓶子，信号改为数组 |

---

## 四、完整数据流

```
用户点击瓶子
    └─ emitBottleSignal(spirit) → pendingBottleSignal = { spirit }
                                   [视觉：瓶子高亮]

用户输入文字 + 发送  ──OR──  Quick Bubble 点击
    └─ consumeBottleSignal()   → 取出 signal，清空
    └─ 构造 content（含 signal context 或纯文字）
    └─ POST /chat
    └─ 等待回复
         └─ Speech Bubble 显示 "..."
         └─ 收到回复 → Speech Bubble 更新为 Phoenix 文字
                       Phoenix sprite 切换 idle_talk → idle
```

---

## 五、当前实现状态

| 模块 | 状态 | 说明 |
|---|---|---|
| Speech Bubble 布局 | 🔲 待实现 | proto2 已有 React 原型，需移植到 Kaplay bar scene |
| 底部 Chat Panel | 🔲 待实现 | 替换现有右下角 chat overlay |
| 酒瓶信号接口 | 🔲 待实现（接口已定义）| 留好 emitBottleSignal / consumeBottleSignal |
| Quick Bubble | 🔲 待定内容 | 位置 / 样式已知，prompt 内容 TBD |
| AI 通信 | ✅ 已有 | `POST /chat` Flask 路由，chat.js 已实现 |
