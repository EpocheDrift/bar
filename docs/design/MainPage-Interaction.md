# Main Page — Interaction Design

> 最后更新：2026-06-01  
> 范围：bar scene 主场景的 UI 布局 + 3 个 AI 通信接口 + 酒瓶信号设计

---

## 一、页面布局（Figma 2048×1152 坐标空间）

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  [Phoenix]  ╔═══════════════════════════════════════╗        │
│  417,397    ║  Speech Bubble — Phoenix 回复          ║        │
│  248×718    ║  left:661  top:397  width:945  h:124  ║        │
│             ╚═══════════════════════════════════════╝        │
│                                                               │
│  ── bar counter (top:803) ────────────────────────────────── │
│  🍶Tequila  🍸Gin  🍺Rum  🍶Vodka  🥃Whiskey  ✨Cointreau  │
│  780,636    906    1029   1154     1276        1400           │
│                                                               │
│              [ pill3 ][ pill2 ][ pill1 ]  ← top:863, x=1932 │
│  ┌ chat panel (141,930 · 1792×179) ──────────────────────┐  │
│  │  Say Something to Phoenix...                   [  →  ] │  │
│  │  input: 175,950 · w:1265                       x=1879  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

Phoenix sprite: `phoenix_idle.png` 600×900，在 2048 空间内渲染为 248×718（object-cover）。  
坐标系：全场景用 `transform: scale(Math.min(vw/2048, vh/1152))` 缩放，所有坐标为 Figma 原始值。

---

## 二、3 个 AI 通信接口

### ① 用户文字输入

| 项 | 值 |
|---|---|
| 触发 | 底部 input 打字 + Enter / 点击 → 按钮 |
| 处理 | 取出 pendingBottleSignal（若有）拼入 context，清空 signal |
| 发送 | `POST /chat { messages: [..., { role:"user", content }] }` |
| 回复 | 写入 Speech Bubble；更新 Quick Bubble pills（见 ②） |

---

### ② 快捷提示词 Bubble

#### 布局

- **数量**：1–3 个动态 pill，随状态变化
- **容器**：右对齐，右边界固定在 x=1932（`right: 116px`），top: 863
- **方向**：`flex-direction: row-reverse`，新 pill 从右往左延伸
- **尺寸**：高度 48px，宽度随文字内容自动撑开（`padding: 0 24px`）
- **间距**：pill 之间 gap 12px

#### 内容来源（两段逻辑）

| 触发时机 | 来源 | 说明 |
|---|---|---|
| 酒瓶点击时 | 预定义（hardcoded） | AI 尚未响应，直接显示对应酒的建议词 |
| Phoenix 每次回复后 | AI 生成（从回复中解析） | 替换当前全部 pills |

**预定义酒瓶建议词：**

| 酒 | Suggestion 1 | Suggestion 2 |
|---|---|---|
| tequila | "Make me a Margarita" | "What mixes with tequila?" |
| gin | "Make me a G&T" | "Gin cocktail ideas?" |
| rum | "Make me a Mojito" | "What's good with rum?" |
| vodka | "Moscow Mule?" | "Vodka cocktails?" |
| whiskey | "Old Fashioned please" | "Best whiskey drink?" |
| cointreau | "What can I make with this?" | "Cointreau cocktail?" |

#### 交互行为

1. **点击 pill** → 自动发送该文字（作为 user message，同样消费 pendingBottleSignal）
2. **被点击的 pill** → 立即从 DOM 中移除（只消失该 pill）
3. **其余 pill** → 进入 disabled 状态（视觉灰掉，不可点击），等待 Phoenix 回复
4. **Phoenix 回复到达** → 整组 pills 替换为 AI 生成的新建议词

#### 状态机

| 状态 | pills 显示 | 可交互 | 转换触发 |
|---|---|---|---|
| **empty** | 无（不显示） | — | 初始状态；AI 回复无 suggestions 时 |
| **active** | 1–3 个 pill | ✅ 可点击 | Phoenix 回复到达（含 suggestions）；酒瓶点击 |
| **disabled** | 1–3 个 pill（灰色） | ❌ 不可点击 | 任意消息发送（用户输入 or pill 点击） |

状态流：
```
初始 → empty
empty → active    [Phoenix 首次回复，含 suggestions]
active → active   [酒瓶点击，立即替换为预定义 suggestions，无发送]
active → disabled [pill 点击 / 用户发送]
disabled → active [Phoenix 回复，含 suggestions]
disabled → empty  [Phoenix 回复，无 suggestions（解析失败或 AI 未输出）]
```

