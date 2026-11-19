// Helpers for "Refresh WSDL": re-generate SOAP requests while keeping values the user typed.

const PLACEHOLDERS = new Set(['', '?', 'string', '0', '0.0', 'false', 'true', '1970-01-01T00:00:00', '1970-01-01']);

const parseXml = (xml) => {
  if (typeof xml !== 'string' || !xml.trim()) return null;
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) return null;
  return doc;
};

const isLeaf = (el) => el.children.length === 0;

// Path of an element made of local names, with a sibling index for repeated names
const elementPath = (el) => {
  const parts = [];
  let cur = el;
  while (cur && cur.nodeType === 1) {
    let idx = 0;
    let sib = cur.previousElementSibling;
    while (sib) {
      if (sib.localName === cur.localName) idx++;
      sib = sib.previousElementSibling;
    }
    parts.unshift(`${cur.localName}[${idx}]`);
    cur = cur.parentElement;
  }
  return parts.join('/');
};

const collectLeafValues = (doc) => {
  const values = new Map();
  doc.querySelectorAll('*').forEach((el) => {
    if (isLeaf(el)) {
      values.set(elementPath(el), el.textContent);
    }
  });
  return values;
};

/**
 * Returns newXml with leaf values copied from oldXml wherever the element path still exists
 * and the old value was changed by the user (not a generated placeholder).
 * If either document is not well-formed (a "broken xml") the new XML is returned as is.
 */
export const mergeXmlValues = (oldXml, newXml) => {
  const oldDoc = parseXml(oldXml);
  const newDoc = parseXml(newXml);
  if (!newDoc || !oldDoc) return newXml;

  const oldValues = collectLeafValues(oldDoc);
  let changed = false;
  newDoc.querySelectorAll('*').forEach((el) => {
    if (!isLeaf(el)) return;
    const key = elementPath(el);
    if (!oldValues.has(key)) return;
    const oldValue = oldValues.get(key);
    if (PLACEHOLDERS.has(oldValue.trim()) || oldValue === el.textContent) return;
    el.textContent = oldValue;
    changed = true;
  });

  return changed ? new XMLSerializer().serializeToString(newDoc) : newXml;
};

// Flatten a tree of items into [{ key, folderKey, item }] for requests, keyed by "Folder/Sub/Name"
export const flattenRequests = (items, prefix = '') => {
  const out = [];
  (items || []).forEach((item) => {
    if (item.type === 'folder') {
      out.push(...flattenRequests(item.items, prefix ? `${prefix}/${item.name}` : item.name));
    } else {
      out.push({ key: prefix ? `${prefix}/${item.name}` : item.name, folderKey: prefix, item });
    }
  });
  return out;
};

export const flattenFolders = (items, prefix = '') => {
  const out = [];
  (items || []).forEach((item) => {
    if (item.type === 'folder') {
      const key = prefix ? `${prefix}/${item.name}` : item.name;
      out.push({ key, item });
      out.push(...flattenFolders(item.items, key));
    }
  });
  return out;
};
