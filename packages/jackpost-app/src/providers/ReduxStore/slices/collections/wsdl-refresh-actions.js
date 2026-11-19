import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import path from 'utils/common/path';
import { itemSchema } from '@jackpost/schema';
import { findCollectionByUid, transformRequestToSaveToFilesystem } from 'utils/collections';
import { uuid } from 'utils/common';
import { sanitizeName } from 'utils/common/regex';
import { resolveRequestFilename } from 'utils/common/platform';
import { fetchWsdlFromUrl, convertWsdlToJackpost, getWsdlMockOperations } from 'utils/importers/wsdl-collection';
import { flattenRequests, flattenFolders, mergeXmlValues } from 'utils/wsdl-refresh';

const FIRST_REQUEST_NAME = 'Request 1';

/**
 * Re-downloads the collection's WSDL and updates its requests.
 * mode 'keep'     — regenerate XML but keep values the user already typed (SoapUI: "Keep existing values")
 * mode 'recreate' — replace request bodies with freshly generated samples (also repairs broken XML)
 * Operations that are new in the WSDL are added; operations that disappeared are only reported.
 * Resolves with { updated, added, removed, skipped }.
 */
export const refreshWsdlCollection = (collectionUid, { mode = 'keep' } = {}) => async (dispatch, getState) => {
  const collection = findCollectionByUid(getState().collections.collections, collectionUid);
  if (!collection) throw new Error('Collection not found');

  const sourceUrl = get(collection, 'jackpostConfig.wsdl.sourceUrl');
  if (!sourceUrl) throw new Error('This collection was not imported from a WSDL URL');

  const wsdlText = await fetchWsdlFromUrl(sourceUrl);
  if (!wsdlText) throw new Error('The source URL no longer returns a WSDL document');
  const freshResult = await convertWsdlToJackpost(wsdlText, sourceUrl);
  const fresh = (freshResult && freshResult.collection) || freshResult;

  const { ipcRenderer } = window;
  const existing = new Map(flattenRequests(collection.items).map((r) => [r.key, r.item]));
  const folders = new Map(flattenFolders(collection.items).map((f) => [f.key, f.item]));
  const freshRequests = flattenRequests(fresh.items);
  const freshKeys = new Set(freshRequests.map((r) => r.key));

  const result = { updated: 0, added: 0, removed: 0, skipped: 0 };

  const updateExisting = async (current, freshRequest, freshXml) => {
    const base = cloneDeep(current);
    const oldXml = get(base, 'draft.request.body.xml', get(base, 'request.body.xml', ''));
    base.draft = null;
    const itemToSave = transformRequestToSaveToFilesystem(base);
    itemToSave.request.body = {
      ...itemToSave.request.body,
      mode: 'xml',
      xml: mode === 'keep' ? mergeXmlValues(oldXml, freshXml) : freshXml
    };
    itemToSave.request.url = freshRequest.url || itemToSave.request.url;
    const soapAction = (freshRequest.headers || []).find((h) => h.name === 'SOAPAction');
    const headers = itemToSave.request.headers || [];
    const existingAction = headers.find((h) => h.name === 'SOAPAction');
    if (soapAction && existingAction) {
      existingAction.value = soapAction.value;
    } else if (soapAction) {
      headers.push({ ...soapAction, uid: uuid() });
    }
    itemToSave.request.headers = headers;

    const validated = await itemSchema.validate(itemToSave);
    await ipcRenderer.invoke('renderer:save-request', current.pathname, validated, collection.format);
    result.updated++;
  };

  for (const { key, folderKey, item: freshItem } of freshRequests) {
    const freshRequest = freshItem.request || {};
    const freshXml = get(freshRequest, 'body.xml', '');
    const current = existing.get(key);

    if (current) {
      await updateExisting(current, freshRequest, freshXml);
      continue;
    }

    const folder = folderKey ? folders.get(folderKey) : null;
    if (folderKey && !folder) {
      result.skipped++;
      continue;
    }
    const parentPath = folder ? folder.pathname : collection.pathname;
    const siblings = folder ? folder.items : collection.items;
    const newItem = {
      uid: uuid(),
      type: 'http-request',
      name: freshItem.name,
      filename: sanitizeName(freshItem.name),
      seq: (siblings || []).length + 1,
      request: cloneDeep(freshRequest),
      settings: cloneDeep(freshItem.settings || {})
    };
    const fullName = path.join(parentPath, resolveRequestFilename(newItem.filename, collection.format));
    await ipcRenderer.invoke('renderer:new-request', fullName, newItem);
    result.added++;
  }

  const freshByKey = new Map(freshRequests.map((r) => [r.key, r.item]));
  const freshFolderKeys = new Set(flattenFolders(fresh.items).map((f) => f.key));
  for (const [key, current] of existing) {
    if (freshKeys.has(key)) continue;
    const entry = flattenRequests(collection.items).find((r) => r.item === current);
    const template = entry && freshByKey.get(`${entry.folderKey}/${FIRST_REQUEST_NAME}`);
    if (template && freshFolderKeys.has(entry.folderKey)) {
      await updateExisting(current, template.request || {}, get(template, 'request.body.xml', ''));
    } else {
      result.removed++;
    }
  }

  return result;
};

