import { JackpostError } from 'utils/common/error';
import { formatXml } from 'utils/xml-tools';
import { wsdlToJackpost, wsdlToMockOperations } from '@jackpost/converters';

const isWSDLCollection = (data) => {
  // Check if data is a string (WSDL content)
  if (typeof data !== 'string') {
    return false;
  }

  // Check for WSDL-specific XML elements
  const wsdlIndicators = [
    'wsdl:definitions',
    'definitions',
    'wsdl:types',
    'wsdl:message',
    'wsdl:portType',
    'wsdl:binding',
    'wsdl:service'
  ];

  // Check if the content contains WSDL namespace or elements
  const hasWSDLNamespace = data.includes('xmlns:wsdl=')
    || data.includes('xmlns="http://schemas.xmlsoap.org/wsdl/"')
    || data.includes('xmlns="http://www.w3.org/2001/XMLSchema"');

  const hasWSDLElements = wsdlIndicators.some((indicator) => data.includes(indicator));

  return hasWSDLNamespace || hasWSDLElements;
};

const getWsdlImportOptions = (filePath) => {
  if (!filePath) {
    return {};
  }
  return {
    uri: filePath,
    resolve: (baseUri, ref) => window.ipcRenderer.invoke('renderer:resolve-wsdl-schema-ref', baseUri, ref)
  };
};

const prettifyBodies = (items = []) => {
  items.forEach((it) => {
    const body = it.request && it.request.body;
    if (body && typeof body.xml === 'string') body.xml = formatXml(body.xml);
    if (Array.isArray(it.items)) prettifyBodies(it.items);
  });
};

export const convertWsdlToJackpost = async (data, filePath) => {
  try {
    const result = await wsdlToJackpost(data, getWsdlImportOptions(filePath));
    prettifyBodies(result && result.collection ? result.collection.items : result && result.items);
    return result;
  } catch (err) {
    console.error('Error converting WSDL to Jackpost:', err);
    throw new JackpostError(err.message);
  }
};

export const getWsdlMockOperations = async (data, filePath) => {
  try {
    return await wsdlToMockOperations(data, getWsdlImportOptions(filePath));
  } catch (err) {
    throw new JackpostError(err.message);
  }
};

// Fetches the URL and returns the raw WSDL text, or null if it is not a WSDL document
export const fetchWsdlFromUrl = async (url) => {
  if (!/[?&]wsdl\b/i.test(url) && !/\.wsdl(\?|$)/i.test(url)) {
    // Not an obvious WSDL URL: sniff the body of a plain fetch
    try {
      const text = await window.ipcRenderer.invoke('renderer:fetch-api-spec', url);
      return typeof text === 'string' && /<(\w+:)?definitions[\s>]/.test(text) ? text : null;
    } catch (err) {
      return null;
    }
  }
  const text = await window.ipcRenderer.invoke('renderer:fetch-api-spec', url);
  if (typeof text !== 'string' || !/<(\w+:)?definitions[\s>]/.test(text)) {
    throw new JackpostError('URL did not return a WSDL document');
  }
  return text;
};

export { isWSDLCollection };
