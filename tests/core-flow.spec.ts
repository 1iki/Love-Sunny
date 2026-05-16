import { test, expect } from '@playwright/test';

test.describe('Love Sunny Core Flow', () => {
  test('Complete user journey: registration, pairing, add note, view milestones', async ({ page }) => {
    // Step 1: Navigate to /auth.
    await page.goto('/auth');
    
    // Step 2 (Register): Click the "Sign up" toggle button.
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Fill in Username, Email, and Password.
    await page.getByPlaceholder('Enter your username').fill('testuser');
    await page.getByPlaceholder('your@email.com').fill('testuser@example.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    
    // Click the "Create Account" button.
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Step 3 (Pairing): Wait for the Pairing Modal.
    // The pairing modal should appear after successful registration.
    const pairingModal = page.getByRole('dialog').or(page.locator('.bg-white'));
    await expect(pairingModal).toBeVisible({ timeout: 15000 });
    
    // Fill in the Nickname and Partner Username.
    await page.getByPlaceholder(/nickname/i).fill('MyNickname');
    await page.getByPlaceholder(/partner username/i).fill('partner_username');
    
    // Click "Connect Accounts".
    await page.getByRole('button', { name: /connect accounts/i }).click();
    
    // Step 4 (Dashboard & i18n Locators)
    // Wait for the Dashboard to load after pairing.
    await page.waitForURL('**/*');
    
    // Add Note Button: Use bilingual regex
    await page.getByRole('button', { name: /(add note|tambah)/i }).click();
    
    // Fill the textarea.
    await page.getByPlaceholder(/what made you smile|apa yang membuatmu tersenyum/i).fill('We had a wonderful walk in the park! 🌳');
    
    // Save Note Button: Use bilingual regex
    await page.getByRole('button', { name: /(save|simpan)/i }).click();
    
    // Step 5 (Milestones): Click the relationship points widget.
    // Using robust locator for the widget which might not have strict text/role
    await page.locator('.bg-rose-50').first().click();

    // Verify milestone modal is visible
    const milestoneHeading = page.getByRole('heading', { name: /(milestones|pencapaian)/i });
    await expect(milestoneHeading).toBeVisible();
  });
});
