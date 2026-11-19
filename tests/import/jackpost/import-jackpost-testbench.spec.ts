import { test } from '../../../playwright';
import * as path from 'path';
import { closeAllCollections, importCollection } from '../../utils/page';

test.describe('Import Jackpost Testbench Collection', () => {
  test.afterAll(async ({ page }) => {
    await closeAllCollections(page);
  });

  test('Import Jackpost Testbench collection successfully', async ({ page, createTmpDir }) => {
    const jackpostFile = path.resolve(__dirname, 'fixtures', 'jackpost-testbench.json');

    await importCollection(page, jackpostFile, await createTmpDir('jackpost-testbench-test'), {
      expectedCollectionName: 'jackpost-testbench'
    });
  });
});
