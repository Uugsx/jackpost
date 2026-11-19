import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import collectionsReducer, { updateCollectionRequestScript, updateCollectionProtobuf } from 'providers/ReduxStore/slices/collections';
import useProtoFileManagement from './index';

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mock-uid'
}));

jest.mock('@jackpost/schema', () => ({
  collectionSchema: { validate: () => Promise.resolve() },
  environmentSchema: { validate: () => Promise.resolve() },
  itemSchema: { validate: () => Promise.resolve() }
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

jest.mock('utils/network/index', () => ({
  loadGrpcMethodsFromProtoFile: jest.fn()
}));

const COLLECTION_UID = 'col-1';
const COLLECTION_PATH = '/tmp/collection-1';
const SCRIPT = 'jp.setVar("x", 1);';
const EXISTING_PROTO = { path: 'protos/existing.proto', type: 'file', exists: true };
const EXISTING_IMPORT_PATH = { path: 'protos', enabled: true, exists: true };

const createStore = () => configureStore({
  reducer: { collections: collectionsReducer },
  preloadedState: {
    collections: {
      collections: [{
        uid: COLLECTION_UID,
        pathname: COLLECTION_PATH,
        format: 'yml',
        root: { request: { script: { req: '', res: '' } } },
        jackpostConfig: {
          protobuf: { protoFiles: [EXISTING_PROTO], importPaths: [EXISTING_IMPORT_PATH] }
        },
        items: []
      }]
    }
  }
});

const getCollection = (store) => store.getState().collections.collections[0];

const createDraftWithScript = (store) => {
  store.dispatch(updateCollectionRequestScript({ collectionUid: COLLECTION_UID, script: SCRIPT }));
};

const renderProtoHook = (store) => renderHook(() => useProtoFileManagement(getCollection(store)), {
  wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
});

let writtenProtobuf;
let writeError;

beforeEach(() => {
  writtenProtobuf = null;
  writeError = null;
  window.ipcRenderer = {
    invoke: jest.fn(async (channel, jackpostConfig) => {
      if (channel === 'renderer:update-jackpost-config') {
        if (writeError) throw writeError;
        writtenProtobuf = jackpostConfig.protobuf;
      }
    })
  };
});

describe('useProtoFileManagement — persisting protobuf config from a request', () => {
  it('mirrors the added proto file into the draft and preserves the draft\'s unsaved script', async () => {
    const store = createStore();
    createDraftWithScript(store);
    const { result } = renderProtoHook(store);

    await act(async () => {
      await result.current.addProtoFileFromRequest(`${COLLECTION_PATH}/protos/new.proto`);
    });

    const { draft } = getCollection(store);
    expect(writtenProtobuf.protoFiles).toEqual([EXISTING_PROTO, { path: 'protos/new.proto', type: 'file' }]);
    expect(draft.jackpostConfig.protobuf).toEqual(writtenProtobuf);
    expect(draft.root.request.script.req).toBe(SCRIPT);
  });

  it('mirrors the toggled import path into the draft and preserves the draft\'s unsaved script', async () => {
    const store = createStore();
    createDraftWithScript(store);
    const { result } = renderProtoHook(store);

    await act(async () => {
      await result.current.toggleImportPathFromRequest(0);
    });

    const { draft } = getCollection(store);
    expect(writtenProtobuf.importPaths).toEqual([{ ...EXISTING_IMPORT_PATH, enabled: false }]);
    expect(draft.jackpostConfig.protobuf).toEqual(writtenProtobuf);
    expect(draft.root.request.script.req).toBe(SCRIPT);
  });

  it('writes to disk without creating a draft when the collection has no unsaved changes', async () => {
    const store = createStore();
    const { result } = renderProtoHook(store);

    await act(async () => {
      await result.current.addProtoFileFromRequest(`${COLLECTION_PATH}/protos/new.proto`);
    });

    expect(writtenProtobuf.protoFiles).toEqual([EXISTING_PROTO, { path: 'protos/new.proto', type: 'file' }]);
    expect(getCollection(store).draft).toBeUndefined();
  });

  it('preserves a file added from the settings tab draft and does not duplicate it on consecutive adds', async () => {
    const store = createStore();
    const settingsTabProto = { path: 'protos/from-settings.proto', type: 'file' };
    store.dispatch(updateCollectionProtobuf({
      collectionUid: COLLECTION_UID,
      protobuf: { protoFiles: [EXISTING_PROTO, settingsTabProto], importPaths: [EXISTING_IMPORT_PATH] }
    }));
    const { result, rerender } = renderProtoHook(store);

    await act(async () => {
      await result.current.addProtoFileFromRequest(`${COLLECTION_PATH}/protos/first.proto`);
    });
    rerender();
    await act(async () => {
      await result.current.addProtoFileFromRequest(`${COLLECTION_PATH}/protos/second.proto`);
    });
    rerender();
    let outcome;
    await act(async () => {
      outcome = await result.current.addProtoFileFromRequest(`${COLLECTION_PATH}/protos/first.proto`);
    });

    const expectedProtoFiles = [
      EXISTING_PROTO,
      settingsTabProto,
      { path: 'protos/first.proto', type: 'file' },
      { path: 'protos/second.proto', type: 'file' }
    ];
    expect(outcome).toEqual({ success: true, relativePath: 'protos/first.proto', alreadyExists: true });
    expect(writtenProtobuf.protoFiles).toEqual(expectedProtoFiles);
    expect(getCollection(store).draft.jackpostConfig.protobuf.protoFiles).toEqual(expectedProtoFiles);
  });

  it('leaves the draft untouched when the disk write fails', async () => {
    const store = createStore();
    createDraftWithScript(store);
    const { result } = renderProtoHook(store);
    writeError = new Error('disk full');

    let outcome;
    await act(async () => {
      outcome = await result.current.addProtoFileFromRequest(`${COLLECTION_PATH}/protos/new.proto`);
    });

    expect(outcome).toEqual({ success: false, error: writeError });
    expect(writtenProtobuf).toBeNull();
    const { draft } = getCollection(store);
    expect(draft.jackpostConfig).toBeUndefined();
    expect(draft.root.request.script.req).toBe(SCRIPT);
  });
});
