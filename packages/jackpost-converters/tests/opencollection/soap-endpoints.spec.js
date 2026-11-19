import { describe, it, expect } from '@jest/globals';
import { jackpostToOpenCollection } from '../../src/opencollection/jackpost-to-opencollection';
import { openCollectionToJackpost } from '../../src/opencollection/opencollection-to-jackpost';

describe('soapEndpoints: OpenCollection conversion', () => {
  it('survives export then import', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: { soapEndpoints: ['http://a/x', 'http://b/x'] }, items: [] });
    const { jackpostConfig } = openCollectionToJackpost(oc);
    expect(jackpostConfig.soapEndpoints).toEqual(['http://a/x', 'http://b/x']);
  });

  it('stays unset when the collection has none', () => {
    const oc = jackpostToOpenCollection({ name: 'API', jackpostConfig: {}, items: [] });
    expect(openCollectionToJackpost(oc).jackpostConfig.soapEndpoints).toBeUndefined();
  });
});
