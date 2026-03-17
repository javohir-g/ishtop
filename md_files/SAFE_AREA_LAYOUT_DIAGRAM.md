# Telegram Safe Area - Layout Diagrams

## 📐 Visual Layout Structure

### Before Safe Area Implementation

```
┌─────────────────────────────────────┐
│                                     │
│         APP CONTENT                 │  ← Full scrollable area
│                                     │
│         (Scrollable)                │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← Bottom Navigation (64px)
│      BOTTOM NAVIGATION              │  ← PROBLEM: Hidden by system UI
├═════════════════════════════════════┤
│                                     │  ← Android Navigation Bar
│        ■  ●  ◀                      │  ← Overlaps bottom nav!
└─────────────────────────────────────┘
```

**Problem:**
- Bottom navigation is at `bottom: 0`
- Android system UI overlaps it
- Users cannot tap navigation buttons

---

### After Safe Area Implementation

```
┌─────────────────────────────────────┐
│                                     │
│         APP CONTENT                 │  ← Full scrollable area
│                                     │
│         (Scrollable)                │  ← padding-bottom: 64px + 48px
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │  ← Content stops before nav
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← Bottom Navigation (64px)
│      BOTTOM NAVIGATION              │  ← Visible and accessible!
├─────────────────────────────────────┤  ← bottom: 48px (safe-bottom)
│                                     │  ← Safe Area Space (48px)
├═════════════════════════════════════┤
│        ■  ●  ◀                      │  ← Android Navigation Bar
└─────────────────────────────────────┘
```

**Solution:**
- Bottom navigation at `bottom: var(--tg-safe-bottom)` (48px)
- Content has `padding-bottom: 64px + 48px = 112px`
- Navigation is fully visible and tappable

---

## 📱 Different Device Scenarios

### Scenario 1: Android with Gesture Navigation

```
Device: Samsung Galaxy S22
OS: Android 13
Navigation: Gesture (swipe up)
Safe Area Bottom: 48px

┌─────────────────────────────────────┐
│         APP CONTENT                 │
│         padding-bottom: 112px       │  ← 64px nav + 48px safe
│         (Scrollable)                │
│                                     │
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← 64px
├─────────────────────────────────────┤
│         [Safe Space]                │  ← 48px
│     ───────────────                 │  ← Gesture indicator
└─────────────────────────────────────┘
```

**CSS Applied:**
```css
.bottom-nav {
  bottom: var(--tg-safe-bottom); /* 48px */
  height: var(--bottom-nav-height); /* 64px */
}

.content {
  padding-bottom: calc(64px + 48px); /* 112px */
}
```

---

### Scenario 2: Android with Button Navigation

```
Device: Samsung Galaxy A52
OS: Android 12
Navigation: 3-Button
Safe Area Bottom: 48px

┌─────────────────────────────────────┐
│         APP CONTENT                 │
│         padding-bottom: 112px       │  ← 64px nav + 48px safe
│         (Scrollable)                │
│                                     │
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← 64px
├─────────────────────────────────────┤
│         [Safe Space]                │  ← 48px
│      ◀    ⬤    ▢                   │  ← Back, Home, Recent buttons
└─────────────────────────────────────┘
```

---

### Scenario 3: iPhone with Home Indicator (Modern)

```
Device: iPhone 14 Pro
OS: iOS 17
Navigation: Gesture (home indicator)
Safe Area Bottom: 34px

┌─────────────────────────────────────┐
│         APP CONTENT                 │
│         padding-bottom: 98px        │  ← 64px nav + 34px safe
│         (Scrollable)                │
│                                     │
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← 64px
├─────────────────────────────────────┤
│         [Safe Space]                │  ← 34px
│         ──────                      │  ← Home indicator
└─────────────────────────────────────┘
```

---

### Scenario 4: iPhone with Home Button (Legacy)

```
Device: iPhone SE (2nd gen)
OS: iOS 16
Navigation: Physical home button
Safe Area Bottom: 0px

┌─────────────────────────────────────┐
│         APP CONTENT                 │
│         padding-bottom: 64px        │  ← 64px nav + 0px safe
│         (Scrollable)                │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← 64px
└─────────────────────────────────────┘
        (●)  ← Physical button
```

