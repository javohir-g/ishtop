# Telegram Safe Area - Quick Reference Card

## 🎯 TL;DR

**Problem:** Android navigation bar overlaps bottom navigation  
**Solution:** Use CSS variables updated by Telegram WebApp API

---

## 📋 CSS Variables Available

```css
/* Safe Area Insets (System UI only) */
--tg-safe-top: 0px;
--tg-safe-bottom: 0px;      /* ← Most important for bottom nav */
--tg-safe-left: 0px;
--tg-safe-right: 0px;

/* Content Safe Area (includes Telegram UI) */
--tg-content-safe-top: 0px;
--tg-content-safe-bottom: 0px;
--tg-content-safe-left: 0px;
--tg-content-safe-right: 0px;

/* App Constants */
--bottom-nav-height: 64px;  /* Fixed height of bottom navigation */
```

---

## 🔧 Common Use Cases

### 1️⃣ Fixed Bottom Element

```tsx
<div 
  className="fixed bottom-0 w-full"
  style={{ bottom: 'var(--tg-safe-bottom, 0px)' }}
>
  Bottom Navigation
</div>
```

---

### 2️⃣ Content Padding (Prevent Overlap)

```tsx
<div style={{
  paddingBottom: 'calc(64px + var(--tg-safe-bottom, 0px))'
}}>
  Scrollable Content
</div>
```

**Formula:**  
`Content Padding = Bottom Nav Height + Safe Area Bottom`

---

### 3️⃣ Floating Action Button Above Bottom Nav

```tsx
<button style={{
  bottom: 'calc(64px + var(--tg-safe-bottom, 0px) + 16px)'
}}>
  FAB
</button>
```

**Formula:**  
`FAB Bottom = Nav Height + Safe Area + Margin`

---

### 4️⃣ Full-Height Container

```tsx
<div 
  className="min-h-screen"
  style={{
    paddingBottom: 'calc(64px + var(--tg-safe-bottom, 0px))'
  }}
>
  Full Height Content
</div>
```

---

### 5️⃣ Bottom Sheet / Modal

```tsx
<div 
  className="fixed inset-x-0 rounded-t-2xl"
  style={{
    bottom: 'var(--tg-safe-bottom, 0px)',
    paddingBottom: 'var(--tg-safe-bottom, 0px)'
  }}
>
  Bottom Sheet Content
</div>
```

---

## 🪝 Hook Usage

### Initialize Once (in Root Component)

```tsx
import { useTelegramSafeArea } from './hooks/useTelegramSafeArea';

export function Root() {
  useTelegramSafeArea(); // ← Call this once at app root
  
  return <div>...</div>;
}
```

**What it does:**
- ✅ Expands app to fullscreen
- ✅ Reads Telegram safe area values
- ✅ Updates CSS variables automatically
- ✅ Listens to viewport changes

---

## 🎨 Smooth Transitions

Add smooth animation when safe area changes:

```tsx
<div className="transition-[bottom] duration-300 ease-out">
  {/* Element will smoothly move when safe area changes */}
</div>
```

**Recommended timing:**
- `duration-300` (300ms) - Optimal balance
- `ease-out` - Natural deceleration

---

## 🧪 Testing

### In Browser (Development)

Run this in DevTools Console to simulate Telegram:

```javascript
// Simulate Android navigation bar (48px)
document.documentElement.style.setProperty('--tg-safe-bottom', '48px');

// Simulate iOS home indicator (34px)
document.documentElement.style.setProperty('--tg-safe-bottom', '34px');

// Reset to no safe area
document.documentElement.style.setProperty('--tg-safe-bottom', '0px');
```

### In Telegram App

1. Open app in Telegram
2. Check bottom navigation is not overlapped
3. Rotate device → should adjust smoothly
4. Open/close keyboard → should adjust

---

## 🐛 Debugging

### Check if Telegram API is available

```javascript
console.log(window.Telegram?.WebApp);
// Should be an object with expand(), safeAreaInset, etc.
```

### Check CSS variable value

```javascript
console.log(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--tg-safe-bottom')
);
// Should show "0px" or "48px" etc.
```

### Check if fullscreen is enabled

```javascript
console.log(window.Telegram?.WebApp?.isExpanded);
// Should be true
```

---

## 📱 Expected Values by Device

| Device | OS | Navigation | `--tg-safe-bottom` |
|--------|----|-----------|--------------------|
| Samsung Galaxy | Android | Gesture | 48-60px |
| Samsung Galaxy | Android | Buttons | 48px |
| iPhone 14 Pro | iOS | Gesture | 34px |
| iPhone SE | iOS | Home button | 0px |
| iPad | iOS | Any | 0px (usually) |

---

## ⚠️ Common Mistakes

### ❌ DON'T: Hardcode padding

```tsx
<div className="pb-20"> {/* Fixed padding */}
  Content
</div>
```

### ✅ DO: Use dynamic padding

```tsx
<div style={{ paddingBottom: 'calc(64px + var(--tg-safe-bottom, 0px))' }}>
  Content
</div>
```

---

### ❌ DON'T: Forget fallback value

```tsx
style={{ bottom: 'var(--tg-safe-bottom)' }} {/* No fallback */}
```

### ✅ DO: Always provide fallback

```tsx
style={{ bottom: 'var(--tg-safe-bottom, 0px)' }} {/* Fallback: 0px */}
```

---

### ❌ DON'T: Use only Tailwind classes

```tsx
<div className="fixed bottom-0"> {/* No safe area support */}
```

### ✅ DO: Combine Tailwind + inline styles

```tsx
<div 
  className="fixed bottom-0"
  style={{ bottom: 'var(--tg-safe-bottom, 0px)' }}
>
```

---

## 📐 Math Formulas

### Total Content Padding
```
Padding Bottom = Nav Height + Safe Area Bottom
               = 64px + var(--tg-safe-bottom)
```

### Element Above Navigation
```
Element Bottom = Nav Height + Safe Area + Margin
               = 64px + var(--tg-safe-bottom) + 16px
```

### Full Viewport Height (Accounting for Nav)
```
Available Height = 100vh - Nav Height - Safe Area
                 = 100vh - 64px - var(--tg-safe-bottom)
```

---

## 🔄 When Safe Area Changes

Safe area values can change when:

✅ Device orientation changes (portrait ↔ landscape)  
✅ Keyboard opens/closes  
✅ Android navigation mode changes (gesture ↔ buttons)  
✅ App enters/exits fullscreen  
✅ System UI visibility changes  

**Our implementation handles all these automatically!**

---

## 📞 Files to Check

| File | Purpose |
|------|---------|
| `/src/app/hooks/useTelegramSafeArea.ts` | Hook that updates CSS variables |
| `/src/styles/theme.css` | CSS variable definitions |
| `/src/app/components/BottomNav.tsx` | Job seeker bottom nav |
| `/src/app/components/KindergartenBottomNav.tsx` | Employer bottom nav |
| `/src/app/Root.tsx` | Root component using the hook |

---

## 🎓 Learn More

📖 [Full Documentation](/TELEGRAM_SAFE_AREA_GUIDE.md)  
🔗 [Telegram WebApp API](https://core.telegram.org/bots/webapps)  
🔗 [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Version:** 1.0.0  
**Last Updated:** March 11, 2026
