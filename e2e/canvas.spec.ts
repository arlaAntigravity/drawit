import { test, expect, Page } from '@playwright/test';

async function dragShapeToCanvas(page: Page, shapeName: string, x: number = 300, y: number = 200) {
  const sidebar = page.locator('.w-64');
  const shapeButton = sidebar.locator(`button:has-text("${shapeName}")`);
  const canvas = page.locator('.react-flow');
  
  await shapeButton.dragTo(canvas, {
    targetPosition: { x, y }
  });
  
  await page.waitForTimeout(200);
}

test.describe('Взаимодействие с холстом', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('на холсте есть элементы управления зумом', async ({ page }) => {
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();
  });

  test('мини-карта отображается', async ({ page }) => {
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible();
  });

  test('клик по фону не создает узлы', async ({ page }) => {
    const canvas = page.locator('.react-flow__pane');
    await canvas.click({ position: { x: 200, y: 200 } });
    
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('на фоне отображается сетка', async ({ page }) => {
    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible();
  });
});

test.describe('Горячие клавиши', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('клавиша Delete удаляет выбранный узел', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    
    const node = page.locator('.react-flow__node');
    await node.click();
    await page.keyboard.press('Delete');
    
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('клавиша Backspace удаляет выбранный узел', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    
    const node = page.locator('.react-flow__node');
    await node.click();
    await page.keyboard.press('Backspace');
    
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('Ctrl+Z отменяет действие', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
    
    await page.locator('.react-flow__pane').click({ position: { x: 100, y: 100 } });
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(200);
    
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('Ctrl+Y возвращает действие', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    
    await page.locator('.react-flow__pane').click({ position: { x: 100, y: 100 } });
    await page.keyboard.press('Control+z');
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
    
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(200);
    
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });

  test('горячие клавиши не срабатывают при вводе текста', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    
    const node = page.locator('.react-flow__node');
    await node.click();
    
    const labelInput = page.locator('.w-72 input#label');
    await labelInput.focus();
    
    await page.keyboard.press('Delete');
    
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });
});
