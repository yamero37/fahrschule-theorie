const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => localStorage.setItem('toldrive_demo', String(Date.now() + 3600000)));
  await page.goto('http://localhost:3000/technik/troc', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:/Users/tolga/fix_1_full.png', fullPage: true });

  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/tolga/fix_2_heck.png' });

  const frontBtn = page.locator('text=Front').first();
  await frontBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/tolga/fix_3_front.png' });

  const seiteBtn = page.locator('text=Seite').first();
  await seiteBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/tolga/fix_4_seite.png' });

  await browser.close();
})();
