import { test, expect } from '@playwright/test';

test.describe('Приложение DrawIt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('загружает страницу с правильным заголовком', async ({ page }) => {
    await expect(page).toHaveTitle(/DrawIt/i);
  });

  test('отображает основные компоненты интерфейса', async ({ page }) => {
    // Sidebar with shapes
    await expect(page.locator('text=Перетащите фигуру на холст')).toBeVisible();
    
    // Toolbar with app name
    await expect(page.locator('.h-12').locator('text=DrawIt')).toBeVisible();
    
    // Canvas area (React Flow)
    await expect(page.locator('.react-flow')).toBeVisible();
    
    // Export button
    await expect(page.locator('text=Экспорт')).toBeVisible();
  });

  test('боковая панель показывает категории фигур', async ({ page }) => {
    await expect(page.locator('text=Основные фигуры')).toBeVisible();
  });

  test('отображаются горячие клавиши', async ({ page }) => {
    await expect(page.locator('kbd:has-text("Del")')).toBeVisible();
    await expect(page.locator('kbd:has-text("Ctrl+Z")')).toBeVisible();
    await expect(page.locator('kbd:has-text("Ctrl+Y")')).toBeVisible();
  });
});
