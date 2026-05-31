# Game Flow — v2 详细版

> 基于 Flow-v2.md 展开，含每个状态的视觉、交互、技术行为  
> 最后更新：2026-05-30（对照 Figma 稿更新，见 design/Figma-Sync.md）

---

## 图例

```
[ 视觉状态 ]     用户看到的内容
< 用户操作 >     用户能做的事
→ 触发            进入该状态的条件
→ 跳转            离开该状态的条件
⚙ 技术行为        代码层面发生什么
```

---

## 阶段 0 — 页面加载

```
→ 触发：用户打开 URL

[ 视觉 ]
  - 黑色背景（canvas background #0a0a0f）
  - Kaplay 加载所有 sprite（后台进行）

⚙ 技术行为
  - server.py 启动时已读入 system prompt + cocktail list
  - main.js 执行，loadSprite() 加载所有图片
  - 加载完成后自动进入 Intro 场景

→ 跳转：sprite 加载完成 → [阶段 1 Intro 叙事]
```

---

## 阶段 1 — Intro 叙事序列（P1 待实现）

```
→ 触发：页面加载完成

[ 视觉 ]
  - 纯黑背景全屏
  - 像素字体白色文字，每屏一段内容，居中显示
  - 无其他 UI 元素，无 chat overlay

  屏序（点击推进）：
  1. "YEAR: 4144"
  2. 世界观文字（义体化 / 神经植入 / 全面普及）
  3. "Every procedure requires full anesthesia."
  4. "And every time you go under — your mind slips through the cracks
     into a place that shouldn't exist."
  5. "Breathe normally." / "This is a standard augmentation."
     "You won't feel a thing." / "Count backwards from ten."
  6. "..."
  7. "Ten…" → "Nine…" → ... → "One…"（每屏一个数字）
  8. "> ENTER <"（点击后进入酒吧）

< 用户操作 >
  - 点击画面任意位置 → 推进到下一屏
  - 到 "> ENTER <" 点击 → [阶段 2 过渡]

⚙ 技术行为
  - 纯文字渲染，Kaplay text() 或 HTML overlay 均可
  - 无 API 调用
  - 交互方式（点击/键盘）待实现时确认

→ 跳转：点击 "> ENTER <" → [阶段 2 过渡]
```

---

## 阶段 2 — 场景过渡（Intro → Bar）

```
→ 触发：点击 "> ENTER <"

[ 视觉 ]
  - 淡出 Intro，淡入酒吧场景（T9 过渡动画，待实现）
  - 当前：即时切换（无过渡）

⚙ 技术行为
  - k.go("bar")
  - bar 场景内 k.wait(0, () => window.onBarSceneReady()) 触发
  - onBarSceneReady() → chat.js 发出空消息到 /chat
  - /chat 检测到开场 → 返回 "Welcome." 不调 API

→ 跳转：bar 场景加载完成 → [阶段 3 酒吧初始状态]
```

---

## 阶段 3 — 酒吧初始状态（Bar Scene - Opening）

```
→ 触发：进入 bar 场景

[ 视觉 ]
  Canvas：
  - home.png 全屏背景（水族馆 · 灯光 · 吧台 · 凳子）
  - 灯光闪烁（dimmer opacity 0.02-0.045 随机变化，每帧）
  - Phoenix 立绘：idle 姿态，位置吧台后方
  - 7个酒瓶 sprite 叠在吧台上（位置待视觉校准）
  Chat overlay：
  - 显示，Phoenix 消息区
  - Phoenix 正在打字（typewriter 效果）："Welcome."
  - 输入框：disabled 状态（打字机进行中）

< 用户操作 >
  - 等待打字机完成（不可输入）
  - 可以 hover 酒瓶（cursor 变化）

⚙ 技术行为
  - chat.js typewriter("Welcome.") 执行
  - Phoenix sprite：idle（standing.png）
  - 打字机完成后：输入框 enabled，setPhoenixState("idle")

→ 跳转：打字机完成 → [阶段 4 等待用户输入]
```

---

## 阶段 4 — 等待用户输入（Bar Scene - Idle）

