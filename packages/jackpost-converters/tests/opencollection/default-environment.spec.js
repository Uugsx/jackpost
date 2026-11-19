import { describe, it, expect } from '@jest/globals';
import { jackpostToOpenCollection } from '../../src/opencollection/jackpost-to-opencollection';
import { openCollectionToJackpost } from '../../src/opencollection/opencollection-to-jackpost';

const makeJackpostCollection = (presets) => ({
  name: 'My API',
  jackpostConfig: { name: 'My API', type: 'collection', ignore: [], presets },
  items: [],
  environments: [],
  root: {}
});

describe('presets.defaultEnvironment mapping between jackpost and opencollection', () => {
  it('maps jackpostConfig.presets.defaultEnvironment to extensions.jackpost.presets.defaultEnvironment', () => {
    const oc = jackpostToOpenCollection(
      makeJackpostCollection({ requestType: 'http', requestUrl: 'https://example.com', defaultEnvironment: 'prod' })
    );

    expect(oc.extensions.jackpost.presets.defaultEnvironment).toBe('prod');
  });

  it('reads defaultEnvironment back from opencollection into jackpostConfig.presets', () => {
    const jackpost = openCollectionToJackpost({
      opencollection: '1.0.0',
      info: { name: 'My API' },
      items: [],
      extensions: { jackpost: { presets: { defaultEnvironment: 'staging' } } }
    });

    expect(jackpost.jackpostConfig.presets.defaultEnvironment).toBe('staging');
  });

  it('round-trips defaultEnvironment through jackpost to opencollection and back', () => {
    const oc = jackpostToOpenCollection(makeJackpostCollection({ defaultEnvironment: 'prod' }));
    const back = openCollectionToJackpost(oc);

    expect(back.jackpostConfig.presets.defaultEnvironment).toBe('prod');
  });

  it('does not add a presets block when defaultEnvironment is absent', () => {
    const oc = jackpostToOpenCollection(makeJackpostCollection(undefined));

    expect(oc.extensions?.jackpost?.presets).toBeUndefined();
  });
});
