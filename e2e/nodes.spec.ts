import { test, expect, Page } from '@playwright/test';

/**
 * Вспомогательная функция для перетаскивания фигуры из боковой панели на холст
 */
async function dragShapeToCanvas(page: Page, shapeName: string) {
  const sidebar = page.locator('.w-64');
  const shapeButton = sidebar.locator(`button:has-text("${shapeName}")`);
  const canvas = page.locator('.react-flow');
  
  await shapeButton.dragTo(canvas, {
    targetPosition: { x: 300, y: 200 }
  });
}

test.describe('Операции с узлами', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('можно добавить прямоугольник перетаскиванием', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    // Узел должен появиться на холсте
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });

  test('можно добавить несколько разных узлов', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    await dragShapeToCanvas(page, 'Ромб');
    
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
  });

  test('можно выделить узел кликом', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    
    // Узел должен иметь класс selected
    await expect(node).toHaveClass(/selected/);
  });

  test('можно удалить узел клавишей Delete', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.keyboard.press('Delete');
    
    // Узел должен быть удален
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('можно удалить узел клавишей Backspace', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await page.keyboard.press('Backspace');
    
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('можно отменить/повторить создание узла', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
    
    // Отмена (Undo)
    await page.locator('.react-flow__pane').click({ position: { x: 10, y: 10 } });
    await page.keyboard.press('Control+z');
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
    
    // Повтор (Redo)
    await page.keyboard.press('Control+y');
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });

  test('можно редактировать текст узла двойным кликом', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник');
    
    const node = page.locator('.react-flow__node').first();
    
    // Двойной клик по тексту для начала редактирования
    const label = node.locator('span[title="Двойной клик для редактирования"]');
    await label.dblclick();
    
    // Должен появиться input
    const input = node.locator('input[type="text"]');
    await expect(input).toBeVisible();
    
    // Вводим новый текст
    await input.fill('Новый текст');
    await page.keyboard.press('Enter');
    
    // Проверяем, что текст изменился
    await expect(node.locator('text=Новый текст')).toBeVisible();
  });
});
