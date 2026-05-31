# HangoverGPT 🍹 — App Flow

## Overview

```
splash screen - introduction
        │
        ▼
    dashboard ◄─────────────────────────────────────┐
   /    |     \                                      │
  ▼     ▼      ▼                                    │
AI    mixing  browse menu ──────────────────────────┤
gen   game        │              │                  │
menu    │      view detail    Search                │
  │     │      (pop-up)          │                  │
  ▼     │         │              └──────────────────┘
Mood    │        back ───────────────────────────────┘
Desc    │
Input   │
  │     ▼
  │   5 rounds (multiple choice)
  │         │
  ▼      success?
Error? ◄─────────────────────────────────┐
  │      /            \                  │
Yes    ≥ 4/5         < 4               (loop back to dashboard)
  │      │              │
  │  accomplish-   Phoenix says
  │  ment 🎉       sth mean 😈
  │      │              │
  └──────┴──────────────┴──► dashboard
  │
No error
  │
  ▼
Poster (AI generated image)
  │
  ▼
dashboard
```

---

## Detailed Flow by Section

### 1. Entry
- App opens with a **splash screen** (introduction/welcome)
- User proceeds to the **dashboard**

---

### 2. Dashboard
Central hub with three paths:
- **AI Generated Menu**
- **Mixing Game**
- **Browse Menu**

---

### 3. AI Generated Menu
```
Dashboard
    │
    ▼
Mood Description Input
    │
    ▼
  Error?
  ├── Yes → return to Mood Description Input (show error message, retry)
  └── No error → Poster (AI generated image)
                    │
                    ▼
                Dashboard
```
- User describes their mood or flavor preference
- Claude API generates a cocktail poster image
- On API failure: return to input with error message

---

### 4. Mixing Game
```
Dashboard
    │
    ▼
Select a cocktail
    │
    ▼
5 Rounds (multiple choice questions — step-by-step operations)
    │
    ▼
  Success?
  ├── ≥ 4/5 correct → Accomplishment 🎉 → Dashboard
  └── < 4 correct   → Phoenix says sth mean 😈 → Dashboard
```
- Each round shows a cocktail step as a multiple choice question
- Score tracked across 5 rounds
- Result depends on number of correct answers

---

### 5. Browse Menu
```
Dashboard
    │
    ├──────────────┐
    ▼              ▼
View Detail      Search
(pop-up)           │
    │              └──► Browse Menu
    ▼
   Back
    │
    ▼
Browse Menu
```
- Users can browse all cocktails or use search/filter
- Clicking a cocktail opens a detail pop-up
- Back returns to browse menu or dashboard

---

## Success Criteria Summary

| Feature | Condition | Outcome |
|---|---|---|
| AI Menu | API call succeeds | Show Poster |
| AI Menu | API call fails | Return to Mood Input |
| Mixing Game | ≥ 4/5 correct | Accomplishment screen |
| Mixing Game | < 4/5 correct | Phoenix says sth mean |
| Browse | Any | View detail pop-up → back |