---

### Scenario 5: Landscape Mode

```
Device: Any phone
Orientation: Landscape
Safe Area Bottom: 0px (usually)
Safe Area Left/Right: 44px (notch/camera cutout)

┌────────────────────────────────────────────────────────────┐
│                                                            │
│                   APP CONTENT                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  🏠      📧      💬      👤                                │
└────────────────────────────────────────────────────────────┘
```

**Note:** In landscape, safe area is often 0px bottom, but may have left/right insets.

---

## 🔄 Dynamic Adjustments

### When Keyboard Opens

**Before Keyboard:**
```
┌─────────────────────────────────────┐
│         APP CONTENT                 │
│                                     │
│         [Input Field]               │
├─────────────────────────────────────┤
│  🏠  📧  💬  👤                     │  ← Visible
├─────────────────────────────────────┤
│         [Safe Space]                │
└─────────────────────────────────────┘
```

**After Keyboard Opens:**
```
┌─────────────────────────────────────┐
│         APP CONTENT                 │
│         (Scrolled up)               │
│         [Input Field] ← Focused     │
├─────────────────────────────────────┤
│                                     │
│      ┌───────────────────┐          │
│      │   Q W E R T Y     │          │  ← Keyboard
│      │   A S D F G H     │          │
│      │   Z X C V B N     │          │
│      └───────────────────┘          │
└─────────────────────────────────────┘
```

**Note:** Bottom nav often auto-hides when keyboard is open. Safe area adjusts automatically via `viewportChanged` event.

---

## 📏 Measurements Reference

### Element Heights

```
┌───────────────────────────┐
│ Content Area              │  ← Variable (scrollable)
│                           │
│ padding-bottom:           │
│   calc(64px + safe-area)  │  ← Dynamic padding
├───────────────────────────┤
│ Bottom Navigation         │  ← 64px (fixed)
│                           │
│ • Icon: 28px (w-7 h-7)    │
│ • Padding: 12px (py-3)    │
│ • Total: 64px             │
├───────────────────────────┤
│ Safe Area (Android)       │  ← 0-60px (dynamic)
│                           │
│ Typical values:           │
│ • Gesture nav: 48px       │
│ • Button nav: 48px        │
│ • No nav bar: 0px         │
└───────────────────────────┘
```

---

### Spacing Breakdown

```css
/* Bottom Navigation Component */
.bottom-nav {
  position: fixed;
  bottom: var(--tg-safe-bottom, 0px);  /* Dynamic: 0-60px */
  height: var(--bottom-nav-height, 64px);  /* Fixed: 64px */
  padding-top: 12px;     /* py-3 = 12px top */
  padding-bottom: 12px;  /* py-3 = 12px bottom */
  /* Internal content: 28px icon + 2×12px padding = 52px usable */
}

/* Content Container */
.content-container {
  padding-bottom: calc(
    var(--bottom-nav-height, 64px) +   /* 64px fixed nav height */
    var(--tg-safe-bottom, 0px)         /* 0-60px dynamic safe area */
  );
  /* Total: 64px to 124px depending on device */
}
```

---

## 🎨 CSS Layout Flow

### Layer Stack (Z-index)

```
┌─────────────────────────────────────┐
│ Top Layer (z-50)                    │  ← Modals, Dialogs
├─────────────────────────────────────┤
│ Bottom Nav (z-50)                   │  ← Bottom Navigation
├─────────────────────────────────────┤
│ Content Layer (z-0)                 │  ← Main content
├─────────────────────────────────────┤
│ Background (z-0)                    │  ← Page background
└─────────────────────────────────────┘
      ↓
System UI (Outside app control)
```

---

### Position Strategy

