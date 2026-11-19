const jpToJsonV2 = require('../v2/src/jpToJson');
const jsonToJpV2 = require('../v2/src/jsonToJp');
const jpToEnvJsonV2 = require('../v2/src/envToJson');
const envJsonToJpV2 = require('../v2/src/jsonToEnv');
const dotenvToJson = require('../v2/src/dotenvToJson');

const collectionJpToJson = require('../v2/src/collectionJpToJson');
const jsonToCollectionJp = require('../v2/src/jsonToCollectionJp');
const { outdentString } = require('../v2/src/utils');

// Todo: remove V2 suffixes
// Changes will have to be made to the CLI and GUI

module.exports = {
  jpToJsonV2,
  jsonToJpV2,
  jpToEnvJsonV2,
  envJsonToJpV2,

  collectionJpToJson,
  jsonToCollectionJp,

  dotenvToJson,

  outdentString
};