```
→ 触发：Phoenix 上一次发言结束

[ 视觉 ]
  Canvas：
  - Phoenix：idle 姿态（未来：偶尔眨眼，每 4-6s 切 phoenix_blink.png）
  - 酒瓶：hover 时上浮 6px，cursor:pointer
  Chat overlay：
  - 历史消息可见
  - 输入框 enabled，等待输入

< 用户操作 >
  A. 在输入框打字并发送         → [阶段 5 用户发消息]
  B. 点击酒瓶                  → [阶段 6 瓶子交互]
  C. 长时间沉默（未定义时间）   → [阶段 7 Phoenix 沉默处理]
```

---

## 阶段 5 — 用户发消息（Sending）

```
→ 触发：用户按 Enter 或点发送按钮

[ 视觉 ]
  Chat overlay：
  - 用户消息出现（右对齐，淡蓝色）
  - 输入框清空，disabled
  Canvas：
  - Phoenix 切换到 shake 姿态（shake_1.png）

< 用户操作 >
  - 无（等待 Phoenix 回复）

⚙ 技术行为
  - sendMessage(text) 执行
  - messages.push({ role:"user", content })
  - setPhoenixState("shake")
  - fetch POST /chat { messages }
  - server 调用 Minimax API

→ 跳转：收到 API 响应 → [阶段 8 Phoenix 回复]
         API 失败      → [阶段 9 错误状态]
```

---

## 阶段 6 — 瓶子交互（Bottle Click）

```
→ 触发：用户点击任意酒瓶

[ 视觉 ]
  Chat overlay：
  - 显示 "You look at the [spirit]." （用户消息，右对齐）
  - 输入框 disabled
  Canvas：
  - Phoenix 切换到 shake 姿态

⚙ 技术行为
  - bottle.onClick → window.injectBottleContext(spirit)
  - injectBottleContext 构造消息 "[I notice you looking at the gin.]"
  - 走完整的 sendMessage 流程
  - 前端展示为友好格式 "You look at the gin."

→ 跳转：同 [阶段 5]，收到回复后进入 [阶段 8]
```

---

## 阶段 7 — Phoenix 沉默处理（Silence）

```
→ 触发：用户长时间没有操作（时间阈值待定）
         目前未实现，是未来功能

[ 视觉 ]
  Chat overlay：
  - Phoenix 自动发出一条刻薄的话
    例："You going to order something or just stand there."
         "I don't have all night."

⚙ 技术行为（待实现）
  - 需要 timer 机制检测用户不活跃
  - 触发后走正常 sendMessage 流程（特殊触发消息）
```

---

## 阶段 8 — Phoenix 回复（Response）

```
→ 触发：/chat 返回响应 { reply, game }

--- 情况 A：普通对话回复（game: null）---

[ 视觉 ]
  Canvas：Phoenix 保持 shake 姿态（打字机进行中）
  Chat overlay：
  - Phoenix 消息区出现，文字逐字打出（28ms/字）

⚙ 技术行为
  - typewriter(assistantEl, reply) 执行
  - messages.push({ role:"assistant", content: reply })
  - 打字机完成 → setPhoenixState("idle")
  - 输入框 enabled

→ 跳转：打字机完成 → [阶段 4 等待用户输入]

--- 情况 B：Phoenix 推荐了一款酒（含 [GAME:] 标记）---

[ 视觉 ]
  Chat overlay：
  - Phoenix 的推荐文字打出（marker 已被 server 剥离）
  Canvas：
  - Phoenix 打字机进行中保持 shake 姿态
  （G6 待定：是否有额外的配方卡片出现）

⚙ 技术行为
  - server._strip_game_marker() 返回 (reply_text, "Daiquiri")
  - chat.js 接收到 data.game = "Daiquiri"
  - 打字机完成后 → 调用 window.startMixingGame("Daiquiri")

→ 跳转：打字机完成 → [阶段 10 Mixing Game]
```

---

## 阶段 9 — 错误状态（Error）

```
→ 触发：fetch 失败 / API 超时

[ 视觉 ]
  Chat overlay：
  - 显示 "..." 作为 Phoenix 的回复（Phoenix 风格的沉默）

⚙ 技术行为
  - catch(error) → appendMessage("assistant", "...")
  - setPhoenixState("idle")
  - 输入框 enabled（用户可以重试）
```

