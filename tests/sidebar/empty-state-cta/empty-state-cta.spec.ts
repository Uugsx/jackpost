import { test, expect } from '../../../playwright';
import { buildCommonLocators, closeAllCollections } from '../../utils/page';

test.describe.serial('Sidebar empty-state "+ Add request" CTA', () => {
  let locators: ReturnType<typeof buildCommonLocators>;

  test.beforeAll(async ({ pageWithUserData: page }) => {
    locators = buildCommonLocators(page);
  });

  test.afterAll(async ({ pageWithUserData: page }) => {
    await closeAllCollections(page);
  });

  const expandCollection = async (name: string) => {
    const collection = locators.sidebar.collection(name);
    await collection.waitFor({ state: 'visible' });
    await collection.click();
  };

  // Empty collection — CTA should appear

  test('should show CTA for an empty .jp collection', async ({ pageWithUserData: page }) => {
    await test.step('Expand empty-jp collection', async () => {
      await expandCollection('empty-jp');
    });

    await test.step('Verify CTA is visible at collection root', async () => {
      await expect(locators.sidebar.collectionScope('empty-jp').getByTestId('add-request-cta')).toBeVisible();
    });
  });

  test('should show CTA for an empty .yml collection', async ({ pageWithUserData: page }) => {
    await test.step('Expand empty-yml collection', async () => {
      await expandCollection('empty-yml');
    });

    await test.step('Verify CTA is visible at collection root', async () => {
      await expect(locators.sidebar.collectionScope('empty-yml').getByTestId('add-request-cta')).toBeVisible();
    });
  });

  // Collection containing only a .js script — CTA should still appear

  test('should show CTA for a .jp collection containing only a .js script', async ({ pageWithUserData: page }) => {
    await test.step('Expand jp-with-js collection', async () => {
      await expandCollection('jp-with-js');
    });

    await test.step('Verify CTA is visible at collection root', async () => {
      await expect(locators.sidebar.collectionScope('jp-with-js').getByTestId('add-request-cta')).toBeVisible();
    });
  });

  test('should show CTA for a .yml collection containing only a .js script', async ({ pageWithUserData: page }) => {
    await test.step('Expand yml-with-js collection', async () => {
      await expandCollection('yml-with-js');
    });

    await test.step('Verify CTA is visible at collection root', async () => {
      await expect(locators.sidebar.collectionScope('yml-with-js').getByTestId('add-request-cta')).toBeVisible();
    });
  });

  // Collection has user content — root CTA should be hidden

  test('should hide CTA when .jp collection contains a request', async ({ pageWithUserData: page }) => {
    await test.step('Expand jp-with-request collection', async () => {
      await expandCollection('jp-with-request');
      await expect(locators.sidebar.request('jp-echo')).toBeVisible();
    });

    await test.step('Verify CTA is not rendered at collection root', async () => {
      await expect(locators.sidebar.collectionScope('jp-with-request').getByTestId('add-request-cta')).toHaveCount(0);
    });
  });

  test('should hide CTA when .yml collection contains a request', async ({ pageWithUserData: page }) => {
    await test.step('Expand yml-with-request collection', async () => {
      await expandCollection('yml-with-request');
      await expect(locators.sidebar.request('yml-echo')).toBeVisible();
    });

    await test.step('Verify CTA is not rendered at collection root', async () => {
      await expect(locators.sidebar.collectionScope('yml-with-request').getByTestId('add-request-cta')).toHaveCount(0);
    });
  });

  test('should hide root CTA when .jp collection contains a folder', async ({ pageWithUserData: page }) => {
    await test.step('Expand jp-folder-with-js collection', async () => {
      await expandCollection('jp-folder-with-js');
      await expect(locators.sidebar.folder('jp-scripts')).toBeVisible();
    });

    await test.step('Verify CTA is not rendered at collection root', async () => {
      await expect(locators.sidebar.collectionScope('jp-folder-with-js').getByTestId('add-request-cta')).toHaveCount(0);
    });
  });

  test('should hide root CTA when .yml collection contains a folder', async ({ pageWithUserData: page }) => {
    await test.step('Expand yml-with-folder collection', async () => {
      await expandCollection('yml-with-folder');
      await expect(locators.sidebar.folder('yml-scripts')).toBeVisible();
    });

    await test.step('Verify CTA is not rendered at collection root', async () => {
      await expect(locators.sidebar.collectionScope('yml-with-folder').getByTestId('add-request-cta')).toHaveCount(0);
    });
  });

  // Folder containing only a .js script — folder CTA should appear

  test('should show folder CTA when a .jp folder contains only a .js script', async ({ pageWithUserData: page }) => {
    await test.step('Expand jp-folder-with-js collection and the jp-scripts folder', async () => {
      await expandCollection('jp-folder-with-js');
      const folder = locators.sidebar.folder('jp-scripts');
      await folder.waitFor({ state: 'visible' });
      await folder.click();
    });

    await test.step('Verify folder-level CTA is visible', async () => {
      await expect(locators.sidebar.collectionScope('jp-folder-with-js').getByTestId('add-request-cta-folder')).toBeVisible();
    });
  });

  test('should show folder CTA when a .yml folder contains only a .js script', async ({ pageWithUserData: page }) => {
    await test.step('Expand yml-with-folder collection and the yml-scripts folder', async () => {
      await expandCollection('yml-with-folder');
      const folder = locators.sidebar.folder('yml-scripts');
      await folder.waitFor({ state: 'visible' });
      await folder.click();
    });

    await test.step('Verify folder-level CTA is visible', async () => {
      await expect(locators.sidebar.collectionScope('yml-with-folder').getByTestId('add-request-cta-folder')).toBeVisible();
    });
  });
});
