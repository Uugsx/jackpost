import parseCollection from '../parseCollection';
import stringifyCollection from '../stringifyCollection';

const collectionRoot = { meta: null, request: null, docs: null };

describe('yml collection - presets.defaultEnvironment round-trip', () => {
  it('writes and reads back defaultEnvironment via extensions.jackpost.presets', () => {
    const jackpostConfig = {
      name: 'My API',
      type: 'collection',
      ignore: ['node_modules'],
      presets: { requestType: 'http', requestUrl: 'https://example.com', defaultEnvironment: 'prod' }
    };

    const yml = stringifyCollection(collectionRoot, jackpostConfig);
    expect(yml).toContain('defaultEnvironment: prod');

    const { jackpostConfig: parsed } = parseCollection(yml);
    expect(parsed.presets).toEqual({
      requestType: 'http',
      requestUrl: 'https://example.com',
      defaultEnvironment: 'prod'
    });
  });

  it('persists defaultEnvironment even when no request presets are set', () => {
    const jackpostConfig = {
      name: 'My API',
      type: 'collection',
      ignore: [],
      presets: { defaultEnvironment: 'staging' }
    };

    const yml = stringifyCollection(collectionRoot, jackpostConfig);
    expect(yml).toContain('defaultEnvironment: staging');

    const { jackpostConfig: parsed } = parseCollection(yml);
    expect(parsed.presets.defaultEnvironment).toBe('staging');
  });

  it('does not emit defaultEnvironment when it is not configured', () => {
    const jackpostConfig = { name: 'My API', type: 'collection', ignore: [] };

    const yml = stringifyCollection(collectionRoot, jackpostConfig);
    expect(yml).not.toContain('defaultEnvironment');

    const { jackpostConfig: parsed } = parseCollection(yml);
    expect(parsed.presets).toBeUndefined();
  });
});
