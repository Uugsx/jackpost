import { JackpostError } from 'utils/common/error';
import { validateSchema, transformItemsInCollection, updateUidsInCollection, hydrateSeqInCollection } from './common';
import { transformExampleStatusInCollection } from '@jackpost/common';

const stripExportMetadata = (collection) => {
  delete collection.exportedAt;
  delete collection.exportedUsing;
  return collection;
};

export const processJackpostCollection = async (jsonData) => {
  try {
    let collection = stripExportMetadata(jsonData);
    collection = hydrateSeqInCollection(collection);
    collection = updateUidsInCollection(collection);
    collection = transformItemsInCollection(collection);
    collection = transformExampleStatusInCollection(collection);
    await validateSchema(collection);
    return collection;
  } catch (err) {
    console.error('Error processing Jackpost collection:', err);
    throw new JackpostError('Import collection failed');
  }
};

export const isJackpostCollection = (data) => {
  // Check for Jackpost collection format
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  // Must have a version field that is a non-empty string
  if (typeof data.version !== 'string' || !data.version.trim()) {
    return false;
  }

  // Must have a name field that is a non-empty string
  if (typeof data.name !== 'string' || !data.name.trim()) {
    return false;
  }

  // Must have an items array
  if (!Array.isArray(data.items)) {
    return false;
  }

  return true;
};
