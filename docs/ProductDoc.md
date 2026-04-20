# Pour Decisions — 产品文档

> 版本：v1.0 · 日期：2026-04-19 · 面向：产品调整 / 功能迭代 / 新成员 Onboarding

---

## 1. 产品概述

**Pour Decisions**（内部代号 HangoverGPT 🍹）是一款面向家庭调酒爱好者的 AI 辅助鸡尾酒模拟器，运行在浏览器内，无需安装任何客户端。

### 1.1 核心价值主张

| 用户问题 | 产品解法 |
|---|---|
| 不知道手头的食材能做什么酒 | 食材匹配：输入食材 → 精确/部分匹配食谱 |
| 不知道自己喜欢什么口味的酒 | AI 推荐：描述心情 / 口味偏好 → 个性化建议 |
| 想浏览所有食谱找灵感 | Browse 页：全量展示 + 4 维度实时筛选 |
| 调酒步骤不熟、容易出错 | 逐步引导 Mix 模式：一次只看一步 |
| 需要为多人调酒 | 服务人数缩放（×1/×2/×4），用量自动换算 |

### 1.2 产品定位

- **目标用户**：在家调酒的初学者、鸡尾酒爱好者、好奇想尝试调酒的普通用户
- **使用场景**：派对备酒、独自尝试新配方、向朋友展示调酒技艺
- **设备定位**：桌面优先（1280px+），平板兼容，暂不支持移动端

---

## 2. 当前功能版本（v1）

### 2.1 功能地图

```
Home (01)
  ├── 食材匹配 → Results (03) → Recipe Detail (04) → Mix (05)
  └── AI 推荐  → Results (03) → Recipe Detail (04) → Mix (05)

Browse (02)        → Recipe Detail (04) → Mix (05)
```

### 2.2 功能详情

#### 页面 01 — Home（首页）

**食材匹配流程**
- 用户从下拉多选框中选择已有食材（选项动态从 `recipes.json` 推导，不硬编码）
- 可在文本框补充自定义食材（逗号分隔，与多选框合并）
- 点击 **Find matching cocktails** → 写入 `st.session_state["user_ingredients"]` → 跳转 Results
- 边界：未选食材直接提交 → 显示 warning，不跳转

**AI 推荐流程**
- 用户在文本框描述心情 / 口味（如 "something citrusy and refreshing"）
- 点击 **Get AI suggestions** → 调用 Minimax API → 写入 `st.session_state["ai_recommendations"]` → 跳转 Results
- 缓存逻辑：相同 prompt 再次提交命中缓存，直接跳转无 spinner
- 边界：空 prompt → warning；API 失败 → Results 页显示 fallback 提示，不崩溃

#### 页面 02 — Browse（浏览）

- 全量展示所有 16 条食谱，3 列网格布局（`recipe_card` 组件）
- 4 维度实时筛选（任意组合）：
  - 名称搜索（模糊，大小写不敏感）
  - Base spirit（单选）
  - Flavor profile（多选）
  - Difficulty（单选）
- **Clear filters** 按钮一键重置
- 无结果时显示友好提示，不显示空白页
- 任意卡片点击 **View details** → 跳转 Recipe Detail，食谱预填

#### 页面 03 — Results（结果）

- 展示食材匹配结果（精确匹配在前，部分匹配在后）
- 精确匹配：绿色提示"You have everything needed"
- 部分匹配：高亮缺少的食材列表
- AI 推荐区块：仅在有推荐结果时展示，显示 `why` 字段（推荐理由）
- 未经 Home 直接访问 → 显示引导提示，指向首页

#### 页面 04 — Recipe Detail（配方详情）

- 顶部下拉框：切换任意食谱（改变选择时重置人数倍数至 ×1）
- 配方元信息：Difficulty、Base spirit、Serving scale
- Serving size 单选（×1 / ×2 / ×4）→ 所有食材用量实时换算
  - 小数自动转分数显示（0.75 oz → `3/4 oz`，1.5 oz → `1 1/2 oz`）
  - `null` 用量（如 salt）→ 保持"to taste"，不乘以倍数
