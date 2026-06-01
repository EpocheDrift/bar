# Figma 设计稿同步文档

> Figma 文件：phx-game（JpB4wF0hrEKVRprQVH66xg · Page 1）  
> 审阅时间：2026-05-30 · 最后更新：2026-05-31  
> 目的：记录设计稿当前状态，作为分阶段实现的参考基准

⚠️ **使用说明**：本文档是审阅时刻的快照。部分细节仍在调整中，实现时以最新 Figma 稿为准；本文档提供方向和意图，不作逐像素规格。

---

## 一、游戏完整流程（Figma 已设计的画面）

### 序列 1 — Intro 叙事（纯黑 + 像素字体）

逐屏文字推进，无背景图，建立世界观。

| Figma Frame | node-id | 内容 |
|---|---|---|
| Frame 8 | 36:10 | `YEAR: 4144` |
| Frame 9 | 36:18 | 世界观：义体化已合法、普及、廉价… |
| Frame 10 | 36:41 | "Every procedure requires full anesthesia." |
| Frame 11 | 36:45 | "And every time you go under — your mind slips through the cracks into a place that shouldn't exist." |
| Frame 23 | 76:251 | 麻醉台词："Breathe normally." / "This is a standard augmentation." / "You won't feel a thing." / "Count backwards from ten." |
| Frame 25 | 76:270 | "..." |
| Frame 27 | 76:289 | "Ten…" |
| Frame 29 | 79:324 | "Nine…" |
| Frame 30 | 80:2 | "Eight…" |
| （继续至 1） | — | 倒计时 |
| Frame 28 | 79:302 | `> ENTER <`（点击进入） |

**交互方式**：暂定点击推进，每次点击切换到下一屏。  
**技术说明**：纯文字 + 黑背景，不需要新资产，所有文字内容已在 Figma 中明确。

---

### 序列 2 — GS 序列（街道迎接）✅ 已实现

赛博朋克废弃车站场景，Phoenix 站在街头，有椭圆形 vignette 边缘效果。使用 **Figma 合成导出**方式，Phoenix 位置烘焙进图片，无坐标调整问题。

| 代码 index | Figma Frame | node-id | 资产 | 说明 |
|---|---|---|---|---|
| 11 | GS-1 | 81:39 | scene_station_blur + closing_3 | 模糊站台 + 最闭合 vignette，无 Phoenix |
| 12 | GS-2 | 81:57 | （纯黑） | 黑屏过渡 |
| 13 | GS-3 | 81:66 | scene_station_blur + closing_3 | 模糊站台再现，无 Phoenix |
| 14 | GS-4 | 81:75 | **gs4_bg.png**（合成） | station + closing_1 vignette + Phoenix |
| 15 | GS-5 | 36:49 | **gs5_bg.png**（合成） | station 全景 + Phoenix 全露 |
| 16 | GS-6 | 72:67 | **gs_dialog_bg.png**（合成） | 对话框 idle，Phoenix 闭嘴 |
| 17 | GS-7 | 72:149 | **gs_dialog_speak_bg.png**（合成） | 对话框 speaking，Phoenix 开嘴 |
| 18 | GS-8 | 72:180 | **gs_dialog_bg.png**（合成） | 对话框 idle，Phoenix 闭嘴 |

**合成导出说明**：GS-4/5/6/7/8 均以 Figma frame 整体导出为 2048×1152 PNG，background + vignette + Phoenix 全部烘焙，`backgroundScale: 0.5` 渲染到 1024×576 game canvas。文字由 HTML overlay 覆盖，CSS 坐标用百分比对应 Figma 位置。

---

### 序列 3 — Bar-Intro 序列 ✅ 已实现

玩家进入酒吧后的四帧引导，同样采用 Figma 合成导出。

