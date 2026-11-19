import { describe, it, expect } from '@jest/globals';
import { jackpostToOpenCollection } from '../../src/opencollection/jackpost-to-opencollection';
import { openCollectionToJackpost } from '../../src/opencollection/opencollection-to-jackpost';

describe('jackpostToOpenCollection (export): scripts.flow', () => {
  it('writes flow: sequential under extensions.jackpost.scripts', () => {
    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: { scripts: { flow: 'sequential' } },
      items: []
    });
    expect(oc.extensions?.jackpost?.scripts?.flow).toBe('sequential');
  });

  it('writes flow: sandwich under extensions.jackpost.scripts', () => {
    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: { scripts: { flow: 'sandwich' } },
      items: []
    });
    expect(oc.extensions?.jackpost?.scripts?.flow).toBe('sandwich');
  });

  it('writes nothing when the collection has no flow', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: {}, items: [] });
    expect(oc.extensions?.jackpost?.scripts).toBeUndefined();
  });

  it('drops an unrecognized flow value', () => {
    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: { scripts: { flow: 'parallel' } },
      items: []
    });
    expect(oc.extensions?.jackpost?.scripts).toBeUndefined();
  });
});

describe('openCollectionToJackpost (import): scripts.flow', () => {
  it('reads flow: sequential from extensions.jackpost.scripts', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'API' },
      extensions: { jackpost: { scripts: { flow: 'sequential' } } }
    });
    expect(jackpostConfig.scripts?.flow).toBe('sequential');
  });

  it('ignores an unrecognized flow value', () => {
    const { jackpostConfig } = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'API' },
      extensions: { jackpost: { scripts: { flow: 'parallel' } } }
    });
    expect(jackpostConfig.scripts).toBeUndefined();
  });
});

describe('scripts.flow: export then import keeps it the same', () => {
  it('preserves flow across a round trip', () => {
    const oc = jackpostToOpenCollection({
      name: 'API',
      jackpostConfig: { scripts: { flow: 'sequential' } },
      items: []
    });
    const { jackpostConfig } = openCollectionToJackpost(oc);
    expect(jackpostConfig.scripts?.flow).toBe('sequential');
  });
});
