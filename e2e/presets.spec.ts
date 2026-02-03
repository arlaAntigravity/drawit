import { test, expect } from '@playwright/test';

test.describe('Модальное окно шаблонов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('можно открыть окно через кнопку Новый', async ({ page }) => {
    await page.locator('button:has-text("Новый")').click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('окно содержит контент', async ({ page }) => {
    await page.locator('button:has-text("Новый")').click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const buttons = modal.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });

  test('окно можно закрыть клавишей Escape', async ({ page }) => {
    await page.locator('button:has-text("Новый")').click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    await expect(modal).not.toBeVisible();
  });

  test('окно доступно для взаимодействия', async ({ page }) => {
    await page.locator('button:has-text("Новый")').click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await expect(modal).toBeAttached();
  });
});
