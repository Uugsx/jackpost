// Translates rendered UI text (English → current language) using a flat dictionary.
// Only whole, trimmed strings are matched, so user data is translated only if it equals a UI label exactly.
// Code editors and opted-out regions are never touched; textarea text is user input, but its placeholder is UI
const ATTRIBUTE_SKIP_SELECTOR = '.CodeMirror, .cm-editor, .monaco-editor, [data-no-translate]';
const TEXT_SKIP_SELECTOR = `script, style, pre, code, textarea, ${ATTRIBUTE_SKIP_SELECTOR}`;
const TRANSLATED_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'];

const originals = new WeakMap(); // Text node → { source, shown }
const attributeOriginals = new WeakMap(); // Element → { [attr]: { source, shown } }

let dictionary = {};
let observer = null;
let scheduled = false;
let pendingRoots = new Set();

const translateString = (value) => {
  const trimmed = value.trim();
  const translated = trimmed && dictionary[trimmed];
  if (!translated) return null;
  return value.replace(trimmed, translated);
};

const isSkipped = (element, selector) => Boolean(element && element.closest && element.closest(selector));

const applyTextNode = (node) => {
  const parent = node.parentElement;
  if (!parent || isSkipped(parent, TEXT_SKIP_SELECTOR)) return;
  const record = originals.get(node);
  // React may rewrite the node; treat a value we did not set as the new English source
  const source = record && record.shown === node.nodeValue ? record.source : node.nodeValue;
  const translated = translateString(source);
  if (translated) {
    node.nodeValue = translated;
    originals.set(node, { source, shown: translated });
  } else if (record) {
    originals.delete(node);
  }
};

const applyAttributes = (element) => {
  if (isSkipped(element, ATTRIBUTE_SKIP_SELECTOR)) return;
  const stored = attributeOriginals.get(element) || {};
  TRANSLATED_ATTRIBUTES.forEach((name) => {
    const current = element.getAttribute(name);
    if (current === null) return;
    const record = stored[name];
    const source = record && record.shown === current ? record.source : current;
    const translated = translateString(source);
    if (translated) {
      element.setAttribute(name, translated);
      stored[name] = { source, shown: translated };
    } else {
      delete stored[name];
    }
  });
  attributeOriginals.set(element, stored);
};

const translateTree = (root) => {
  if (root.nodeType === Node.TEXT_NODE) {
    applyTextNode(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  applyAttributes(root);
  root.querySelectorAll('*').forEach(applyAttributes);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    applyTextNode(node);
    node = walker.nextNode();
  }
};

const restoreTree = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const record = originals.get(node);
    if (record && record.shown === node.nodeValue) node.nodeValue = record.source;
    originals.delete(node);
    node = walker.nextNode();
  }
  root.querySelectorAll('*').forEach((element) => {
    const stored = attributeOriginals.get(element);
    if (!stored) return;
    Object.keys(stored).forEach((name) => {
      if (element.getAttribute(name) === stored[name].shown) element.setAttribute(name, stored[name].source);
    });
    attributeOriginals.delete(element);
  });
};

const flush = () => {
  scheduled = false;
  const roots = [...pendingRoots];
  pendingRoots = new Set();
  // Our own writes must not re-trigger the observer
  observer.takeRecords();
  observer.disconnect();
  roots.forEach((root) => {
    if (root.isConnected) translateTree(root);
  });
  startObserving();
};

const schedule = (root) => {
  pendingRoots.add(root);
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(flush);
  }
};

function startObserving() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATED_ATTRIBUTES
  });
}

const onMutations = (records) => {
  records.forEach((record) => {
    if (record.type === 'childList') {
      record.addedNodes.forEach(schedule);
    } else if (record.type === 'characterData') {
      schedule(record.target);
    } else {
      schedule(record.target);
    }
  });
};

export const applyLanguage = (nextDictionary) => {
  if (observer) {
    observer.takeRecords();
    observer.disconnect();
  }
  restoreTree(document.body);
  dictionary = nextDictionary || {};
  if (Object.keys(dictionary).length === 0) return;
  translateTree(document.body);
  observer = observer || new MutationObserver(onMutations);
  startObserving();
};
