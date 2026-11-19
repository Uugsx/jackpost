const { parseRequestAndRedactBody, parseRequestViaWorker, DEFAULT_COLLECTION_FORMAT } = require('@jackpost/filestore');

/**
 * Parses a large JP request string by redacting body blocks, parsing the remainder,
 * and then reinserting extracted body content into the parsed structure.
 * @param {string} jpContent
 * @param {string} format - Collection format, defaults to 'jp'
 * @returns {Promise<any>} parsed request JSON
 */
async function parseLargeRequestWithRedaction(jpContent, format = DEFAULT_COLLECTION_FORMAT) {
  const { jpFileStringWithRedactedBody, extractedBodyContent } = parseRequestAndRedactBody(jpContent, { format });
  const parsedData = await parseRequestViaWorker(jpFileStringWithRedactedBody, { format });

  if (!parsedData.request) {
    parsedData.request = {};
  }
  if (!parsedData.request.body) {
    parsedData.request.body = {};
  }

  if (extractedBodyContent.json) {
    parsedData.request.body.json = extractedBodyContent.json;
  }
  if (extractedBodyContent.text) {
    parsedData.request.body.text = extractedBodyContent.text;
  }
  if (extractedBodyContent.xml) {
    parsedData.request.body.xml = extractedBodyContent.xml;
  }
  if (extractedBodyContent.sparql) {
    parsedData.request.body.sparql = extractedBodyContent.sparql;
  }
  if (extractedBodyContent.graphql) {
    if (!parsedData.request.body.graphql) {
      parsedData.request.body.graphql = {};
    }
    parsedData.request.body.graphql.query = extractedBodyContent.graphql;
  }

  return parsedData;
}

module.exports = { parseLargeRequestWithRedaction };
