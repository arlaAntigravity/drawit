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

test.describe('Изменение размера узлов (Node Resizing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('должен изменять размер прямоугольника', async ({ page }) => {
    // Добавляем прямоугольник
    await dragShapeToCanvas(page, 'Прямоугольник');

    const node = page.locator('.react-flow__node-rectangle');
    await expect(node).toBeVisible();

    // Получаем начальные размеры
    const initialBox = await node.boundingBox();
    if (!initialBox) throw new Error('Could not get initial bounding box');

    // Кликаем по узлу, чтобы появились ручки изменения размера
    await node.click();
    
    // Находим ручку изменения размера (нижний правый угол)
    const resizer = node.locator('.react-flow__resize-control.bottom.right');
    await expect(resizer).toBeVisible();

    // Тянем за ручку
    const resizerBox = await resizer.boundingBox();
    if (!resizerBox) throw new Error('Could not get resizer bounding box');

    await page.mouse.move(resizerBox.x + resizerBox.width / 2, resizerBox.y + resizerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(resizerBox.x + 100, resizerBox.y + 100);
    await page.mouse.up();

    // Проверяем, что размеры изменились
    const finalBox = await node.boundingBox();
    if (!finalBox) throw new Error('Could not get final bounding box');

    expect(finalBox.width).toBeGreaterThan(initialBox.width);
    expect(finalBox.height).toBeGreaterThan(initialBox.height);
  });

  test('должен соблюдать минимальные размеры', async ({ page }) => {
    // Добавляем прямоугольник
    await dragShapeToCanvas(page, 'Прямоугольник');

    const node = page.locator('.react-flow__node-rectangle');
    await node.click();

    // Находим ручку (верхний левый)
    const resizer = node.locator('.react-flow__resize-control.top.left');
    const resizerBox = await resizer.boundingBox();
    if (!resizerBox) throw new Error('Could not get resizer bounding box');

    // Пытаемся уменьшить до очень маленького размера (тянем внутрь)
    await page.mouse.move(resizerBox.x + resizerBox.width / 2, resizerBox.y + resizerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(resizerBox.x + 200, resizerBox.y + 200); 
    await page.mouse.up();

    const finalBox = await node.boundingBox();
    if (!finalBox) throw new Error('Could not get final bounding box');

    // Минимальная ширина была задана 50, высота 30
    expect(finalBox.width).toBeGreaterThanOrEqual(50);
    expect(finalBox.height).toBeGreaterThanOrEqual(30);
  });
});
