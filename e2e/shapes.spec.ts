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

test.describe('Все типы фигур', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  const shapes = [
    { name: 'Прямоугольник', type: 'rectangle' },
    { name: 'Скруглённый', type: 'roundedRect' },
    { name: 'Ромб', type: 'diamond' },
    { name: 'Эллипс', type: 'ellipse' },
    { name: 'Текст', type: 'text' },
    { name: 'База данных', type: 'cylinder' },
    { name: 'Треугольник', type: 'triangle' },
    { name: 'Группа', type: 'group' },
  ];

  for (const shape of shapes) {
    test(`можно создать узел типа ${shape.name}`, async ({ page }) => {
      await dragShapeToCanvas(page, shape.name);
      
      const node = page.locator('.react-flow__node');
      await expect(node).toHaveCount(1);
    });
  }

  test('можно создать несколько разных фигур', async ({ page }) => {
    let x = 100;
    
    await dragShapeToCanvas(page, 'Прямоугольник', x, 150);
    x += 150;
    await dragShapeToCanvas(page, 'Ромб', x, 150);
    x += 150;
    await dragShapeToCanvas(page, 'Эллипс', x, 150);
    x += 150;
    await dragShapeToCanvas(page, 'Треугольник', x, 150);
    
    await expect(page.locator('.react-flow__node')).toHaveCount(4);
  });

  test('фигуры можно перетаскивать из боковой панели', async ({ page }) => {
    const shapeButtons = page.locator('.w-64 button[draggable="true"]');
    const count = await shapeButtons.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('боковая панель содержит все кнопки фигур', async ({ page }) => {
    for (const shape of shapes) {
      const shapeButton = page.locator(`.w-64 button:has-text("${shape.name}")`);
      await expect(shapeButton).toBeVisible();
    }
  });
});
