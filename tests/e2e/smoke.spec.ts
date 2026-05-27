import { expect, test } from '@playwright/test';

test('landing page renders and exposes auth navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: /ingresar|login|iniciar/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /crear|registro|comenzar|gratis/i }).first()).toBeVisible();
});

test('login page renders the email flow', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('textbox', { name: /correo|email/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /ingresar|continuar|iniciar/i }).first()).toBeVisible();
});

test('public cards app renders for customer-facing routes', async ({ page }) => {
  const cardsURL = process.env.PLAYWRIGHT_CARDS_URL ?? 'http://127.0.0.1:3001';
  await page.goto(process.env.PLAYWRIGHT_CHECKIN_URL ?? cardsURL);

  await expect(page.getByText(/clientes finales|tarjeta|sellio/i).first()).toBeVisible();
});
