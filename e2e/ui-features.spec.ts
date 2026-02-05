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

test.describe('Новые функции интерфейса', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('контекстное меню открывается при клике правой кнопкой на холст', async ({ page }) => {
    const pane = page.locator('.react-flow__pane');
    await pane.click({ button: 'right', position: { x: 300, y: 300 } });
    
    const menu = page.locator('[data-slot="context-menu-content"]');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Полотно');
  });

  test('контекстное меню открывается на узле с соответствующими опциями', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    const node = page.locator('.react-flow__node');
    
    await node.click({ button: 'right' });
    
    const menu = page.locator('[data-slot="context-menu-content"]');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Узел');
    await expect(menu).toContainText('Дублировать');
  });

  test('функция дублирования узла работает', async ({ page }) => {
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    const node = page.locator('.react-flow__node');
    
    await node.click({ button: 'right' });
    await page.locator('text=Дублировать').click();
    
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
  });

  test('инструменты выравнивания отображаются и блокируются при отсутствии выбора', async ({ page }) => {
    const alignLeftBtn = page.getByTestId('align-left');
    await expect(alignLeftBtn).toBeVisible();
    await expect(alignLeftBtn).toBeDisabled();
    
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    await dragShapeToCanvas(page, 'Круг', 400, 300);
    
    // Select both nodes
    await page.keyboard.down('Control');
    await page.locator('.react-flow__node').first().click();
    await page.locator('.react-flow__node').last().click();
    await page.keyboard.up('Control');
    
    await expect(alignLeftBtn).toBeEnabled();
  });

  test('переключатель темы работает', async ({ page }) => {
    const html = page.locator('html');
    
    // Check initial state (should be dark by default based on my implementation)
    const initialTheme = await html.getAttribute('class');
    const themeBtn = page.getByTestId('theme-toggle');
    
    await themeBtn.click();
    const updatedTheme = await html.getAttribute('class');
    
    if (initialTheme?.includes('dark')) {
      expect(updatedTheme).not.toContain('dark');
    } else {
      expect(updatedTheme).toContain('dark');
    }
    
    // Toggle back
    await themeBtn.click();
    const restoredTheme = await html.getAttribute('class');
    expect(restoredTheme).toBe(initialTheme);
  });
});
