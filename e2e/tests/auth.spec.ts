import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should show login page', async ({ page }) => {
      await page.goto('/login')
      await expect(page.locator('h1, h2').filter({ hasText: /log in|sign in/i }).first()).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login')
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Should show validation errors
      await expect(page.locator('text=/email.*required/i, text=/password.*required/i').first()).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com')
      await page.fill('input[type="password"], input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show error message
      await expect(page.locator('text=/invalid.*credentials|incorrect.*password|login.*failed/i').first()).toBeVisible({ timeout: 10000 })
    })

    test('should redirect to signup page', async ({ page }) => {
      await page.goto('/login')
      await page.click('a[href*="signup"], button:has-text("Sign up")')
      
      await expect(page).toHaveURL(/.*signup/)
    })
  })

  test.describe('Signup', () => {
    test('should show signup page', async ({ page }) => {
      await page.goto('/signup')
      await expect(page.locator('h1, h2').filter({ hasText: /sign up|create.*account/i }).first()).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/signup')
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Should show validation errors
      await expect(page.locator('text=/email.*required|password.*required/i').first()).toBeVisible()
    })

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/signup')
      
      await page.fill('input[type="email"], input[name="email"]', 'invalid-email')
      await page.fill('input[type="password"], input[name="password"]', 'Password123!')
      await page.click('button[type="submit"]')
      
      // Should show validation error
      await expect(page.locator('text=/invalid.*email|valid.*email/i').first()).toBeVisible()
    })

    test('should show error for weak password', async ({ page }) => {
      await page.goto('/signup')
      
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com')
      await page.fill('input[type="password"], input[name="password"]', '123')
      await page.click('button[type="submit"]')
      
      // Should show validation error
      await expect(page.locator('text=/password.*short|password.*weak|at least.*characters/i').first()).toBeVisible()
    })

    test('should redirect to login page', async ({ page }) => {
      await page.goto('/signup')
      await page.click('a[href*="login"], button:has-text("Log in"), a:has-text("Log in")')
      
      await expect(page).toHaveURL(/.*login/)
    })
  })

  test.describe('Password Reset', () => {
    test('should show forgot password page', async ({ page }) => {
      await page.goto('/login')
      await page.click('a[href*="forgot"], a:has-text("Forgot")')
      
      await expect(page).toHaveURL(/.*forgot/)
      await expect(page.locator('h1, h2').filter({ hasText: /forgot.*password|reset.*password/i }).first()).toBeVisible()
    })

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/forgot-password')
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=/email.*required/i').first()).toBeVisible()
    })

    test('should show success message for valid email', async ({ page }) => {
      await page.goto('/forgot-password')
      
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com')
      await page.click('button[type="submit"]')
      
      // Should show success message
      await expect(page.locator('text=/check.*email|reset.*link.*sent|email.*sent/i').first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/settings')
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/, { timeout: 5000 })
    })

    test('should redirect unauthenticated users from timer to login', async ({ page }) => {
      await page.goto('/timer')
      
      // Should redirect to login or show login prompt
      const isOnLogin = page.url().includes('login')
      const hasLoginModal = await page.locator('text=/sign in|log in/i').count() > 0
      
      expect(isOnLogin || hasLoginModal).toBeTruthy()
    })
  })

  test.describe('Session Management', () => {
    test('logout button should be visible when authenticated', async ({ page, context }) => {
      // Mock authenticated state
      await context.addCookies([
        { name: 'sb-access-token', value: 'mock-token', domain: 'localhost', path: '/' }
      ])
      
      await page.goto('/settings')
      
      // Should show logout button
      const logoutButton = page.locator('button:has-text("Log out"), button:has-text("Sign out"), a:has-text("Log out")')
      await expect(logoutButton.first()).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Two-Factor Authentication', () => {
    test('should show 2FA settings in settings page', async ({ page, context }) => {
      // Mock authenticated state
      await context.addCookies([
        { name: 'sb-access-token', value: 'mock-token', domain: 'localhost', path: '/' }
      ])
      
      await page.goto('/settings')
      
      // Should show 2FA section
      const twoFactorSection = page.locator('text=/two.factor|2fa|authenticator/i')
      await expect(twoFactorSection.first()).toBeVisible({ timeout: 10000 })
    })
  })
})
