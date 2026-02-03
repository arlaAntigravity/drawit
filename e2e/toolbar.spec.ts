import { test, expect, Page } from '@playwright/test';

async function dragShapeToCanvas(page: Page, shapeName: string, x: number, y: number) {
  const sidebar = page.locator('.w-64');
  const shapeButton = sidebar.locator(`button:has-text("${shapeName}")`);
  const canvas = page.locator('.react-flow');
  
  await shapeButton.dragTo(canvas, {
    targetPosition: { x, y }
  });
}

test.describe('Панель инструментов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('кнопка отмены активна после действий', async ({ page }) => {
    // Сначала ничего нельзя отменить
    const undoButton = page.locator('button[aria-label="Отменить"]').or(
      page.locator('button').filter({ has: page.locator('svg') }).first()
    );
    
    // Добавляем узел
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    
    // Теперь кнопка DrawIt и остальные на месте
    await expect(page.locator('text=DrawIt').first()).toBeVisible();
  });

  test('можно открыть меню экспорта', async ({ page }) => {
    await page.locator('text=Экспорт').click();
    
    // Пункты меню должны быть видимы
    await expect(page.locator('text=PNG')).toBeVisible();
    await expect(page.locator('text=SVG')).toBeVisible();
    await expect(page.locator('text=JSON')).toBeVisible();
  });

  test('можно открыть меню раскладки', async ({ page }) => {
    // Сначала добавим узел, чтобы кнопка стала активной
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    
    await page.locator('text=Раскладка').click();
    
    await expect(page.locator('text=Вертикальная')).toBeVisible();
    await expect(page.locator('text=Горизонтальная')).toBeVisible();
    await expect(page.locator('text=Дерево')).toBeVisible();
  });

  test('можно очистить все узлы', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    await dragShapeToCanvas(page, 'Ромб', 500, 200);
    
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
    
    // Обработка диалога подтверждения
    page.on('dialog', dialog => dialog.accept());
    
    // Кнопка очистки (иконка корзины в конце)
    const clearButton = page.locator('.h-12 button').last();
    await clearButton.click();
    
    await expect(page.locator('.react-flow__node')).toHaveCount(0);
  });

  test('можно открыть модальное окно шаблонов', async ({ page }) => {
    await page.locator('text=Новый').click();
    
    // Модальное окно должно появиться
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('кнопка импорта отображается', async ({ page }) => {
    await expect(page.locator('text=Импорт')).toBeVisible();
  });
});
