import reducer, { updateSoapEndpoints } from 'providers/ReduxStore/slices/collections';

const makeState = (collection) => ({ collections: [{ uid: 'c1', jackpostConfig: {}, ...collection }] });

describe('updateSoapEndpoints', () => {
  it('stores the list in the collection config', () => {
    const state = reducer(makeState(), updateSoapEndpoints({ collectionUid: 'c1', endpoints: ['http://a'] }));
    expect(state.collections[0].jackpostConfig.soapEndpoints).toEqual(['http://a']);
  });

  it('keeps an open config draft in sync', () => {
    const state = reducer(makeState({ draft: { jackpostConfig: {} } }), updateSoapEndpoints({ collectionUid: 'c1', endpoints: ['http://a'] }));
    expect(state.collections[0].draft.jackpostConfig.soapEndpoints).toEqual(['http://a']);
  });

  it('removes the key when the list becomes empty', () => {
    const state = reducer(makeState({ jackpostConfig: { soapEndpoints: ['http://a'] } }), updateSoapEndpoints({ collectionUid: 'c1', endpoints: [] }));
    expect(state.collections[0].jackpostConfig.soapEndpoints).toBeUndefined();
  });
});
