# Tech Notes — Kaplay (Kaboom.js)

> 适用版本：Kaplay（Kaboom.js 社区维护 fork，API 完全兼容）

---

## 为什么用 Kaplay 而不是 HTML div + PNG

像素风游戏的正确渲染方式：在统一的低分辨率画布上绘制所有元素，再整体 nearest-neighbor 放大到屏幕。

CSS 定位使用浮点坐标（如 `left: 142.7px`），多个元素分别缩放会导致**亚像素渲染**，像素边缘出现半透明过渡，破坏像素风质感。Kaplay 的 Canvas 管线统一在内部低分辨率画布绘制，整体放大，从根本上避免这个问题。

---

## 核心心智模型

```
场景 (Scene)
  └── 游戏对象 (Game Object)
        └── 组件 (Component)  ← 决定这个对象能做什么
```

- **Scene** — 相当于一个页面/关卡。我们有：`entrance`、`bar`
- **Game Object** — 场景里的每个元素（背景、角色、瓶子、灯光……）
- **Component** — 挂在 Game Object 上的能力标签

---

## 像素风初始化（关键配置）

```javascript
kaboom({
  width: 480,             // 内部分辨率宽
  height: 270,            // 内部分辨率高（16:9）
  scale: 3,               // 整体放大 3 倍 → 实际显示 1440×810
  crisp: true,            // nearest-neighbor，保持像素硬边缘 ← 最关键
  background: [18, 15, 13],
})
```

`crisp: true` = 所有内容在 480×270 画好，整体 ×3 放大，全程无插值模糊。
实际 `scale` 值根据 Lisa 资产尺寸和目标屏幕分辨率确定。

---

## 常用 API 速查

### 加载资产（在所有场景之前执行）
```javascript
loadSprite("entrance", "docs/pics/Entrance.png")
loadSprite("bar",      "docs/pics/bar.png")
loadSprite("phoenix",  "docs/pics/Figure-Phx.png")
loadSprite("gin",      "docs/pics/Gin.png")
loadSprite("rum",      "docs/pics/Rum.png")
loadSprite("whisky",   "docs/pics/Whisky.png")
loadSprite("vodka",    "docs/pics/Vodka.png")
loadSprite("tequila",  "docs/pics/Tequila.png")
loadSprite("brandy",   "docs/pics/Brandy.png")
```

### 定义 & 启动场景
```javascript
scene("entrance", () => { /* ... */ })
scene("bar",      () => { /* ... */ })

go("entrance")  // 从入口屏开始
```

### 往场景里放东西
```javascript
// 背景图
add([ sprite("bar"), pos(0, 0) ])

// Phoenix 立绘（可点击）
const phx = add([
  sprite("phoenix"),
  pos(80, 60),
  scale(0.5),
  area(),       // 加了 area() 才能检测点击/hover
])

// Gin 瓶子
const gin = add([
  sprite("gin"),
  pos(200, 180),
  scale(0.3),
  area(),
  "bottle",     // 标签，方便批量处理所有瓶子
])
```

### 交互事件
```javascript
gin.onClick(() => { injectToChat("gin") })
gin.onHover(() => { gin.scale = vec2(0.32) })     // hover 微放大

startBtn.onClick(() => { go("bar") })              // 场景切换
```

### 常用组件一览
| 组件 | 作用 |
|---|---|
| `sprite("key")` | 显示加载好的图片 |
| `pos(x, y)` | 设置位置 |
| `scale(n)` | 缩放（number 或 `vec2(x,y)`） |
| `area()` | 启用点击/碰撞检测 |
| `opacity(n)` | 透明度（0-1） |
| `anchor("center")` | 设置锚点 |
| `z(n)` | 层级（越大越在上面） |

---

## 对话 UI 的处理方式

**结论：Kaboom canvas 画游戏场景，HTML div 做聊天框，JS 连接两者。**

在 canvas 内实现文字输入框需要自己处理光标、换行、键盘事件，代价高。
用 HTML overlay 是 Web 游戏标准做法：

```
┌─────────────────────────────────┐
│  Kaboom canvas（像素风场景）     │
│  ┌───────────────────────────┐  │
│  │  HTML div overlay（聊天框）│  │  ← position: absolute; z-index 高于 canvas
│  │  [Phoenix 说话内容]        │  │
│  │  [用户输入框]              │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Kaboom → HTML 通信**：点击酒瓶时调用 JS 函数注入消息
**HTML → Kaboom 通信**：收到 AI 回复时触发 Kaboom 动画（Phoenix 切换说话帧）

---

## 推荐文件结构

```
index.html     # canvas + HTML overlay 容器
main.js        # Kaboom 初始化、场景定义、sprite 交互
chat.js        # 对话 UI 逻辑 + Flask API 调用
style.css      # 聊天框样式（像素字体、暗色主题）
server.py      # Flask，/chat 路由
docs/pics/     # Lisa 的所有资产
```

---

## 待确认

- [ ] 内部渲染分辨率：根据 Lisa 资产实际尺寸确定（建议 480×270 或 320×180）
- [ ] `scale` 值：根据目标屏幕和内部分辨率计算
- [ ] Phoenix 额外帧：眨眼帧 + 说话帧（由 Lisa 提供后用 `loadSpriteAtlas` 或多张图切换）