---

### ③ Phoenix 回复显示

| 项 | 值 |
|---|---|
| 位置 | Speech Bubble，`left:661 top:397 width:945 height:124` |
| 内容 | 最新一条 Phoenix 回复（不保留历史滚动），typewriter 逐字效果 |
| 思考中 | 显示 `...` |

---

## 三、酒瓶信号接口

### 设计原则

- 瓶子点击**只负责发信号 + 更新 Quick Bubble**，不直接触发 AI 调用
- 信号是**一次性的**：被消费（随下一次发送）后自动清空
- **单信号**：后点的覆盖前点的，同一时刻最多一个待消费信号

### 接口定义

```js
// 当前待消费信号（null = 无信号）
let pendingBottleSignal = null;  // { spirit: "gin" } | null

// 瓶子点击时调用（main.js）
function emitBottleSignal(spirit) {
  pendingBottleSignal = { spirit };
  window.setQuickBubbles(bottleSuggestions[spirit] || []);
}

// 发送消息前调用，取出并清空信号（chat.js）
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

---

## 四、服务端协议（API 变更）

### Phoenix 回复格式约定

在 Phoenix 的 system prompt 末尾加入以下指令：

```
每次回复结束后，另起一行附加 1–3 个对话建议词，严格使用以下格式（不得多行、不得省略引号）：
SUGGEST: "suggestion1" | "suggestion2" | "suggestion3"
每个建议词不超过 5 个词，用自然英语，符合 Phoenix 的性格。
```

### server.py 解析逻辑

```python
import re

SUGGEST_RE = re.compile(r'\nSUGGEST:\s*(.+)$', re.MULTILINE)

def parse_reply(raw: str):
    match = SUGGEST_RE.search(raw)
    if match:
        parts = [s.strip().strip('"') for s in match.group(1).split('|')]
        suggestions = [p for p in parts if p][:3]
        reply = raw[:match.start()].strip()
    else:
        suggestions = []
        reply = raw.strip()
    return reply, suggestions
```

### API 响应 schema（变更后）

```json
{
  "reply": "Phoenix 的实际回复文字",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
```

- `suggestions` 为空数组时，前端清空 pills（不显示任何 pill）
- `suggestions` 最多取前 3 条，多余丢弃

---

## 五、完整数据流

```
用户点击酒瓶
    └─ emitBottleSignal(spirit)
         └─ pendingBottleSignal = { spirit }
         └─ setQuickBubbles(bottleSuggestions[spirit])  → pills 更新为预定义建议词

用户输入文字 + 发送  ──OR──  Quick Bubble pill 点击（自动发送）
    └─ 被点击的 pill 立即从 DOM 移除（若来自 pill 点击）
    └─ 其余 pills → disabled 状态
    └─ consumeBottleSignal()  → 取出 signal，清空
    └─ 构造 content（含 signal context 或纯文字）
    └─ POST /chat { messages: [...] }
    └─ 等待回复
         └─ Speech Bubble 显示 "..."
         └─ Phoenix sprite → shake
         └─ 收到回复
              └─ server.py 解析 SUGGEST 行，剥离，返回 { reply, suggestions }
              └─ Speech Bubble 更新，typewriter 效果
              └─ Phoenix sprite → shake_talk → idle
              └─ setQuickBubbles(suggestions)  → pills 整组替换
```

---

## 六、当前实现状态

> **架构说明**：bar scene 已从 Kaplay sprite 渲染迁移为纯 HTML 层（`#bar-layer > #bar-scale-root`），使用 2048×1152 坐标系 + `transform:scale` 统一缩放。Kaplay 仅保留用于 intro/GS/bar-intro 序列。

| 模块 | 状态 | 说明 |
|---|---|---|
| Speech Bubble | ✅ 已实现 | 2048px 坐标，SVG tail，typewriter 效果 |
| Chat Panel（用户输入） | ✅ 已实现 | 2048px 坐标，glassmorphism，bottle signal 接入 |
| 酒瓶信号接口 | ✅ 已实现 | 6 瓶位置匹配 proto2，emitBottleSignal / consumeBottleSignal |
| Quick Bubble | 📝 设计完成，待实现 | 样式已有，需改为动态多 pill + 状态机 + click handler |
| server.py SUGGEST 解析 | 📝 设计完成，待实现 | 需修改 parse 逻辑 + API response schema |
| Phoenix Prompt 更新 | 📝 设计完成，待实现 | 需加 SUGGEST 格式指令 |
| AI 通信基础 | ✅ 已有 | `POST /chat`，完整对话历史 |
