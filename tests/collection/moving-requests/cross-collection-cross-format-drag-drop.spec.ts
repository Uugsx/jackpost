import { test, expect } from '../../../playwright';
import { closeAllCollections } from '../../utils/page';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Cross-Format Collection Drag and Drop', () => {
  test.afterEach(async ({ pageWithUserData: page }) => {
    await closeAllCollections(page);
  });

  test('Cross-format drag and drop should convert request between jp and yml', async ({
    pageWithUserData: page,
    collectionFixturePath
  }) => {
    const requestName = 'cross-format-request';

    // Both collections should already be loaded via init-user-data
    await expect(page.locator('#sidebar-collection-name').filter({ hasText: 'jp-collection' })).toBeVisible();
    await expect(page.locator('#sidebar-collection-name').filter({ hasText: 'yml-collection' })).toBeVisible();

    // Expand the jp collection and locate the request
    await page.locator('#sidebar-collection-name').filter({ hasText: 'jp-collection' }).click();
    const jpCollectionContainer = page.locator('[data-collection-id="jp-collection"]');
    const jpRequest = jpCollectionContainer.locator('.collection-item-name').filter({ hasText: requestName }).first();
    await expect(jpRequest).toBeVisible();

    // Drag the .jp request into the yml collection
    const ymlCollection = page.locator('.collection-name').filter({ hasText: 'yml-collection' });
    await jpRequest.dragTo(ymlCollection);

    // Verify the request appears in the yml collection (increase timeout for file watcher processing)
    const ymlCollectionContainer = page.locator('[data-collection-id="yml-collection"]');
    // The yml collection may need to be expanded after the drop
    const ymlCollectionItems = ymlCollectionContainer.locator('.collection-item-name').filter({ hasText: requestName });
    // Wait for file watcher to process the new file, then expand collection if needed
    await expect(async () => {
      if (await ymlCollectionItems.count() === 0) {
        await page.locator('#sidebar-collection-name').filter({ hasText: 'yml-collection' }).click();
      }
      await expect(ymlCollectionItems).toBeVisible();
    }).toPass({ timeout: 15000 });

    // Verify the request is no longer in the jp collection
    await page.locator('#sidebar-collection-name').filter({ hasText: 'jp-collection' }).click();
    await expect(jpCollectionContainer.locator('.collection-item-name').filter({ hasText: requestName })).toHaveCount(0);

    // Verify the file was converted to .yml format on disk
    const ymlFile = path.join(collectionFixturePath!, 'yml-collection', `${requestName}.yml`);
    const jpFile = path.join(collectionFixturePath!, 'yml-collection', `${requestName}.jp`);
    expect(fs.existsSync(ymlFile)).toBe(true);
    expect(fs.existsSync(jpFile)).toBe(false);
  });
});
