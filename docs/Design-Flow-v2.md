# Game Design Flow — v2 高自由度版

> 状态：待评估 · 2026-05-27

---

## 核心原则

- 没有明确的"功能入口"，一切从对话里自然涌现
- Phoenix 主导一切——决定什么时候推荐、什么时候挑战、什么时候冷处理
- Mixing Game 不是用户"选择进入"的，是 Phoenix 突然甩给你的
- 酒瓶、场景元素是对话触发点，不是功能按钮
- 没有强制终点，像真正在酒吧里一样

---

## 与 v1 的核心差别

| | v1 融合方案 | v2 高自由度 |
|---|---|---|
| **结构** | 用户走一条路径 | 对话自然涌现 |
| **Mixing Game 触发** | 用户主动说"我想试试" | Phoenix 突然发起 |
| **推荐时机** | Phoenix 追问 1-2 次后必然出现 | Phoenix 自己判断 |
| **终点** | 拿到海报 / 游戏结束后回 Bar | 没有终点 |
| **Phoenix 的感觉** | 冷淡但配合 | 完全不可预测 |

---

## 完整流程图

```
Entrance → START → Bar Scene
                       │
           Phoenix: "What do you want."
                       │
                  用户开始聊
                       │
            ┌──────────┼──────────────┐
            ▼          ▼              ▼
        用户打字     点击酒瓶       沉默不说话
            │          │              │
            │    Phoenix 接过去        │
            │    聊这瓶酒              Phoenix 先无视
            │          │              一段时间后说
            └────┬─────┘              一句刻薄的话
                 │
                 ▼
         Phoenix 自由回应
      （推荐 / 追问 / 聊别的 / 无视）
                 │
         ┌───────┴──────────────────────┐
         ▼                              ▼
   Phoenix 觉得                  Phoenix 觉得
   聊够了，给推荐                 你该证明自己
         │                              │
         ▼                              ▼
  AI 鸡尾酒卡片出现           Mixing Game 突然开始
  Phoenix 加一句短评           "Let's see if you
                               can actually do this."
         │                              │
         │                    ┌─────────┴──────────┐
         │                    ▼                    ▼
         │                 ≥ 4/5                < 4/5
         │                    │                    │
         │           Phoenix 沉默点头        Phoenix 说
         │           不夸，但你感觉到了       最刻薄的话
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                         回到 Bar
                    可以继续聊，可以离开
                    没有强制终点
```

---

## 关键行为设计

### Phoenix 什么时候给推荐？
不是用户触发，是 Phoenix 自己判断。可能是：
- 聊了 3-4 轮之后
- 用户说了触发词（"I don't know"、"surprise me"、"whatever"）
- Phoenix 直接说："I know what you need."

### Phoenix 什么时候触发 Mixing Game？
Phoenix 决定，可能是：
- 用户拿到推荐后说"sounds good" / "interesting"
- Phoenix 直接挑衅："You think you can make this? Let's find out."
- 用户聊天中流露出"会调酒"的意思 → Phoenix 来挑战

### 用户沉默会发生什么？
Phoenix 不主动催，但沉默超过一定时间后：
- "You going to order something or just stand there."
- "I don't have all night."

### Mixing Game 结果处理
- **≥ 4/5**：Phoenix 沉默点头，不夸，但用户感觉到了
- **< 4/5**：Phoenix 说最刻薄的话，例如：
  - "This is painful to watch."
  - "Did you even try?"
  - "Come back when you've learned something."

---

## 9天可行性

比 v1 的额外难点：Phoenix 的 AI 判断逻辑要做得足够好，"自主决策"才能显得自然而不随机。本质上是 system prompt 质量 + 对话轮次的简单状态管理，技术实现并不复杂。

---

## 相关文件
- [[Design-Flow-v1]] — 结构化融合方案（对照版本）
- [[Brainstorm-Journey]] — 方向 A / B 原始 brainstorm
- [[Phx-Answer]] — Phoenix 性格原料