- 食材列表 + 按 order 排序的步骤列表（含 tip）
- **Start Mixing** 按钮 → 携带食谱 + 倍数跳转 Mix 页

#### 页面 05 — Mix（逐步调酒）

- 以当前 serving_multiplier 缩放食谱后展示
- 进度条（labeled）：当前步数 / 总步数
- 每次仅显示一步：步骤描述 + 该步关联的食材用量
  - 食材关联逻辑：通过 Unicode 归一化 + 正则匹配步骤文本，支持别名（前缀词/后缀词剥离）
  - 无法推断时显示"No listed ingredient amounts could be inferred for this step"
- **Next Step** / **Start Over** 按钮
- 走完全部步骤 → 显示完成提示，Start Over 可用
- 未选食谱直接访问 → 引导跳回 Recipe Detail，不崩溃

---

## 3. 数据模型

### 3.1 Recipe schema

```json
{
  "id": "classic_margarita",
  "name": "Classic Margarita",
  "description": "...",
  "difficulty": "easy | medium | hard",
  "serving_size": 1,
  "base_spirit": "tequila | vodka | gin | rum | whiskey | non-alcoholic",
  "flavor_tags": ["citrus", "tart", "refreshing"],
  "ingredients": [
    { "name": "tequila", "amount": 2.0, "unit": "oz" },
    { "name": "salt", "amount": null, "unit": "" }
  ],
  "steps": [
    { "order": 1, "action": "Rim the glass with salt.", "tip": "Use a lime wedge to moisten the rim." }
  ]
}
```

**字段规则**
- `amount: null` — 表示"随意添加"（to taste），缩放时跳过
- `unit` — 可为空字符串（纯计数食材）
- `tip` — 可选字段，步骤补充提示
- `flavor_tags` — 复数，可多个，用于 Browse 筛选

### 3.2 当前内容库（v1）

| 维度 | 数量 | 明细 |
|---|---|---|
| 食谱总数 | 16 | 见下表 |
| Base spirit | 6 | gin, rum, tequila, vodka, whiskey, non-alcoholic |
| Difficulty | 3 | easy (7), medium (7), hard (1) [+ 1 non-alcoholic easy×2] |
| Flavor tags | 22 | balanced, bitter, bittersweet, bubbly, citrus, coffee, crisp, dry, fruity, herbal, light, minty, nutty, refreshing, rich, smooth, spicy, spirit-forward, sweet, tart, tropical, warm |

**完整食谱列表**

| 名称 | Base Spirit | Difficulty | 主要标签 |
|---|---|---|---|
| Classic Margarita | tequila | easy | citrus, tart, refreshing |
| Paloma | tequila | easy | citrus, bubbly, refreshing |
| Moscow Mule | vodka | easy | spicy, citrus, refreshing |
| Cosmopolitan | vodka | medium | citrus, fruity, tart |
| Espresso Martini | vodka | medium | coffee, rich, smooth |
| Gin and Tonic | gin | easy | bitter, bubbly, crisp |
| Tom Collins | gin | easy | citrus, bubbly, light |
| Negroni | gin | medium | bitter, herbal, spirit-forward |
| Daiquiri | rum | easy | citrus, dry, refreshing |
| Mojito | rum | medium | minty, citrus, refreshing |
| Mai Tai | rum | hard | tropical, nutty, citrus |
| Old Fashioned | whiskey | easy | spirit-forward, warm, bittersweet |
| Whiskey Sour | whiskey | medium | citrus, smooth, balanced |
| Boulevardier | whiskey | medium | bitter, rich, spirit-forward |
| Virgin Mojito | non-alcoholic | easy | minty, citrus, bubbly |
| Shirley Temple | non-alcoholic | easy | sweet, fruity, bubbly |

---

## 4. 技术架构

