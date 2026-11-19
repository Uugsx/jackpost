import path from 'path';
import { test } from '../../../playwright';
import { verifyInvalidFileIndicators } from './helpers';

test.describe('Invalid file indicator', () => {
  test('the collection and every folder above an invalid file show its count until it is fixed', async ({
    pageWithUserData: page,
    collectionFixturePath
  }) => {
    await test.step('.jp collection', async () => {
      await verifyInvalidFileIndicators(page, {
        collectionName: 'InvalidFileIndicatorJp',
        collectionPath: path.join(collectionFixturePath!, 'jp'),
        format: 'jp'
      });
    });

    await test.step('.yml collection', async () => {
      await verifyInvalidFileIndicators(page, {
        collectionName: 'InvalidFileIndicatorYml',
        collectionPath: path.join(collectionFixturePath!, 'yml'),
        format: 'yml'
      });
    });
  });
});
