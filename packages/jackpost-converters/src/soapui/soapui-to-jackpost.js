import parseXML from '../wsdl/parse-xml.js';
import {
  generateUID,
  validateSchema,
  transformItemsInCollection,
  hydrateSeqInCollection
} from '../wsdl/wsdl-to-jackpost.js';

const SOAP_CONTENT_TYPES = {
  '1_1': 'text/xml; charset=utf-8',
  '1_2': 'application/soap+xml; charset=utf-8'
};

const local = (key) => key.replace(/^.*:/, '');

const children = (node, name) => {
  if (!node || typeof node !== 'object') return [];
  return Object.keys(node)
    .filter((key) => local(key) === name)
    .flatMap((key) => node[key])
    .filter((value) => value != null);
};

const child = (node, name) => children(node, name)[0];

const text = (node) => {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  return typeof node._ === 'string' ? node._ : '';
};

const attr = (node, name) => (node && typeof node === 'object' && typeof node[name] === 'string' ? node[name] : '');

const header = (name, value) => ({ uid: generateUID(), name, value, description: '', enabled: true });

const isRestService = (iface) => /RestService/.test(attr(iface, 'xsi:type'));

const uniqueName = (name, taken) => {
  const base = name || 'Request';
  let candidate = base;
  for (let n = 1; taken.has(candidate); n++) candidate = `${base}_${n}`;
  taken.add(candidate);
  return candidate;
};

const unescapeXml = (value) => value
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, '\'')
  .replace(/&amp;/g, '&');

