import fs from 'fs';
import path from 'path';
import { test, expect } from '../../../playwright';
import { sendRequest, setSandboxMode } from '../../utils/page';
import { buildCommonLocators } from '../../utils/page/locators';

test.describe('jp.setEnvVar(name, value, { persist: true }) - legacy arg', () => {
  test('legacy persist flag is silently ignored and the var persists in both safe and developer mode', async ({
    pageWithUserData: page,
    collectionFixturePath
  }) => {
    const stageJpPath = path.join(collectionFixturePath!, 'environments', 'Stage.jp');
    const stageOriginal = fs.readFileSync(stageJpPath, 'utf8');
    const locators = buildCommonLocators(page);

    const runAndVerify = async () => {
      await locators.sidebar.collection('collection').click();
      // Substring `hasText` would also match `api-setEnvVar-with-persist-typed`.
      await locators.sidebar.collectionsContainer()
        .getByText('api-setEnvVar-with-persist', { exact: true })
        .click();

      await locators.environment.selector().click();
      await expect(locators.environment.listOption('Stage')).toBeVisible();
      await locators.environment.listOption('Stage').click();
      await expect(locators.environment.currentEnvironment()).toContainText('Stage');

      await sendRequest(page, 200);

      await expect
        .poll(() => fs.readFileSync(stageJpPath, 'utf8'), { timeout: 5000 })
        .toMatch(/legacy_persist_var:\s*from-legacy-flag/);
    };

    await test.step('safe mode (quickjs)', async () => {
      await setSandboxMode(page, 'collection', 'safe');
      await runAndVerify();
    });

    // Reset so the developer-mode pass can't trivially match the safe-mode write.
    fs.writeFileSync(stageJpPath, stageOriginal, 'utf8');

    await test.step('developer mode (nodevm)', async () => {
      await setSandboxMode(page, 'collection', 'developer');
      await runAndVerify();
    });
  });
});
