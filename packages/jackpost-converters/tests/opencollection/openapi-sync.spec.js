import { describe, it, expect } from '@jest/globals';
import { jackpostToOpenCollection } from '../../src/opencollection/jackpost-to-opencollection';
import { openCollectionToJackpost } from '../../src/opencollection/opencollection-to-jackpost';

const syncConfig = {
  sourceUrl: 'https://petstore3.swagger.io/api/v3/openapi.json',
  groupBy: 'tags',
  lastSyncDate: '2026-08-13T10:00:00.000Z',
  specHash: 'd41d8cd98f00b204e9800998ecf8427e',
  autoCheck: false,
  autoCheckInterval: 15
};

describe('jackpostToOpenCollection (export): openapi sync config', () => {
  it('writes the sync config under extensions.jackpost.openapi', () => {
    const oc = jackpostToOpenCollection({
      name: 'Petstore',
      jackpostConfig: { openapi: [syncConfig] },
      items: []
    });
    expect(oc.extensions?.jackpost?.openapi).toEqual([syncConfig]);
  });

  it('writes nothing when the collection has no sync config', () => {
    const withoutKey = jackpostToOpenCollection({ name: 'API', jackpostConfig: {}, items: [] });
    const withEmptyList = jackpostToOpenCollection({ name: 'API', jackpostConfig: { openapi: [] }, items: [] });
    expect(withoutKey.extensions?.jackpost?.openapi).toBeUndefined();
    expect(withEmptyList.extensions?.jackpost?.openapi).toBeUndefined();
  });

  it('skips malformed entries and keeps the usable ones', () => {
    const oc = jackpostToOpenCollection({
      name: 'Petstore',
      jackpostConfig: { openapi: [null, 'https://example.com/openapi.json', syncConfig] },
      items: []
    });
    expect(oc.extensions.jackpost.openapi).toEqual([syncConfig]);
  });

  it('omits sync metadata that is absent and defaults the auto-check fields', () => {
    const oc = jackpostToOpenCollection({
      name: 'Petstore',
      jackpostConfig: { openapi: [{ sourceUrl: 'https://example.com/openapi.json', groupBy: 'path' }] },
      items: []
    });
    expect(oc.extensions.jackpost.openapi).toEqual([
      {
        sourceUrl: 'https://example.com/openapi.json',
        groupBy: 'path',
        autoCheck: true,
        autoCheckInterval: 5
      }
    ]);
  });
});

describe('openCollectionToJackpost (import): openapi sync config', () => {
  it('reads the sync config back, defaulting the auto-check fields', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'Petstore' },
      extensions: { jackpost: { openapi: [{ sourceUrl: 'https://example.com/openapi.json', groupBy: 'tags' }] } }
    });
    expect(jackpostConfig.openapi).toEqual([
      {
        sourceUrl: 'https://example.com/openapi.json',
        groupBy: 'tags',
        autoCheck: true,
        autoCheckInterval: 5
      }
    ]);
  });

  it('skips malformed entries and keeps the usable ones', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'Petstore' },
      extensions: { jackpost: { openapi: [null, 'https://example.com/openapi.json', syncConfig] } }
    });
    expect(jackpostConfig.openapi).toEqual([syncConfig]);
  });

  it('leaves the collection unlinked when the file carries no sync config', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'API' }
    });
    expect(jackpostConfig.openapi).toBeUndefined();
  });
});

describe('openapi sync config: export then import keeps it the same', () => {
  it('preserves the sync config across a round trip', () => {
    const oc = jackpostToOpenCollection({
      name: 'Petstore',
      jackpostConfig: { openapi: [syncConfig] },
      items: []
    });
    const { jackpostConfig } = openCollectionToJackpost(oc);
    expect(jackpostConfig.openapi).toEqual([syncConfig]);
  });
});

describe('openapi sync config settings', () => {
  it('carries authPlacement and requestNameSource through export and import', () => {
    const configWithSettings = { ...syncConfig, authPlacement: 'collection', requestNameSource: 'operationId' };
    const oc = jackpostToOpenCollection({ name: 'Petstore', jackpostConfig: { openapi: [configWithSettings] }, items: [] });

    expect(oc.extensions.jackpost.openapi).toEqual([configWithSettings]);
    expect(openCollectionToJackpost(oc).jackpostConfig.openapi).toEqual([configWithSettings]);
  });

  it('drops unsupported authPlacement and requestNameSource values on import', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'Petstore' },
      extensions: { jackpost: { openapi: [{ ...syncConfig, authPlacement: 'folder', requestNameSource: 'title' }] } }
    });

    expect(jackpostConfig.openapi).toEqual([syncConfig]);
  });
});
