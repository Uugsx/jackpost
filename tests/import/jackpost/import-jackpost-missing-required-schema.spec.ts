import { test, expect } from '../../../playwright';
import * as path from 'path';

test.describe('Import Jackpost Collection - Missing Required Schema Fields', () => {
  test('Import Jackpost collection missing required version field should fail', async ({ page }) => {
    const jackpostFile = path.resolve(__dirname, 'fixtures', 'jackpost-missing-required-fields.json');

    await page.getByTestId('collections-header-add-menu').click();
    await page.locator('.tippy-box .dropdown-item').filter({ hasText: 'Import collection' }).click();

    // Wait for import collection modal to be ready
    const importModal = page.getByRole('dialog');
    await importModal.waitFor({ state: 'visible' });
    await expect(importModal.locator('.jackpost-modal-header-title')).toContainText('Import Collection');

    await page.setInputFiles('input[type="file"]', jackpostFile);

    const errorMessage = page.getByText('Unsupported collection format').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Cleanup: close any open modals
    await page.getByTestId('modal-close-button').click();
  });
});
