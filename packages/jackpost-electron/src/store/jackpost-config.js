/**
 * This modules stores the configs loaded from jackpost.json
 */

const config = {};

// collectionUid is a hash based on the collection path
const getJackpostConfig = (collectionUid, collection) => {
  if (collection?.draft?.jackpostConfig) {
    return collection.draft.jackpostConfig;
  }
  return config[collectionUid] || {};
};

const setJackpostConfig = (collectionUid, jackpostConfig) => {
  config[collectionUid] = jackpostConfig;
};

const clearJackpostConfig = (collectionUid) => {
  delete config[collectionUid];
};

module.exports = {
  getJackpostConfig,
  setJackpostConfig,
  clearJackpostConfig
};
