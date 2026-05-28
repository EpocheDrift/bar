# Asset Spec — 给 Lisa 的交付规范

> 给 Lisa 看 · 写给开发对接用  
> 有问题直接问 Zayn

---

## 一、文件格式

所有资产统一用 **PNG**。

| 类型 | 需要透明背景？ |
|---|---|
| 背景场景（splash、home、browse） | ❌ 不需要 |
| Phoenix 角色 sprite | ✅ **必须透明背景** |
| 酒瓶 sprite | ✅ **必须透明背景** |

---

## 二、分辨率

### 背景场景
统一 **2048 × 1152**（目前已经是，✅ 不用改）

### Phoenix 角色 sprite —— 重要

目前 `standing.png` 和 `shake_1.png` 的画布尺寸不一样：

```
standing.png → 1329 × 3859
shake_1.png  →  510 ×  742
```

画布尺寸不一致会导致游戏里 Phoenix 的位置在动画切换时跳动。

**需要 Lisa 做的：所有 Phoenix 帧统一用同一个画布尺寸。**

建议画布大小：**600 × 900**（角色在画布里的位置固定，上下左右留一点边）  
如果 Phoenix 体型需要更大的画布，告诉 Zayn，统一调整就好。

### 酒瓶 sprite
高度统一 342px，✅ 已经很好，保持就行。

---

## 三、命名规范

文件名全部**小写**，单词之间用下划线 `_` 连接。

### 现有文件需要改名

| 现在的名字 | 改成 |
|---|---|
| `standing.png` | `phoenix_idle.png` |
| `shake_1.png` | `phoenix_shake.png` |
| `Gin.png` | `gin.png` |
| `Rum.png` | `rum.png` |
| `Whiskey.png` | `whiskey.png` |
| `Vodka.png` | `vodka.png` |
| `Tequila.png` | `tequila.png` |
| `Brandy.png` | `brandy.png` |

### 新文件命名参考

```
phoenix_idle.png      ← 站立/默认状态
phoenix_shake.png     ← 拿摇酒壶动作
phoenix_talk.png      ← 说话状态（嘴部变化或表情）
phoenix_blink.png     ← 眨眼帧（idle 动画用）
```

---

## 四、还需要 Lisa 交付的内容

| 资产 | 说明 | 优先级 |
|---|---|---|
| `phoenix_talk.png` | Phoenix 说话时的帧——嘴部微开或表情有变化，画布尺寸同上统一 | 🔴 高 |
| `phoenix_blink.png` | Phoenix 眨眼的帧，idle 状态偶尔切换用，画布尺寸同上统一 | 🟡 中 |
| 像素字体 | 聊天框用的像素风字体，提供 .ttf 文件或字体名（比如 Google Fonts 上的名字）| 🔴 高 | ✅ /Lisa/ARCADECLASSIC copy.TTF

---

## 五、有一个问题需要确认

**`browse.png`（暗色版酒吧场景）是用在哪里的？**

是 Mixing Game 进行时的背景？还是另有用途？
Zayn 需要知道才能在代码里接入。

---

## 六、导出注意事项

- 导出时不要做任何缩放——保持原始像素大小导出
- 如果用 Figma 导出：Export 选 **2x** 如果设计稿是 1024×576，Export 选 **1x** 如果设计稿已经是 2048×1152
- 不要用 JPG，即使是背景图也统一用 PNG

---

> 有任何问题直接问 Zayn 🍸
