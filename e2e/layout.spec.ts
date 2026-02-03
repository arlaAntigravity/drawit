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

test.describe('Авто-раскладка', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    
    await dragShapeToCanvas(page, 'Прямоугольник', 200, 100);
    await dragShapeToCanvas(page, 'Ромб', 400, 200);
    await dragShapeToCanvas(page, 'Эллипс', 300, 300);
  });

  test('кнопка раскладки активна при наличии узлов', async ({ page }) => {
    const layoutButton = page.locator('button:has-text("Раскладка")');
    await expect(layoutButton).toBeEnabled();
  });

  test('кнопка раскладки неактивна без узлов', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.h-12 button').last().click();
    
    const layoutButton = page.locator('button:has-text("Раскладка")');
    await expect(layoutButton).toBeDisabled();
  });

  test('можно открыть меню раскладок', async ({ page }) => {
    await page.locator('text=Раскладка').click();
    
    await expect(page.locator('[role="menuitem"]:has-text("Вертикальная")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Горизонтальная")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Дерево")')).toBeVisible();
  });

  test('вертикальная раскладка перемещает узлы', async ({ page }) => {
    const nodesBefore = await page.locator('.react-flow__node').all();
    const initialPositions = await Promise.all(
      nodesBefore.map(async n => {
        const box = await n.boundingBox();
        return { x: box?.x, y: box?.y };
      })
    );
    
    await page.locator('text=Раскладка').click();
    await page.locator('[role="menuitem"]:has-text("Вертикальная")').click();
    
    await page.waitForTimeout(500);
    
    const nodesAfter = await page.locator('.react-flow__node').all();
    const newPositions = await Promise.all(
      nodesAfter.map(async n => {
        const box = await n.boundingBox();
        return { x: box?.x, y: box?.y };
      })
    );
    
    const positionsChanged = initialPositions.some((pos, i) => 
      pos.x !== newPositions[i]?.x || pos.y !== newPositions[i]?.y
    );
    expect(positionsChanged).toBe(true);
  });

  test('горизонтальная раскладка работает', async ({ page }) => {
    await page.locator('text=Раскладка').click();
    await page.locator('[role="menuitem"]:has-text("Горизонтальная")').click();
    await expect(page.locator('.react-flow__node')).toHaveCount(3);
  });

  test('раскладка деревом работает', async ({ page }) => {
    await page.locator('text=Раскладка').click();
    await page.locator('[role="menuitem"]:has-text("Дерево")').click();
    await expect(page.locator('.react-flow__node')).toHaveCount(3);
  });
});
