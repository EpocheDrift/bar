# Mixing Game — Design Spec

> 最后更新：2026-06-01  
> 状态：设计完成，待实现（T19）

---

## 一、完整流程

```
Bar scene
  └─ Phoenix 输出 [GAME:Cocktail Name]
       └─ server.py 解析 → { game: "Whiskey Sour" }
            └─ chat.js 调用 window.startMixingGame("Whiskey Sour")
                 └─ [Intro screen]
                      └─ 点箭头
                           └─ [Quiz screen × 5 题]
                                └─ [Result screen]
                                     ├─ >Back<    → 返回 bar scene，继续对话
                                     └─ >Re-Start< → 同款酒重新开始
```

---

## 二、三个画面

### Screen 1 — Intro（挑战触发）

叠加在 bar scene 之上，不替换背景。

| 元素 | 位置（2048 坐标） | 内容 |
|---|---|---|
| 暗色遮罩 | inset:0, rgba(0,0,0,0.45) | 让 bar 场景变暗 |
| 对话框背景 | left:265, top:728, w:1767, h:406 | SVG 边框形状（来自 proto） |
| 说话人名字 | left:564, top:767 | "Phoenix" |
| 挑战台词 | left:654, top:895 | `"Think you can make a {cocktailName}?"` |
| 导航箭头 | left:1970, top:1082, w:36, h:25 | 点击 → 进入 Quiz |

Phoenix 台词格式：**`"Think you can make a {cocktailName}?"`**

---

### Screen 2 — Quiz（答题）

| 元素 | 位置（2048 坐标） | 说明 |
|---|---|---|
| 题目文字 | center-x:1199.5, top:292 | 当前题目 |
| Phoenix 副标题 | left:834, top:414 | 挖苦文字（答题前显示；答题后换成反馈）|
| 答案框 1 | left:834, top:512, w:818, h:76 | hover 深色↔白色 |
| 答案框 2 | left:834, top:638, w:818, h:76 | |
| 答案框 3 | left:834, top:764, w:818, h:76 | |
| 爱心 × 5 | x:1603/1686/1768/1851/1934, y:67 | 58.7×44px，filled/empty |

**答题反馈流程（每题）：**
1. 用户点击选项
2. 正确 → 选项框绿色高亮，副标题换成 Phoenix 正面（勉强）评语
3. 错误 → 选中框红色，正确答案绿色，扣 1 颗爱心，副标题换成 Phoenix 嘴毒评语
4. 1500ms 后自动进入下一题（或结果页）

**爱心规则：**
- 始终完成全部 5 题，不中途结束
- 错误 → 扣 1 颗爱心
- 最终剩余爱心数 = 分数（0–5）

---

### Screen 3 — Result（结果）

| 元素 | 位置（2048 坐标） | 说明 |
|---|---|---|
| 背景图 | Home 组件（Figma 合成） | 包含分数显示区域 |
| 分数数字 | 需确认 Figma 坐标 | 覆盖在背景图上，格式 `X / 5` |
| Phoenix 评语 | 需确认 Figma 坐标 | 按分数档位显示（见下表） |
| `>Back<` | left:980, top:900 | 返回 bar scene |
| `>Re-Start<` | left:1110, top:900（约）| 重新开始同款酒 |

**Phoenix 分级评语：**

| 分数 | 评语 |
|---|---|
| 5/5 | "...Fine. You actually did it. Don't let it go to your head." |
| 4/5 | "Close enough. I've seen worse. Not much worse, but worse." |
| 3/5 | "Mediocre. Just like everything else about you." |
| 2/5 | "That was painful to watch. Did you even try?" |
| 1/5 | "One out of five. I'd say try harder, but I'm not sure it would help." |
| 0/5 | "Out. Now. Come back when you know what a cocktail is." |

---

## 三、题目生成算法

### 数据来源

`docs/project/Cocktail-List.md` — 31 款配方，每款包含：
- 名称和制作方式（shake / stir / build）
- 配料列表（含比例）
- 步骤列表（编号）

### 三种题型

每局游戏从一款鸡尾酒生成 5 题，随机混合以下题型：

#### 题型 A — 基酒识别
```
问：What's the base spirit in a {cocktail}?
正确选项：该款配方的基酒
错误选项：从其他款配方的基酒随机取 2 个（不重复）
```

#### 题型 B — 步骤内容
```
问：Which step is part of making a {cocktail}?
正确选项：该款配方的某一步骤（随机取）
错误选项：从其他款配方的步骤随机取 2 个
```

#### 题型 C — 制作方式
```
问：How is a {cocktail} prepared?
正确选项：该款配方的方式（shake / stir / build）
错误选项：其他两种方式
```

### 生成规则

```python
def generate_questions(cocktail_name, cocktail_data, all_cocktails, count=5):
    """
    cocktail_data: { name, method, ingredients, steps }
    all_cocktails: 全部 31 款数据
    返回: [ { question, options:[str×3], correctIndex:0|1|2 }, ... ]
    """
    # 1. 按题型生成候选题目
    # 2. 随机打乱选项顺序（correctIndex 跟随移动）
    # 3. 随机选 count 道，确保题型尽量均衡
```

错误选项来源：从 `all_cocktails` 中排除当前鸡尾酒后随机选取，确保不重复且语义合理（同类对比）。

---

## 四、接口定义

### 触发（server.py → chat.js → game）

已有：
```python
# server.py 已实现
{ "reply": "...", "game": "Whiskey Sour", "suggestions": [...] }
```

已有：
```js
// chat.js 已实现
window.startMixingGame = function(cocktailName) { ... }
```

需要补充：`window.startMixingGame` 的实际实现（目前只是占位 console.log）。

### 组件 props 补充（相对于 proto）

**Intro**
```ts
onStart: () => void          // 箭头点击
cocktailName: string         // 替换硬编码文字
```

**Quiz AnswerHover**
```ts
correctIndex: number         // 0|1|2，正确答案位置
onAnswer: (isCorrect: boolean, selectedIndex: number) => void
```

**Result**
```ts
score: number                // 0–5（剩余爱心）
cocktailName: string         // 结果页标题
onBack: () => void
onRestart: () => void
```

---

## 五、实现方式

与 bar scene HTML 层一致：**纯 vanilla HTML/CSS/JS，2048px 坐标系，不引入 React**。

三个画面作为 `#mixing-game-layer` 内的子 div，同一时刻只显示一个。

```html
<div id="mixing-game-layer" style="display:none;">       <!-- z-index: 15，在 bar-layer 之上 -->
  <div id="mg-intro"  style="display:none;">...</div>
  <div id="mg-quiz"   style="display:none;">...</div>
  <div id="mg-result" style="display:none;">...</div>
</div>
```

`window.startMixingGame(cocktailName)` 负责：
1. 解析 cocktail 数据，生成 5 道题
2. 显示 Intro 画面

Cocktail 数据在前端硬编码（从 Cocktail-List.md 手动结构化，或 server.py 在 `/chat` 响应里顺带返回）。

---

## 六、与现有代码的接入点

| 文件 | 改动 |
|---|---|
| `index.html` | 添加 `#mixing-game-layer` 及三个子画面的 HTML 结构 |
| `style.css` | 添加 mixing game 相关样式（2048px 坐标） |
| `main.js` | `setBarLayerVisible` 改动：显示 mixing game 时 bar-layer 仍显示（作为背景）|
| `chat.js` | 实现 `window.startMixingGame`，替换现有占位实现 |
| `server.py` | 已有，无需改动 |
| 新文件 `mixing-game.js` | 游戏逻辑：题目生成、状态机、画面切换 |