export const WSDL_MOCK_DEFAULT_PORT = 8089;

/** Starts a local SOAP mock (127.0.0.1) answering every WSDL operation with a generated sample response. */
export const startWsdlMock = (collectionUid, port = WSDL_MOCK_DEFAULT_PORT) => async (dispatch, getState) => {
  const collection = findCollectionByUid(getState().collections.collections, collectionUid);
  const sourceUrl = get(collection, 'jackpostConfig.wsdl.sourceUrl');
  if (!sourceUrl) throw new Error('This collection was not imported from a WSDL URL');
  const wsdlText = await fetchWsdlFromUrl(sourceUrl);
  if (!wsdlText) throw new Error('The source URL no longer returns a WSDL document');
  const operations = await getWsdlMockOperations(wsdlText, sourceUrl);
  const res = await window.ipcRenderer.invoke('renderer:wsdl-mock-start', { port, operations });
  return { ...res, url: `http://127.0.0.1:${res.port}/` };
};

export const stopWsdlMock = (port = WSDL_MOCK_DEFAULT_PORT) => () => window.ipcRenderer.invoke('renderer:wsdl-mock-stop', port);

/** SoapUI "Recreates a default request from the schema": replaces the body of one request with a fresh sample (as a draft). */
export const recreateWsdlRequest = (collectionUid, itemUid, { keep = false } = {}) => async (dispatch, getState) => {
  const collection = findCollectionByUid(getState().collections.collections, collectionUid);
  if (!collection) throw new Error('Collection not found');
  const sourceUrl = get(collection, 'jackpostConfig.wsdl.sourceUrl');
  if (!sourceUrl) throw new Error('This collection was not imported from a WSDL URL');
  const entry = flattenRequests(collection.items).find((r) => r.item.uid === itemUid);
  if (!entry) throw new Error('Request not found');
  const wsdlText = await fetchWsdlFromUrl(sourceUrl);
  if (!wsdlText) throw new Error('The source URL no longer returns a WSDL document');
  const freshResult = await convertWsdlToJackpost(wsdlText, sourceUrl);
  const fresh = (freshResult && freshResult.collection) || freshResult;
  const freshRequests = flattenRequests(fresh.items);
  const match = freshRequests.find((r) => r.key === entry.key)
    || freshRequests.find((r) => r.key === `${entry.folderKey}/${FIRST_REQUEST_NAME}`);
  if (!match) throw new Error('Operation no longer exists in the WSDL');
  const { updateRequestBody, updateRequestBodyMode } = await import('./index');
  dispatch(updateRequestBodyMode({ itemUid, collectionUid, mode: 'xml' }));
  const freshXml = get(match.item, 'request.body.xml', '');
  const oldXml = get(entry.item, 'draft.request.body.xml', get(entry.item, 'request.body.xml', ''));
  dispatch(updateRequestBody({ content: keep ? mergeXmlValues(oldXml, freshXml) : freshXml, itemUid, collectionUid }));
  return true;
};