```css
/* Root Container */
.root {
  position: relative;
  min-height: 100vh;
  padding-bottom: calc(64px + var(--tg-safe-bottom));
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;         /* Stays at bottom during scroll */
  bottom: var(--tg-safe-bottom);  /* Offset by safe area */
  left: 50%;              /* Center horizontally */
  transform: translateX(-50%);
  width: 100%;
  max-width: 28rem;       /* max-w-md = 448px */
  z-index: 50;            /* Above content */
}

/* Content */
.content {
  position: relative;     /* Normal flow */
  /* Padding prevents overlap with fixed nav */
  padding-bottom: calc(64px + var(--tg-safe-bottom));
}
```

---

## 🧮 Calculation Examples

### Example 1: Android Gesture Nav

```
Given:
  Bottom Nav Height = 64px
  Safe Area Bottom = 48px

Calculations:
  Bottom Nav Position = 48px from screen bottom
  Content Padding = 64px + 48px = 112px
  Total Reserved Space = 112px

User Experience:
  ✅ Content scrolls under nav but never hidden
  ✅ Nav fully visible and tappable
  ✅ Smooth 300ms transition on orientation change
```

---

### Example 2: iOS Home Button

```
Given:
  Bottom Nav Height = 64px
  Safe Area Bottom = 0px

Calculations:
  Bottom Nav Position = 0px from screen bottom
  Content Padding = 64px + 0px = 64px
  Total Reserved Space = 64px

User Experience:
  ✅ Nav at absolute bottom (no system UI)
  ✅ Content scrolls with standard padding
  ✅ No unnecessary white space
```

---

### Example 3: Floating Action Button

```
Given:
  Bottom Nav Height = 64px
  Safe Area Bottom = 48px
  FAB Margin = 16px

Calculation:
  FAB Position = 64px + 48px + 16px = 128px from bottom

CSS:
  bottom: calc(
    var(--bottom-nav-height, 64px) +
    var(--tg-safe-bottom, 0px) +
    16px
  );
```

---

## 📊 Comparison Table

| Element | Without Safe Area | With Safe Area | Improvement |
|---------|------------------|----------------|-------------|
| Nav Position | `bottom: 0` | `bottom: 48px` | ✅ Visible |
| Content Padding | `pb-20` (80px) | `calc(64px + 48px)` | ✅ Dynamic |
| Orientation Change | Manual adjustment | Automatic | ✅ Smooth |
| Keyboard Interaction | Fixed | Responsive | ✅ Adapts |
| Cross-device | Hardcoded | Device-aware | ✅ Universal |

---

## 🎯 Key Takeaways

### What Changed:

1. **Bottom Navigation**
   - From: `bottom: 0` (fixed at screen bottom)
   - To: `bottom: var(--tg-safe-bottom)` (dynamic offset)

2. **Content Padding**
   - From: `pb-20` (fixed 80px Tailwind class)
   - To: `calc(64px + var(--tg-safe-bottom))` (dynamic)

3. **Transition**
   - Added: `transition-[bottom] duration-300 ease-out`
   - Result: Smooth animation on safe area changes

4. **Developer Experience**
   - From: Manual per-device adjustments
   - To: Automatic via CSS variables

---

## 📐 Responsive Behavior

### Small Phones (iPhone SE)

```
Screen: 375 × 667 px
Safe Area: 0px
Nav: 64px
Content Padding: 64px

┌─────────────┐
│   Content   │  ← More screen space
│             │     (no safe area needed)
├─────────────┤
│  🏠 📧 💬  │
└─────────────┘
```

---

### Large Phones (iPhone 14 Pro Max)

```
Screen: 430 × 932 px
Safe Area: 34px
Nav: 64px
Content Padding: 98px

┌─────────────┐
│   Content   │  ← Slightly less space
│             │     (safe area for notch)
│             │
├─────────────┤
│  🏠 📧 💬  │
├─────────────┤
│  [34px]     │
└─────────────┘
```

---

### Tablets (iPad)

```
Screen: 820 × 1180 px
Safe Area: 0px (usually)
Nav: 64px
Content Padding: 64px

┌───────────────────┐
│                   │
│     Content       │  ← Maximum screen usage
│                   │
│                   │
├───────────────────┤
│   🏠 📧 💬 👤    │
└───────────────────┘
```

---

**Visual diagrams created for better understanding of safe area implementation.**

**Version:** 1.0.0  
**Last Updated:** March 11, 2026
