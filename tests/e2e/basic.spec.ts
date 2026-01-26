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

    // Type search term slowly to ensure events fire
    await searchInput.pressSequentially('Mira', { delay: 100 });

    // Wait for search status to update (indicates search finished)
    const status = page.locator('[data-search-status]');
    await expect(status).not.toContainText('Cargando', { timeout: 10000 });
    await expect(status).not.toContainText('Escribe para buscar', { timeout: 10000 });
    
    // If this fails, we know the search returned 0 results or failed
    await expect(status).toContainText('resultado');
    
    // Wait for results to appear
    const resultsContainer = page.locator('#search-results');
    await expect(resultsContainer).not.toBeHidden();
    
    // Look for specific result
    const resultLink = resultsContainer.locator('.search__result-link', { hasText: 'Mira Lane' });
    await expect(resultLink).toBeVisible();
    
    // Click and verify navigation
    await resultLink.click();
    await expect(page).toHaveURL(/.*\/characters\/mira-lane/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mira Lane');
  });
});
