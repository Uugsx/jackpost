import { test, expect } from '../../../playwright';
import * as path from 'path';

test.describe('Import Corrupted Jackpost Collection - Should Fail', () => {
  test('Import Jackpost collection with invalid JSON structure should fail', async ({ page }) => {
    const jackpostFile = path.resolve(__dirname, 'fixtures', 'jackpost-malformed.json');

    await page.getByTestId('collections-header-add-menu').click();
    await page.locator('.tippy-box .dropdown-item').filter({ hasText: 'Import collection' }).click();

    // Wait for import collection modal to be ready
    const importModal = page.getByRole('dialog');
    await importModal.waitFor({ state: 'visible' });
    await expect(importModal.locator('.jackpost-modal-header-title')).toContainText('Import Collection');

    await page.setInputFiles('input[type="file"]', jackpostFile);

    const errorLocator = page.getByText(/Failed to parse the file|Unsupported collection format|Invalid|Error/).first();
    await expect(errorLocator).toBeVisible({ timeout: 10000 });

    // Cleanup: close any open modals
    await page.getByTestId('modal-close-button').click();
  });
});
