import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
  console.log('TITLE:', await page.title());
  console.log('URL:', page.url());
  
  const hasEntrar = await page.locator('text=Entrar').count();
  const hasEmail = await page.locator('input[name=username]').count();
  const hasPassword = await page.locator('input[name=password]').count();
  const hasPrestek = await page.locator('text=Prestek').count();
  
  console.log('Has Entrar:', hasEntrar > 0);
  console.log('Has email field:', hasEmail > 0);
  console.log('Has password field:', hasPassword > 0);
  console.log('Has Prestek:', hasPrestek > 0);
  
  await page.screenshot({ path: 'F:/tmp_prestek_login.png', fullPage: true });
  console.log('Screenshot: F:/tmp_prestek_login.png');
});
