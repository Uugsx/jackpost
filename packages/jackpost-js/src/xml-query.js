const xpath = require('xpath');
const { DOMParser } = require('@xmldom/xmldom');

const parse = (data) => {
  if (typeof data !== 'string' || !data.trim()) return null;
  let failed = false;
  const onError = () => { failed = true; };
  const doc = new DOMParser({ errorHandler: { warning: () => {}, error: onError, fatalError: onError } }).parseFromString(data, 'text/xml');
  return failed || !doc || !doc.documentElement ? null : doc;
};

const nodeValue = (n) => (n && typeof n === 'object' && 'nodeType' in n ? n.textContent : n);

/**
 * Evaluates an XPath against an XML string (namespace-agnostic: prefixes are not required,
 * use local-name() or the ns map). Returns string/number/boolean for scalar results,
 * text of the first node for node-sets, and undefined if nothing matched or XML is invalid.
 */
const evalXPath = (data, expr, namespaces = {}) => {
  const doc = parse(data);
  if (!doc) return undefined;
  const root = doc.documentElement;
  const ns = { ...namespaces };
  // map declared prefixes of the root so `//soap:Body` works as in the document
  for (let i = 0; i < root.attributes.length; i++) {
    const a = root.attributes[i];
    if (a.name.startsWith('xmlns:')) ns[a.name.slice(6)] = ns[a.name.slice(6)] || a.value;
  }
  const select = xpath.useNamespaces(ns);
  const result = select(expr, doc);
  if (Array.isArray(result)) return result.length ? nodeValue(result[0]) : undefined;
  return nodeValue(result);
};

const countXPath = (data, expr) => {
  const doc = parse(data);
  if (!doc) return 0;
  const result = xpath.select(expr, doc);
  return Array.isArray(result) ? result.length : result ? 1 : 0;
};

// SOAP 1.1 / 1.2 Fault -> { code, message } or null
const getSoapFault = (data) => {
  const doc = parse(data);
  if (!doc) return null;
  const fault = xpath.select("//*[local-name()='Fault']", doc)[0];
  if (!fault) return null;
  const text = (q) => {
    const n = xpath.select(q, fault)[0];
    return n ? n.textContent.trim() : '';
  };
  return {
    code: text("*[local-name()='faultcode'] | *[local-name()='Code']/*[local-name()='Value']"),
    message: text("*[local-name()='faultstring'] | *[local-name()='Reason']/*[local-name()='Text']")
  };
};

module.exports = { evalXPath, countXPath, getSoapFault, parseXml: parse };
