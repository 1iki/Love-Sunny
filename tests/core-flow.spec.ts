import { test, expect } from '@playwright/test';

test.describe('Love Sunny Core Flow', () => {
  test('Complete user journey: login, add note, view milestones', async ({ page }) => {
    // 1. Navigate to auth and login
    await page.goto('/auth');
    
    // Fill in mock credentials
    await page.getByPlaceholder('Enter your username').fill('testuser');
    await page.getByPlaceholder('••••••••').fill('password123');
    
    // Select role if registering/needed (assuming a standard login form here)
    // Clicking the "Login to your account" or equivalent submit button
    const submitButton = page.getByRole('button', { name: /Sign In/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
    
    // 2. Verify redirect to Dashboard (/)
    await page.waitForURL('**/*');
    await expect(page).toHaveURL(/\/?$/);
    
    // 3. Open "Add Note" modal, fill in, and submit
    await page.getByRole('button', { name: /add note/i }).click();
    
    // Wait for modal to be visible
    const noteModal = page.getByRole('dialog').or(page.locator('.bg-white.rounded-t-\\[32px\\]'));
    await expect(noteModal).toBeVisible();
    
    // Fill the note text
    await page.getByPlaceholder('What made you smile today?').fill('We had a wonderful walk in the park! 🌳');
    
    // Add a tag
    await page.getByPlaceholder('Add tag (e.g. cute, date)').fill('date');
    await page.keyboard.press('Enter');
    
    // Submit the note
    await page.getByRole('button', { name: /save note/i }).click();
    
    // Verify modal closes
    await expect(page.getByPlaceholder('What made you smile today?')).toBeHidden();
    
    // 4. Open the Milestones Modal and verify
    // Click the points widget (it's a button rendering the total points)
    await page.getByRole('button', { name: /keep it up|160 pts to next milestone/i }).click();

    // Verify milestone modal is visible
    const milestoneHeading = page.getByRole('heading', { name: 'Milestones & Rewards' });
    await expect(milestoneHeading).toBeVisible();
    
    // Check for a reward item
    await expect(page.getByText('Movie Night Choice')).toBeVisible();
  });
});
