# Theme Module Integration Points

This document lists all files that were modified during the theme module archival process.

## Files Modified During Archival

### 1. src/App.tsx
**Changes Made:**
- Removed import: `import { ThemeProvider } from '@/components/timer/themes'`
- Removed `<ThemeProvider>` wrapper around `<BrowserRouter>`

**Line Numbers:** ~38, 43, 139

**Original Code:**
```tsx
import { ThemeProvider } from '@/components/timer/themes'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          {/* ... */}
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
```

**Modified Code:**
```tsx
// ThemeProvider import removed

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* ... */}
      </BrowserRouter>
    </ErrorBoundary>
  )
}
```

---

### 2. src/components/timer/shared/TimerTopNav.tsx
**Changes Made:**
- Removed import: `import { ThemesModal } from '../themes'`
- Removed state: `const [isThemesOpen, setIsThemesOpen] = useState(false)`
- Removed handler: `const handleThemesClick = () => { setIsThemesOpen(true) }`
- Removed modal: `<ThemesModal isOpen={isThemesOpen} onClose={() => setIsThemesOpen(false)} />`

**Line Numbers:** ~12, 22, 88-90, 205-208

**Original Code:**
```tsx
import { ThemesModal } from '../themes'

export const TimerTopNav: React.FC = () => {
  const [isThemesOpen, setIsThemesOpen] = useState(false)
  
  const handleThemesClick = () => {
    setIsThemesOpen(true)
  }
  
  return (
    <>
      {/* ... */}
      <ThemesModal 
        isOpen={isThemesOpen} 
        onClose={() => setIsThemesOpen(false)}
      />
    </>
  )
}
```

**Modified Code:**
```tsx
// ThemesModal import removed
// isThemesOpen state removed
// handleThemesClick handler removed
// ThemesModal component removed from JSX
```

---

### 3. src/components/timer/shared/TimerMenuSidebar.tsx
**Changes Made:**
- Modified theme menu item: `disabled: false` → `disabled: true`
- Added "Soon" badge instead of chevron when disabled

**Line Numbers:** ~103-107

**Original Code:**
```tsx
{ 
  icon: 'palette', 
  label: 'Themes', 
  description: 'Customize appearance',
  disabled: false,
  action: () => handleAction('themes')
},
```

**Modified Code:**
```tsx
{ 
  icon: 'palette', 
  label: 'Themes', 
  description: 'Customize appearance',
  disabled: true,  // Changed to disable theme access
  action: () => handleAction('themes')
},
```

**Visual Change:** Menu item now shows "Soon" badge and is not clickable.

---

### 4. src/components/timer/index.ts
**Changes Made:**
- No changes needed (theme exports were not present in this file)

**Status:** ✓ No modifications required

---

### 5. src/index.css
**Changes Made:**
- Commented out `.theme-ultra-dark` class and its properties
- Commented out `.high-contrast` class and its properties
- **PRESERVED:** `.dark` class (used for basic dark mode)

**Line Numbers:** ~66-77

**Original Code:**
```css
.theme-ultra-dark {
  --color-background: #020617;
  --color-background-secondary: #000000;
  --color-card: #0f172a;
  --color-card-hover: #1e293b;
  --color-border: #1e293b;
}

.high-contrast {
  --color-background: #000000;
  /* ... */
}
```

**Modified Code:**
```css
/* ARCHIVED: Theme customization classes
.theme-ultra-dark {
  --color-background: #020617;
  --color-background-secondary: #000000;
  --color-card: #0f172a;
  --color-card-hover: #1e293b;
  --color-border: #1e293b;
}

.high-contrast {
  --color-background: #000000;
  ...
}
*/
```

---

## Files Moved to Archive

### Source Files (moved with git mv)
- `src/components/timer/themes/` → `archive/theme/components/themes/`
  - ThemeProvider.tsx
  - ThemesModal.tsx
  - themeStore.ts
  - types.ts
  - index.ts
  - __tests__/ThemeProvider.test.tsx
  - __tests__/ThemesModal.test.tsx
  - __tests__/themeStore.test.ts

**Total Files Moved:** 8 files

---

## Dependencies Analysis

### Removed Dependencies
None - all theme dependencies are also used by other parts of the application:
- `zustand` (used by other stores)
- `react`, `react-dom` (core dependencies)
- `framer-motion` (used by other modals)

### No Action Required
- No package.json changes needed
- No dependency cleanup needed

---

## Impact Assessment

### ✅ Still Working
- Basic dark mode (`.dark` class)
- Timer functionality
- All other modals and features
- Settings menu
- Cloud sync
- History

### ❌ No Longer Available
- Theme customization UI (ThemesModal)
- Custom theme selection
- Ultra-dark theme
- High-contrast theme
- Theme persistence across sessions

### ⚠️ Reduced Functionality
- Theme menu item shows "Soon" badge
- onThemesClick callback in TimerMenuSidebar does nothing when disabled

---

## Git Commits Made

Each phase will have its own atomic commit:

1. **Phase 1:** `docs(01-22): create theme archival documentation`
2. **Phase 2:** `refactor(01-22): move theme module to archive`
3. **Phase 3:** `refactor(01-22): remove theme integration points`
4. **Phase 4:** `test(01-22): verify theme removal`

---

## Restoration Impact

When restoring, these same files will need to be modified in reverse:
- Uncomment CSS classes
- Re-add imports and components
- Change `disabled: true` back to `disabled: false`
- Move files back with `git mv`

**Estimated Restoration Time:** 15-20 minutes

**Restoration Complexity:** Low (well-documented, reversible changes)
