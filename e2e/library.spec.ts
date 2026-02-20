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

test.describe('Шаблоны узлов (Node Library)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('можно сохранить узел как шаблон и перетащить его из библиотеки', async ({ page }) => {
    // 1. Создаем узел для шаблона
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    const node = page.locator('.react-flow__node').first();
    await node.click(); // Выделяем

    // Переопределяем prompt в Playwright (так как save_template вызывает window.prompt)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Введите имя шаблона:');
      await dialog.accept('Test Template');
    });

    // 2. Открываем контекстное меню и сохраняем как шаблон
    await node.click({ button: 'right' });
    await page.locator('div[role="menuitem"]:has-text("Сохранить как шаблон")').click();

    // 3. Проверяем, что шаблон появился в боковой панели
    const sidebar = page.locator('.w-64');
    await expect(sidebar.locator('text=Мои шаблоны')).toBeVisible();
    
    const templateButton = sidebar.locator('button', { hasText: 'Test Template' });
    await expect(templateButton).toBeVisible();

    // 4. Удаляем оригинальный узел с холста
    await node.click();
    await page.keyboard.press('Delete');
    await expect(page.locator('.react-flow__node')).toHaveCount(0);

    // 5. Перетаскиваем шаблон из боковой панели на холст
    const canvas = page.locator('.react-flow');
    await templateButton.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });
    
    // Проверяем, что узел появился
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
    
    // Выделяем его и проверяем свойства
    await page.locator('.react-flow__node').first().click();
    await page.waitForTimeout(100);
    const panel = page.locator('.w-72');
    await expect(panel.locator('p:has-text("rectangle")')).toBeVisible();
  });

  test('можно удалить шаблон из библиотеки', async ({ page }) => {
    // 1. Создаем узел и сохраняем как шаблон
    await dragShapeToCanvas(page, 'Прямоугольник', 300, 200);
    const node = page.locator('.react-flow__node').first();
    await node.click();

    page.on('dialog', async dialog => {
      await dialog.accept('Template To Delete');
    });

    await node.click({ button: 'right' });
    await page.locator('div[role="menuitem"]:has-text("Сохранить как шаблон")').click();

    // 2. Убеждаемся, что шаблон есть в боковой панели
    const sidebar = page.locator('.w-64');
    await expect(sidebar.locator('text=Мои шаблоны')).toBeVisible();
    
    const templateContainer = sidebar.locator('.relative.group:has(button:has-text("Template To Delete"))');
    
    // 3. Наводим курсор, чтобы появилась кнопка удаления, и нажимаем ее
    await templateContainer.hover();
    const deleteBtn = templateContainer.locator('button[title="Удалить шаблон"]');
    await deleteBtn.click();

    // 4. Проверяем, что шаблон исчез (и секция "Мои шаблоны" возможно тоже, так как пуста)
    await expect(sidebar.locator('button:has-text("Template To Delete")')).toHaveCount(0);
  });
});