| 代码 index | Figma Frame | node-id | 资产 | 说明 |
|---|---|---|---|---|
| 19 | bar-intro-1 | 71:12 | **bar_intro_1_bg.png**（合成） | 酒吧全景，无对话框 |
| 20 | bar-intro-2 | 81:160 | **bar_dialog_bg.png**（合成） | 对话框 idle，Phoenix 闭嘴 |
| 21 | bar-intro-3 | 82:2 | **bar_dialog_speak_bg.png**（合成） | 对话框 speaking，Phoenix 开嘴 |
| 22 | bar-intro-4 | 82:20 | **bar_dialog_bg.png**（合成） | 对话框 idle，Phoenix 闭嘴 |

index 22 结束后 → `k.go("bar")`，进入正常酒吧交互状态。

---

### 序列 4 — 主酒吧场景

| 元素 | Figma 设计 | 当前代码状态 |
|---|---|---|
| 背景 | home.png 全屏 | ✅ 已实现 |
| Phoenix 立绘 | 左侧偏中，idle / shake 姿态 | ✅ 基本实现（仅 2 帧） |
| 7 瓶酒 | 吧台上排列，hover 上浮 | ✅ 已实现 |
| 对话框 | 左下角，半透明暗色，顶部 "Phoenix" 名字标签 | ⚠️ 缺名字标签，样式待对齐 |
| 灯光闪烁 | 轻微 opacity 随机变化 | ✅ 已实现 |

---

### 序列 5 — Mixing Game Overlay

覆盖在酒吧场景上；Phoenix 立绘缩小保留在左侧。

| 元素 | Figma 细节 |
|---|---|
| 进度指示 | 右上角 5 颗菱形图标（暂定为题目进度） |
| 题目区 | 居中大字：问题文本 + Phoenix 备注（小字斜体挖苦）|
| 选项 | 3 个按钮，竖排 |
| 导航 | `> Next`（右下） |
| 结果页 | 分数（如 "5/5"）+ Phoenix 点评长文 + `>Back<` `>Re-Start<` |

⚠️ **待确认细节**（先按默认做，后续调整）：
- 选项正确/错误的视觉反馈颜色 → 待 Lisa 确认
- 进度图标：题目进度 or 生命数 → 暂定题目进度
- 题目数量 → 暂定 5 题

---

## 二、Phoenix 动画帧（6 个状态，资产已交付）

| 状态 | 文件路径 | 当前代码 |
|---|---|---|
| idle | docs/assets/standing.png | ✅ 使用中 |
| idle_blink | docs/assets/phoenix_idle_blink.png | ❌ 未接入 |
| idle_talk | docs/assets/phoenix_idle_talk.png | ❌ 未接入 |
| shake | docs/assets/shake_1.png | ✅ 使用中 |
| shake_blink | docs/assets/phoenix_shake_blink.png | ❌ 未接入 |
| shake_talk | docs/assets/phoenix_shake_talk.png | ❌ 未接入 |

**注**：资产文件均已存在，只需在 main.js 中加载并补充状态切换逻辑。

---

## 三、分阶段实现计划

| Phase | 内容 | 资产依赖 | 状态 |
|---|---|---|---|
| P1 | Intro 叙事序列 + GS 序列 + Bar-Intro 序列（全部 23 帧，click 推进） | Figma 合成导出 | ✅ 完成 |
| P2 | Phoenix 6 帧动画接入（眨眼 / 说话状态逻辑） | 已有 | 🔲 可开始 |
| P3 | Chat UI 样式对齐（Phoenix 名字标签、对话框位置）| 无 | 🔲 可开始 |
| P4 | Mixing Game 正式 UI（3 选项、进度图标、结果页）| 无 | 🔲 可开始 |
| P5 | 资产升级（用最终像素版替换 Figma 合成图）| ⏳ 等 Lisa 交付像素背景 | ⛔ 阻塞 |

---

## 四、设计稿未明确 / 实现时需决策的点

| 问题 | 暂定方案 |
|---|---|
| Intro 推进交互方式 | 点击画面任意位置推进 |
| 倒计时帧是否全部实现（10 到 1）| 全部实现，保留调整空间 |
| Mixing Game 题目来源（动态 vs 预设）| 待 T19 设计阶段决定 |
| 对话框精确尺寸和位置 | 实现后对照 Figma 稿校准 |
| 瓶子点击后对话框的精确行为（G5）| 待 G3 场景交互地图完成后定义 |
