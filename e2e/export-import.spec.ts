import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function dragShapeToCanvas(page: Page, shapeName: string, x: number = 300, y: number = 200) {
  const sidebar = page.locator('.w-64');
  const shapeButton = sidebar.locator(`button:has-text("${shapeName}")`);
  const canvas = page.locator('.react-flow');
  
  await shapeButton.dragTo(canvas, {
    targetPosition: { x, y }
  });
}

test.describe('Функции экспорта', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
    
    // Добавим узлы для экспорта
    await dragShapeToCanvas(page, 'Прямоугольник', 200, 150);
    await dragShapeToCanvas(page, 'Ромб', 400, 150);
  });

  test('меню экспорта показывает все варианты', async ({ page }) => {
    await page.locator('text=Экспорт').click();
    
    await expect(page.locator('[role="menuitem"]:has-text("PNG")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("SVG")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("JSON")')).toBeVisible();
  });

  test('экспорт в JSON создает валидный файл', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.locator('text=Экспорт').click();
    await page.locator('[role="menuitem"]:has-text("JSON")').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('diagram.json');
    
    const downloadPath = path.join('test-results', 'diagram.json');
    await download.saveAs(downloadPath);
    
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));
    expect(content.nodes).toBeDefined();
    expect(content.edges).toBeDefined();
    expect(content.nodes.length).toBe(2);
  });

  test('экспорт в PNG запускает скачивание', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.locator('text=Экспорт').click();
    await page.locator('[role="menuitem"]:has-text("PNG")').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('diagram.png');
  });

  test('экспорт в SVG запускает скачивание', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.locator('text=Экспорт').click();
    await page.locator('[role="menuitem"]:has-text("SVG")').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('diagram.svg');
  });
});

test.describe('Функции импорта', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('кнопка импорта видна', async ({ page }) => {
    await expect(page.locator('text=Импорт')).toBeVisible();
  });

  test('можно импортировать JSON диаграмму', async ({ page }) => {
    const testDiagram = {
      nodes: [
        {
          id: 'test-1',
          type: 'rectangle',
          position: { x: 100, y: 100 },
          data: {
            label: 'Imported Node',
            width: 120,
            height: 60,
            backgroundColor: '#1e1e3f',
            borderColor: '#818cf8',
            borderWidth: 2,
            textColor: '#ffffff',
            fontSize: 14
          }
        }
      ],
      edges: []
    };
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('text=Импорт').click();
    const fileChooser = await fileChooserPromise;
    
    const tempPath = path.join('test-results', 'import-test.json');
    fs.writeFileSync(tempPath, JSON.stringify(testDiagram));
    await fileChooser.setFiles(tempPath);
    
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
    await expect(page.locator('text=Imported Node')).toBeVisible();
  });
});
