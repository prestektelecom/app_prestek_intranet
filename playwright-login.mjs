import { test, expect } from '@playwright/test';

test('login com credenciais válidas', async ({ page }) => {
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
  console.log('URL inicial:', page.url());

  // Preencher email
  await page.fill('input[name=username]', 'marciofelix@prestek.com.br');
  console.log('Email preenchido');

  // Preencher senha
  await page.fill('input[name=password]', 'GVM!cpr*kvj@pdj9epx');
  console.log('Senha preenchida');

  // Clicar em Entrar
  await page.click('button[type=submit].neural-btn');
  console.log('Botão entrar clicado');

  // Esperar navegação
  await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {
    console.log('Não redirecionou para dashboard, URL atual:', page.url());
  });

  // Aguardar carregamento
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  const title = await page.title();
  console.log('URL após login:', currentUrl);
  console.log('Título após login:', title);

  // Verificar se carregou o dashboard ou alguma tela pós-login
  const hasDashboard = await page.locator('text=Dashboard').count() > 0;
  const hasSidebar = await page.locator('text=Sidebar').count() > 0;
  const hasUsuario = await page.locator('text=marciofelix').count() > 0;
  
  console.log('Tem Dashboard:', hasDashboard);
  console.log('Tem Sidebar:', hasSidebar);
  console.log('Tem nome do usuário:', hasUsuario);

  // Screenshot pós-login
  await page.screenshot({ path: 'F:/tmp_prestek_after_login.png', fullPage: true });
  console.log('Screenshot salvo: F:/tmp_prestek_after_login.png');
});
