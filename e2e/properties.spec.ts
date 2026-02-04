import { test, expect, Page } from '@playwright/test';

async function dragShapeToCanvas(page: Page, shapeName: string) {
  const sidebar = page.locator('.w-64');
  const shapeButton = sidebar.locator(`button:has-text("${shapeName}")`);
  const canvas = page.locator('.react-flow');
  
  await shapeButton.dragTo(canvas, {
    targetPosition: { x: 300, y: 200 }
  });
  
  await page.waitForTimeout(200);
}

test.describe('Панель свойств', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('показывает пустое состояние, когда узел не выбран', async ({ page }) => {
    const panel = page.locator('.w-72');
    await expect(panel.locator('text=Свойства')).toBeVisible();
    await expect(panel.locator('text=Выберите элемент')).toBeVisible();
  });

  test('отображает свойства при выборе узла', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    
    await page.waitForTimeout(200);
    
    const panel = page.locator('.w-72');
    
    // Должно быть поле ввода текста
    await expect(panel.locator('label#label').or(panel.locator('label[for="label"]'))).toBeVisible();
    
    // Должен отображаться тип узла
    await expect(panel.locator('p:has-text("rectangle")')).toBeVisible();
  });

  test('можно изменить текст узла через панель свойств', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    
    await page.waitForTimeout(200);
    
    const labelInput = page.locator('.w-72 input#label');
    await labelInput.clear();
    await labelInput.fill('Новое название');
    
    // Tab для сохранения
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    await expect(node.locator('text=Новое название')).toBeVisible();
  });

  test('показывает настройки цвета', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    
    await page.waitForTimeout(200);
    
    const panel = page.locator('.w-72');
    
    await expect(panel.locator('text=Цвет заливки')).toBeVisible();
    await expect(panel.locator('text=Цвет обводки')).toBeVisible();
  });

  test('показывает настройки размера', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    
    await page.waitForTimeout(200);
    
    const panel = page.locator('.w-72');
    
    await expect(panel.locator('text=Ширина')).toBeVisible();
    await expect(panel.locator('text=Высота')).toBeVisible();
  });
});
