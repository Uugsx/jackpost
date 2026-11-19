import reducer, { jackpostConfigUpdateEvent, collectionLoadedFromTree } from 'providers/ReduxStore/slices/collections';

const COLLECTION_UID = 'col-1';

const makeState = (format) => ({
  collections: [
    {
      uid: COLLECTION_UID,
      pathname: '/coll',
      format,
      items: [],
      environments: [],
      jackpostConfig: format === 'yml' ? { opencollection: '1.0.0', name: 'demo' } : { version: '1', name: 'demo' }
    }
  ]
});

describe('collection format derivation from disk config', () => {
  it('jackpostConfigUpdateEvent flips format to yml when opencollection appears', () => {
    const state = reducer(
      makeState('jp'),
      jackpostConfigUpdateEvent({ collectionUid: COLLECTION_UID, jackpostConfig: { opencollection: '1.0.0', name: 'demo' } })
    );

    expect(state.collections[0].format).toBe('yml');
  });

  it('jackpostConfigUpdateEvent drops a stale yml format when the disk config is jp again', () => {
    // migrate-to-yml followed by a git revert: jackpost.json is back, format must follow
    const state = reducer(
      makeState('yml'),
      jackpostConfigUpdateEvent({ collectionUid: COLLECTION_UID, jackpostConfig: { version: '1', name: 'demo' } })
    );

    expect(state.collections[0].format).toBe('jp');
  });

  it('collectionLoadedFromTree derives format from the tree jackpostConfig', () => {
    const state = reducer(
      makeState('jp'),
      collectionLoadedFromTree({
        collectionUid: COLLECTION_UID,
        tree: { items: [], jackpostConfig: { opencollection: '1.0.0', name: 'demo' } }
      })
    );

    expect(state.collections[0].format).toBe('yml');
  });
});
