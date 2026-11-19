import { describe, it, expect } from '@jest/globals';
import { jackpostToOpenCollection } from '../../src/opencollection/jackpost-to-opencollection';
import { openCollectionToJackpost } from '../../src/opencollection/opencollection-to-jackpost';

describe('openCollectionToJackpost (import): keeps the collection version', () => {
  it('keeps the version as-is when importing', () => {
    const { jackpostConfig } = openCollectionToJackpost({ opencollection: '1.0.0', info: { name: 'API', version: 'v2.3.4' } });
    expect(jackpostConfig.version).toBe('v2.3.4');
  });

  it('turns a number version into text (2 becomes "2")', () => {
    const { jackpostConfig } = openCollectionToJackpost({ opencollection: '1.0.0', info: { name: 'API', version: 2 } });
    expect(jackpostConfig.version).toBe('2');
  });

  it('has no version when the imported file has none', () => {
    const { jackpostConfig } = openCollectionToJackpost({ opencollection: '1.0.0', info: { name: 'API' } });
    expect(jackpostConfig.version).toBeUndefined();
  });
});

describe('jackpostToOpenCollection (export): writes the collection version', () => {
  it('uses the agnostic version for a jp collection', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: { version: 'v2.3.4' }, items: [] });
    expect(oc.info.version).toBe('v2.3.4');
  });

  it('uses the agnostic version for a yml collection', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: { opencollection: '1.0.0', version: 'v9.9' }, items: [] });
    expect(oc.info.version).toBe('v9.9');
  });

  it('writes no version when the collection has none', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: {}, items: [] });
    expect(oc.info.version).toBeUndefined();
  });
});

describe('collection version: export then import keeps it the same', () => {
  it('keeps the same version after exporting and importing again', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: { version: '1.2.3-beta' }, items: [] });
    const { jackpostConfig } = openCollectionToJackpost(oc);
    expect(jackpostConfig.version).toBe('1.2.3-beta');
  });
});