### 4.1 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| Web 框架 | Streamlit ≥1.28.0 | 服务端渲染，无独立前端 |
| 语言 | Python 3.9+ | `from __future__ import annotations` 兼容 3.9 type union |
| AI 集成 | Minimax API (CN endpoint) | OpenAI-compatible，`openai` package，自定义 `base_url` |
| AI 备用 | OpenAI API | 当 Minimax 不可用时切换 |
| 数据存储 | JSON 文件 (`data/recipes.json`) | 只读，运行时不写入 |
| 部署 | Streamlit Community Cloud / 本地 | 无 Docker，无数据库 |
| 版本控制 | GitHub | 分支策略：feature/issue-N，squash merge |

### 4.2 目录结构

```
app.py                   # 入口：页面配置 + session_state 初始化
pages/
  01_home.py             # 食材匹配 + AI 推荐入口
  02_browse.py           # 全量浏览 + 4 维筛选
  03_results.py          # 匹配结果 + AI 推荐展示
  04_detail.py           # 配方详情 + 服务人数缩放
  05_mix.py              # 逐步调酒模拟
services/
  matcher.py             # 食材匹配逻辑（精确 + 部分匹配，排序）
  recommender.py         # Minimax API 调用，JSON 解析，[] fallback
  scaler.py              # 倍数缩放 + 分数格式化
components/
  brand.py               # 全局 CSS（CSS variables）+ 品牌 header
  recipe_card.py         # 食谱卡片组件
  progress_bar.py        # 标记进度条组件
data/
  recipes.json           # 食谱数据源（16 条）
docs/                    # 产品 / 架构 / 规格文档
.streamlit/
  config.toml            # 深色主题（primaryColor: #D4AB66）
  secrets.toml           # API Key（gitignore，不提交）
```

### 4.3 跨页面状态（session_state）

| Key | 类型 | 用途 |
|---|---|---|
| `user_ingredients` | `list[str]` | Home → Results：用户输入的食材 |
| `selected_recipe` | `dict` | Browse/Results → Detail → Mix：选中的完整食谱对象 |
| `serving_multiplier` | `int` | Detail → Mix：服务人数倍数（1/2/4） |
| `current_step_index` | `int` | Mix 页内部：当前步骤索引 |
| `ai_recommendations` | `list[dict]` | Home → Results：缓存的 AI 推荐结果 |
| `ai_preference` | `str` | Home → Results：用户输入的 AI 偏好文本 |
| `ai_recommendations_error` | `bool` | Results：AI 请求是否失败 |

### 4.4 AI 集成细节

- **模型**：MiniMax-Text-01
- **Endpoint**：`https://api.minimax.chat/v1`
- **调用方式**：system prompt 要求模型仅返回 JSON array，不含 markdown fence
- **参数**：`max_tokens=1024`（延迟限制），`temperature=0.7`
- **缓存**：结果写入 `st.session_state["ai_recommendations"]`，相同 prompt 不重复调用
- **降级**：任何异常（网络/解析/超时）返回 `[]`，Results 页显示 fallback 提示

---

## 5. UX 流程

### 5.1 主流程：食材匹配

```
Home → [选食材] → [Find matching cocktails]
  → Results (精确/部分匹配列表)
    → [View details] → Recipe Detail
      → [调整 serving size] → [Start Mixing]
        → Mix (逐步引导) → 完成
```

### 5.2 主流程：AI 推荐

```
Home → [描述口味/心情] → [Get AI suggestions]
  → (loading spinner ~3-10s)
  → Results (AI 推荐卡片列表)
    → [参考推荐] → Browse/搜索对应食谱 → Recipe Detail → Mix
```

### 5.3 主流程：随机浏览

```
Browse → [搜索/筛选] → 食谱网格
  → [View details] → Recipe Detail → Mix
```

---

## 6. 已知限制（v1）

