import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Live-Wiki/);
    await expect(page.getByText('Explora el archivo vivo del universo')).toBeVisible();
  });

  test('search finds a character and navigates to it', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();
    
    // Focus explicitly to trigger any load-on-focus logic
    await searchInput.focus();

    // Fill search term
    await searchInput.fill('John');

    // Wait for results container to appear and not be hidden
    const resultsContainer = page.locator('#search-results');
    await resultsContainer.waitFor({ state: 'visible', timeout: 5000 });

    // Wait for search status to update (indicates search finished)
    const status = page.locator('[data-search-status]');
    await expect(status).not.toContainText('Cargando', { timeout: 5000 });
    await expect(status).not.toContainText('Escribe para buscar', { timeout: 5000 });
    
    // If this fails, we know the search returned 0 results or failed
    await expect(status).toContainText('resultado');
    
    // Look for specific result
    const resultLink = resultsContainer.locator('.search__result-link', { hasText: /^John Doe$/ });
    await expect(resultLink).toBeVisible();
    
    // Click and verify navigation
    await resultLink.click();
    await page.waitForURL(/.*\/characters\/john-doe/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('John Doe');
  });
});
