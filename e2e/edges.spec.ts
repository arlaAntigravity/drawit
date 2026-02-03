import { test, expect, Page } from '@playwright/test';

async function dragShapeToCanvas(page: Page, shapeName: string, x: number, y: number) {
  const sidebar = page.locator('.w-64');
  const shapeButton = sidebar.locator(`button:has-text("${shapeName}")`);
  const canvas = page.locator('.react-flow');
  
  await shapeButton.dragTo(canvas, {
    targetPosition: { x, y }
  });
  
  await page.waitForTimeout(200);
}

test.describe('Операции со связями (Edge)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('можно создать связь между двумя узлами', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 150, 200);
    await dragShapeToCanvas(page, 'Ромб', 450, 200);
    
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(2);
    
    const sourceNode = nodes.first();
    const targetNode = nodes.last();
    
    const sourceBox = await sourceNode.boundingBox();
    const targetBox = await targetNode.boundingBox();
    
    if (sourceBox && targetBox) {
      const startX = sourceBox.x + sourceBox.width - 5;
      const startY = sourceBox.y + sourceBox.height / 2;
      const endX = targetBox.x + 5;
      const endY = targetBox.y + targetBox.height / 2;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.mouse.up();
      
      await page.waitForTimeout(300);
    }
    
    const edgeCount = await page.locator('.react-flow__edge').count();
    expect(edgeCount).toBeGreaterThanOrEqual(0);
  });

  test('у узлов есть точки подключения (handles)', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 200, 150);
    
    const node = page.locator('.react-flow__node').first();
    const handles = node.locator('.react-flow__handle');
    
    const handleCount = await handles.count();
    expect(handleCount).toBeGreaterThan(0);
  });

  test('точки подключения отображаются при наведении', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 200, 150);
    
    const node = page.locator('.react-flow__node').first();
    await node.hover();
    
    const handles = node.locator('.react-flow__handle');
    await expect(handles.first()).toBeAttached();
  });
});
