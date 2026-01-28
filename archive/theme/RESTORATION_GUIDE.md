# Theme Module Restoration Guide

This guide provides step-by-step instructions to restore the theme customization feature.

## Prerequisites

- Ensure no conflicting theme system exists in the current codebase
- Verify all dependencies are still compatible
- Back up current code before restoration

## Step 1: Restore Source Files

Move the archived files back to their original locations:

```bash
# Restore theme components
git mv archive/theme/components/themes src/components/timer/

# Verify files are in correct location
ls -la src/components/timer/themes/
```

Expected files after restoration:
- ThemeProvider.tsx
- ThemesModal.tsx
- themeStore.ts
- types.ts
- index.ts
- __tests__/ThemeProvider.test.tsx
- __tests__/ThemesModal.test.tsx
- __tests__/themeStore.test.ts

## Step 2: Restore CSS Theme Classes

In `src/index.css`, uncomment the theme-specific CSS classes:

```css
/* Uncomment these sections */
.theme-ultra-dark {
  --color-background: #020617;
  --color-background-secondary: #000000;
  --color-card: #0f172a;
  --color-card-hover: #1e293b;
  --color-border: #1e293b;
}

.high-contrast {
  --color-background: #000000;
  /* ... rest of high-contrast styles ... */
}
```

**Important:** Keep the `.dark` class as-is (it's used for basic dark mode).

## Step 3: Restore App.tsx Integration

In `src/App.tsx`, add the ThemeProvider import and wrapper:

```tsx
// Add import at top
import { ThemeProvider } from '@/components/timer/themes'

// Wrap BrowserRouter with ThemeProvider
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          {/* ... rest of app ... */}
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
```

## Step 4: Restore TimerTopNav.tsx Integration

In `src/components/timer/shared/TimerTopNav.tsx`:

```tsx
// Add import
import { ThemesModal } from '../themes'

// Add state (around line 22)
const [isThemesOpen, setIsThemesOpen] = useState(false)

// Add handler (around line 88)
const handleThemesClick = () => {
  setIsThemesOpen(true)
}

// Add modal at bottom (around line 205)
<ThemesModal 
  isOpen={isThemesOpen} 
  onClose={() => setIsThemesOpen(false)}
/>
```

## Step 5: Restore TimerMenuSidebar.tsx Menu Item

In `src/components/timer/shared/TimerMenuSidebar.tsx`, in the `settingsItems` array (around line 103):

```tsx
{ 
  icon: 'palette', 
  label: 'Themes', 
  description: 'Customize appearance',
  disabled: false,  // Change from true to false
  action: () => handleAction('themes')
},
```

## Step 6: Restore Timer Index Exports (Optional)

If you want to export theme utilities from the timer module, add to `src/components/timer/index.ts`:

```tsx
// Theme System
export { ThemeProvider, ThemesModal } from './themes'
export { useThemeStore } from './themes/themeStore'
export type { Theme, ThemeConfig } from './themes/types'
```

## Step 7: Verify Restoration

Run the following checks:

```bash
# 1. Check imports resolve
npm run type-check

# 2. Run theme tests
npm test themes

# 3. Build the app
npm run build

# 4. Start dev server and manually test
npm run dev
```

## Step 8: Manual Testing

1. Open the timer page
2. Click hamburger menu → Settings → Themes
3. Verify ThemesModal opens
4. Test theme switching
5. Verify theme persists after refresh
6. Test dark mode still works

## Verification Checklist

- [ ] All source files restored to original locations
- [ ] CSS theme classes uncommented
- [ ] ThemeProvider wrapping App component
- [ ] ThemesModal imported and rendered in TimerTopNav
- [ ] Theme menu item enabled in TimerMenuSidebar
- [ ] All imports resolve without errors
- [ ] App compiles successfully
- [ ] Tests pass
- [ ] Theme switching works in UI
- [ ] Theme persists after refresh

## Rollback

If restoration fails, you can quickly rollback:

```bash
# Move files back to archive
git mv src/components/timer/themes archive/theme/components/

# Revert integration changes
git checkout src/App.tsx
git checkout src/components/timer/shared/TimerTopNav.tsx
git checkout src/components/timer/shared/TimerMenuSidebar.tsx
git checkout src/index.css
```

## Notes

- Git history is preserved from the `git mv` commands
- Theme store state may be reset after restoration
- Users will need to re-select their preferred theme
- Consider adding a migration script if theme data format changed

## Support

If you encounter issues during restoration:
1. Check the INTEGRATION_POINTS.md for all modified files
2. Review git history: `git log --follow archive/theme/components/themes/`
3. Compare with commit before archival