// SoapUI keeps custom HTTP headers as an escaped <xml-fragment><con:entry key=".." value=".."/></xml-fragment>
const parseCustomHeaders = (callNode) => {
  const fragment = children(child(callNode, 'settings'), 'setting')
    .map(text)
    .find((value) => /<(con:)?entry\s/.test(value));
  if (!fragment) return [];
  const headers = [];
  const entryPattern = /<(?:con:)?entry\s+key="([^"]*)"\s+value="([^"]*)"/g;
  let match = entryPattern.exec(fragment);
  while (match) {
    headers.push(header(unescapeXml(match[1]), unescapeXml(match[2])));
    match = entryPattern.exec(fragment);
  }
  return headers;
};

const buildAuth = (credentialsNode) => {
  const authType = text(child(credentialsNode, 'authType'));
  const username = text(child(credentialsNode, 'username'));
  if (/basic|preemptive/i.test(authType) && username) {
    return { mode: 'basic', basic: { username, password: text(child(credentialsNode, 'password')) } };
  }
  return { mode: 'none' };
};

const soapRequestItem = ({ name, endpoint, body, soapVersion, soapAction, callNode }) => {
  const headers = [header('Content-Type', SOAP_CONTENT_TYPES[soapVersion] || SOAP_CONTENT_TYPES['1_1'])];
  if (soapAction != null) headers.push(header('SOAPAction', soapAction));
  headers.push(...parseCustomHeaders(callNode));

  return {
    uid: generateUID(),
    name,
    type: 'http-request',
    request: {
      url: endpoint || '',
      method: 'POST',
      auth: buildAuth(child(callNode, 'credentials')),
      headers,
      params: [],
      body: { mode: 'xml', json: null, text: null, xml: body, formUrlEncoded: [], multipartForm: [] },
      script: { res: null }
    }
  };
};

const wsdlInterfaceFolder = (iface) => {
  const soapVersion = attr(iface, 'soapVersion');
  const operationNames = new Set();
  const operationFolders = [];

  children(iface, 'operation').forEach((operation) => {
    const requestNames = new Set();
    const items = children(operation, 'call').map((callNode) => soapRequestItem({
      name: uniqueName(attr(callNode, 'name') || 'Request 1', requestNames),
      endpoint: text(child(callNode, 'endpoint')),
      body: text(child(callNode, 'request')),
      soapVersion,
      soapAction: attr(operation, 'action'),
      callNode
    }));
    if (items.length === 0) return;
    operationFolders.push({
      uid: generateUID(),
      name: uniqueName(attr(operation, 'name'), operationNames),
      type: 'folder',
      items
    });
  });

  return { uid: generateUID(), name: attr(iface, 'name') || 'Interface', type: 'folder', items: operationFolders };
};

const restParameters = (requestNode) => children(child(requestNode, 'parameters'), 'entry')
  .filter((entry) => attr(entry, 'key'))
  .map((entry) => ({ uid: generateUID(), name: attr(entry, 'key'), value: attr(entry, 'value'), type: 'query', enabled: true }));

const restRequestItem = ({ name, method, url, requestNode }) => {
  const body = text(child(requestNode, 'request'));
  const mediaType = attr(requestNode, 'mediaType');
  const hasBody = body.trim().length > 0;
  const isJson = /json/i.test(mediaType);
  let bodyMode = 'none';
  if (hasBody) bodyMode = isJson ? 'json' : 'xml';
  return {
    uid: generateUID(),
    name,
    type: 'http-request',
    request: {
      url,
      method: method || 'GET',
      auth: buildAuth(child(requestNode, 'credentials')),
      headers: hasBody && mediaType ? [header('Content-Type', mediaType)] : [],
      params: restParameters(requestNode),
      body: {
        mode: bodyMode,
        json: bodyMode === 'json' ? body : null,
        text: null,
        xml: bodyMode === 'xml' ? body : null,
        formUrlEncoded: [],
        multipartForm: []
      },
      script: { res: null }
    }
  };
};

const restResourceItems = (resourceNode, basePath) => {
  const resourcePath = `${basePath}${attr(resourceNode, 'path')}`;
  const taken = new Set();
  const items = [];

  children(resourceNode, 'method').forEach((methodNode) => {
    children(methodNode, 'request').forEach((requestNode) => {
      const label = `${attr(methodNode, 'name') || attr(methodNode, 'method')} ${attr(requestNode, 'name')}`.trim();
      items.push(restRequestItem({
        name: uniqueName(label, taken),
        method: attr(methodNode, 'method'),
        url: `${text(child(requestNode, 'endpoint'))}${resourcePath}`,
        requestNode
      }));
    });
  });

  children(resourceNode, 'resource').forEach((nested) => {
    items.push({
      uid: generateUID(),
      name: attr(nested, 'name') || attr(nested, 'path') || 'Resource',
      type: 'folder',
      items: restResourceItems(nested, resourcePath)
    });
  });
  return items;
};

const restServiceFolder = (service) => ({
  uid: generateUID(),
  name: attr(service, 'name') || 'REST Service',
  type: 'folder',
  items: children(service, 'resource').map((resource) => ({
    uid: generateUID(),
    name: attr(resource, 'name') || attr(resource, 'path') || 'Resource',
    type: 'folder',
    items: restResourceItems(resource, '')
  }))
});

// A request test step carries its own body and endpoint; the interface only supplies protocol details
const testStepItem = (step, interfaces) => {
  const config = child(step, 'config');
  const requestNode = child(config, 'request');
  if (!requestNode) return null;

  const name = attr(step, 'name') || 'Step';
  const endpoint = text(child(requestNode, 'endpoint'));
  const iface = interfaces.get(text(child(config, 'interface')));

  if (iface && isRestService(iface)) {
    return restRequestItem({ name, method: attr(config, 'method'), url: endpoint, requestNode });
  }
  const operation = iface && children(iface, 'operation').find((op) => attr(op, 'name') === text(child(config, 'operation')));
  return soapRequestItem({
    name,
    endpoint,
    body: text(child(requestNode, 'request')),
    soapVersion: iface ? attr(iface, 'soapVersion') : '',
    soapAction: operation ? attr(operation, 'action') : '',
    callNode: requestNode
  });
};

const testCaseFolder = (testCase, interfaces) => {
  const taken = new Set();
  const items = children(testCase, 'testStep')
    .map((step) => testStepItem(step, interfaces))
    .filter(Boolean);
  items.forEach((item) => {
    item.name = uniqueName(item.name, taken);
  });
  return { uid: generateUID(), name: attr(testCase, 'name') || 'Test Case', type: 'folder', items };
};

const testSuiteFolders = (project, interfaces) => children(project, 'testSuite')
  .map((suite) => ({
    uid: generateUID(),
    name: attr(suite, 'name') || 'Test Suite',
    type: 'folder',
    items: children(suite, 'testCase')
      .map((testCase) => testCaseFolder(testCase, interfaces))
      .filter((folder) => folder.items.length > 0)
  }))
  .filter((folder) => folder.items.length > 0);

const projectVariables = (project) => children(child(project, 'properties'), 'property')
  .map((property) => ({
    uid: generateUID(),
    name: text(child(property, 'name')).replace(/[^\w.-]/g, '_'),
    value: text(child(property, 'value')),
    enabled: true
  }))
  .filter((variable) => variable.name);

export const isSoapUIProject = (xml) => typeof xml === 'string' && /<(\w+:)?soapui-project[\s>]/.test(xml);

export const soapuiToJackpost = async (xmlContent) => {
  try {
    if (!isSoapUIProject(xmlContent)) {
      throw new Error('The file is not a SoapUI project');
    }
    let parsed;
    try {
      parsed = await parseXML(xmlContent);
    } catch (err) {
      throw new Error('The file is not valid XML');
    }
    const project = child(parsed, 'soapui-project');
    if (!project) {
      throw new Error('No soapui-project found');
    }

    const interfaces = new Map(children(project, 'interface').map((iface) => [attr(iface, 'name'), iface]));
    const items = [];
    interfaces.forEach((iface) => {
      const folder = isRestService(iface) ? restServiceFolder(iface) : wsdlInterfaceFolder(iface);
      if (folder.items.length > 0) items.push(folder);
    });
    items.push(...testSuiteFolders(project, interfaces));

    const collection = { uid: generateUID(), version: '1', name: attr(project, 'name') || 'SoapUI Project', items };
    const variables = projectVariables(project);
    if (variables.length > 0) {
      collection.root = { request: { vars: { req: variables } } };
    }

    return validateSchema(hydrateSeqInCollection(transformItemsInCollection(collection)));
  } catch (err) {
    throw new Error('Import SoapUI project failed: ' + err.message);
  }
};

export default soapuiToJackpost;