| 类别 | 限制 |
|---|---|
| **用户系统** | 无账号 / 登录，无收藏夹，刷新页面会话数据丢失 |
| **食谱库** | 静态 JSON，16 条固定食谱，运行时无法新增 |
| **AI 推荐** | 推荐结果无法直接链接到已有食谱详情页，仅展示文本 |
| **移动端** | 未针对手机屏幕优化，<900px 布局可能异常 |
| **离线** | 需要网络连接使用 AI 功能 |
| **Mix 食材推断** | 步骤文本匹配基于正则，复杂描述可能推断失败 |
| **并发** | 单机 Streamlit 无法支撑高并发，部署于 Community Cloud 有资源上限 |

---

## 7. 后续产品调整方向

以下按优先级排列，供产品迭代参考。

### 高优先级

**7.1 AI 推荐与食谱库打通**
- 当前 AI 推荐的食谱仅展示文字，无法跳转 Recipe Detail
- 建议：推荐结果中如果匹配到已有 `id`，显示 "View details" 按钮
- 更大方向：AI 推荐可动态生成食谱并临时写入 session，按完整 schema 渲染

**7.2 用户收藏 / 历史记录**
- 当前页面刷新即清空所有状态
- 建议：使用 `st.experimental_user` 或 cookie / localStorage 实现轻量持久化
- 最小可行：收藏列表写入 JSON 文件（多用户不适用，单机可行）

**7.3 食谱库扩充**
- 当前 hard difficulty 仅 Mai Tai 一条，non-alcoholic 仅 2 条
- 建议补充：hard×3+（Zombie、Long Island Iced Tea、Ramos Gin Fizz），non-alcoholic×3+（Arnold Palmer、Cucumber Cooler）
- 也可支持用户提交食谱（需后端存储）

### 中优先级

**7.4 Mobile Responsive 布局**
- 当前 3 列网格在手机上无法正常显示
- 建议：在 CSS breakpoint（<640px）切换为单列，调整 button 尺寸

**7.5 服务倍数扩展**
- 当前仅支持 ×1/×2/×4
- 建议增加 ×6/×8，或改为数字输入（st.number_input，最小 1，最大 20）

**7.6 Mix 页食材推断优化**
- 当前靠正则 + 别名匹配，失败时显示空列表
- 建议：每步骤在食谱编辑时手动标注 `ingredient_refs`，精确关联

### 低优先级 / 探索方向

**7.7 分享功能**
- 生成可分享的食谱链接（URL query params 携带 recipe_id + multiplier）
- Streamlit 支持通过 `st.experimental_get_query_params` 读取 URL 参数

**7.8 多语言支持**
- 食谱名称 / 描述 / 界面文字支持中英双语切换
- 可用 st.session_state + i18n dict 实现，无需引入额外框架

**7.9 后端化 / 数据库迁移**
- 当前 JSON 文件只读，扩展受限
- 升级路径：SQLite（轻量本地）→ PostgreSQL（云端持久化）
- 需要时 Streamlit 可调用 SQLAlchemy + SQLite，改动量小

**7.10 品牌扩展**
- 当前 logo 为纯文字 "Pour Decisions"
- 建议：增加调酒器/鸡尾酒杯图标，统一 favicon 和 OG image

---

## 8. 非功能性要求（参考基线）

| 指标 | 目标 | 现状 |
|---|---|---|
| 首页加载 | <3s | ✅ 静态渲染，通常 <1s |
| AI 推荐响应 | <10s | ✅ max_tokens=1024 限制 |
| 桌面浏览器兼容 | 1280px+ | ✅ |
| 无 JS 框架依赖 | — | ✅ 纯 Streamlit 服务端渲染 |
| API Key 安全 | 不提交到 git | ✅ secrets.toml 在 .gitignore |

---

## 9. 项目元信息

| 字段 | 内容 |
|---|---|
| 项目名 | Pour Decisions / HangoverGPT |
| 代码仓库 | GitHub (EpocheDrift) |
| 主分支 | main |
| 当前版本 | v1.0（所有 Issue #2–#8, #10 已 merge） |
| 开发周期 | 2026-04-17 复活，~2 周完成 v1 |
| 技术联系 | stevewang225@gmail.com |