---

## 阶段 10 — Mixing Game 触发（Game Start）

```
→ 触发：chat.js 收到 data.game !== null

[ 视觉 ]
  Canvas：
  - 酒吧背景保留（home.png），不切换
  - Phoenix 立绘缩小保留在左侧
  Game overlay（P4 待实现）：
  - 从 display:none → display:flex
  - 右上角显示 5 颗菱形进度图标
  - 显示第 1 道题目

⚙ 技术行为
  - window.startMixingGame("Daiquiri") 被调用
  - game-overlay 显示
  - 从 Cocktail-List.md 加载该酒的步骤（待实现）
  - 生成 5 道多选题（待实现）
```

---

## 阶段 11 — Mixing Game 进行中（5 轮）

```
每轮结构（Figma 已有设计稿）：

[ 视觉：答题状态 ]
  Game overlay 显示：
  - 右上角：5 颗菱形图标（当前题号高亮）
  - 题目文字（居中，大字）
  - Phoenix 备注（小字，挖苦语气，题目下方）
  - 3 个选项按钮（竖排，1 正确 2 干扰）
  - "> Next"（右下，点击选中选项后激活）

< 用户操作 >
  - 点击任意一个选项
  - 点击 "> Next" 进入下一题

[ 视觉：选项反馈 ]
  - 正确 / 错误高亮（颜色方案待 Lisa 确认）
  - 目前暂定：点击后即时反馈，再点 Next 继续

⚙ 技术行为（待实现）
  - 记录答对数量 score++
  - 5 轮完成后进入结果页
```

---

## 阶段 12 — Mixing Game 结束

```
（Figma 已有设计稿）

[ 视觉 ]
  Game overlay：
  - 分数显示（如 "5/5"）
  - Phoenix 点评文字（因分数不同而不同）
    ≥ 4/5 示例："Five out of five. Don't expect a prize. You answered
                 five questions correctly in a bar that doesn't exist
                 while you're under anesthesia. Cool."
    < 4/5：更刻薄的版本（待设计）
  - ">Back<" 按钮（回到聊天）
  - ">Re-Start<" 按钮（重新开始这局游戏）

→ 跳转：点击 ">Back<" → [阶段 13 返回酒吧]
         点击 ">Re-Start<" → [阶段 10 重新触发]
```

---

## 阶段 13 — 返回酒吧

```
→ 触发：Mixing Game overlay 关闭

[ 视觉 ]
  Game overlay：display:none
  Canvas：
  - 恢复 home.png（如果切换过 browse.png）
  - Phoenix 回到 idle 姿态
  Chat overlay：
  - 历史消息仍在
  - 输入框 enabled

⚙ 技术行为
  - game-overlay 隐藏
  - 对话历史保持（用户可以继续聊）
  - 无强制终点

→ 跳转：自由 → [阶段 4 等待用户输入]
```

---

## 未实现 / 待定项

| 项目 | 状态 | 说明 |
|---|---|---|
| P1 Intro 叙事序列 | 🔲 待实现 | 替代原 entrance 场景，见 Figma-Sync.md |
| P2 Phoenix 6 帧动画 | 🔲 待实现 | 资产已有，main.js 接入 + 状态逻辑 |
| P3 Chat UI 样式对齐 | 🔲 待实现 | Phoenix 名字标签，对话框位置 |
| P4 Mixing Game 正式 UI | 🔲 待实现 | 3 选项、进度图标、结果页，Figma 已有稿 |
| P5 迎接场景 | ⛔ 阻塞 | 等待 Lisa 交付像素背景 |
| T9 场景过渡动画 | 🔲 未实现 | Intro → Bar 目前即时切换 |
| 沉默检测 timer | 🔲 未实现 | 阶段 7，低优先级 |
| G5 瓶子点击精确行为 | 🔲 待 G3 | 当前实现已可用，细化待 G3 |
| Mixing Game 题目生成逻辑 | 🔲 未实现 | 从 Cocktail-List 动态出题，P4 阶段决定 |
| 选项反馈颜色 | ❓ 待确认 | 等 Lisa 确认正确/错误高亮颜色 |
