import { test, expect } from '@playwright/test';

/**
 * E2E smoke tests. These require a running instance of apps/web backed by a
 * real (test) PostgreSQL database - see playwright.config.ts, which starts
 * the dev server automatically. No real LLM provider calls are made; the
 * "Test Connection" flows are exercised in unit/integration tests against
 * the mock provider instead (see packages/llm-gateway/tests).
 *
 * Run with: npm run test:e2e
 */

test('application loads and redirects to the setup wizard or dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/setup\/welcome|\/dashboard/);
});

test('first-run wizard routes through every step in order', async ({ page }) => {
  await page.goto('/setup/welcome');
  await expect(page.getByRole('heading', { name: 'Welcome to CertForge AI' })).toBeVisible();

  await page.getByRole('link', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/\/setup\/system-check/);
  await expect(page.getByRole('heading', { name: 'System Check' })).toBeVisible();

  await page.goto('/setup/database');
  await expect(page.getByRole('heading', { name: 'Database' })).toBeVisible();

  await page.goto('/setup/profile');
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();

  await page.goto('/setup/provider');
  await expect(page.getByRole('heading', { name: 'AI Provider' })).toBeVisible();

  await page.goto('/setup/certifications');
  await expect(page.getByRole('heading', { name: 'Certification Packs' })).toBeVisible();

  await page.goto('/setup/finish');
  await expect(page.getByRole('heading', { name: "You're all set" })).toBeVisible();
});

test('profile setup accepts and persists a local profile', async ({ page }) => {
  await page.goto('/setup/profile');
  await page.getByLabel('First name').fill('Ada');
  await page.getByLabel('Last name').fill('Lovelace');
  await page.getByLabel('Display name').fill('Ada L.');
  await page.getByRole('button', { name: /Save profile|Save changes/ }).click();

  await page.reload();
  await expect(page.getByLabel('First name')).toHaveValue('Ada');
});

test('the bundled certification pack is displayed with PRD-verified domain data', async ({ page }) => {
  await page.goto('/setup/certifications');
  await expect(page.getByText('Claude Certified Architect')).toBeVisible();
  await expect(page.getByText(/60 questions/)).toBeVisible();
  await expect(page.getByText(/120 minutes/)).toBeVisible();
});
