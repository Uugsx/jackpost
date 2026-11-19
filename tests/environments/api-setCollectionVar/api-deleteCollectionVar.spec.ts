import fs from 'fs';
import path from 'path';
import { test, expect, closeElectronApp } from '../../../playwright';
import { sendRequest, waitForReadyPage } from '../../utils/page';
import { buildCommonLocators } from '../../utils/page/locators';

const COLLECTION_FILE_ORIGINAL = `meta {
  name: collection
}

vars:pre-request {
  host: https://testbench-sanity.usejackpost.com
  existingCollVar: original-coll-value
}
`;

const restoreCollectionFixture = (collectionFixturePath: string) => {
  const collectionJp = path.join(collectionFixturePath, 'collection.jp');
  fs.writeFileSync(collectionJp, COLLECTION_FILE_ORIGINAL, 'utf8');
};

test.describe.serial('jp.deleteCollectionVar(name) - removes var from collection.jp', () => {
  test.afterEach(async ({ collectionFixturePath }) => {
    if (collectionFixturePath) {
      restoreCollectionFixture(collectionFixturePath);
    }
  });

  test('collection var deletion via script persists across restart', async ({
    pageWithUserData: page,
    collectionFixturePath,
    restartApp
  }) => {
    const collectionJpPath = path.join(collectionFixturePath!, 'collection.jp');
    const locators = buildCommonLocators(page);

    // Sanity: fixture starts with existingCollVar present.
    expect(fs.readFileSync(collectionJpPath, 'utf8')).toMatch(/existingCollVar:\s*original-coll-value/);

    await locators.sidebar.collection('collection').click();
    await page.getByText('api-deleteCollectionVar', { exact: true }).click();
    await sendRequest(page, 200);

    // Pre-restart: collection.jp no longer contains existingCollVar.
    await expect.poll(() => fs.readFileSync(collectionJpPath, 'utf8'), { timeout: 5000 })
      .not.toMatch(/existingCollVar/);

    // Pre-restart UI: the vars tab no longer lists existingCollVar.
    await locators.sidebar.collection('collection').click();
    await locators.paneTabs.collectionSettingsTab('vars').click();
    await expect(locators.environment.variableRowByName('existingCollVar')).toHaveCount(0);

    // Restart: the deletion survives.
    const newApp = await restartApp();
    const newPage = await waitForReadyPage(newApp);
    const newLocators = buildCommonLocators(newPage);

    await newLocators.sidebar.collection('collection').click();
    await newLocators.paneTabs.collectionSettingsTab('vars').click();
    await expect(newLocators.environment.variableRowByName('existingCollVar')).toHaveCount(0);

    expect(fs.readFileSync(collectionJpPath, 'utf8')).not.toMatch(/existingCollVar/);

    await closeElectronApp(newApp);
  });
});
