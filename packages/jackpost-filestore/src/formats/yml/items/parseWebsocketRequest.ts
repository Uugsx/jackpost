import type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
import type { WebSocketRequest as JackpostWebSocketRequest } from '@jackpost/schema-types/requests/websocket';
import type { WebSocketRequest, WebSocketMessage, WebSocketMessageVariant } from '@opencollection/types/requests/websocket';
import { toJackpostAuth } from '../common/auth';
import { toJackpostHttpHeaders } from '../common/headers';
import { toJackpostVariables } from '../common/variables';
import { toJackpostScripts } from '../common/scripts';
import { uuid, ensureString } from '../../../utils';

const parseWebsocketRequest = (ocRequest: WebSocketRequest): JackpostItem => {
  const info = ocRequest.info;
  const websocket = ocRequest.websocket;
  const runtime = ocRequest.runtime;

  const jackpostRequest: JackpostWebSocketRequest = {
    url: ensureString(websocket?.url),
    headers: toJackpostHttpHeaders(websocket?.headers) || [],
    auth: toJackpostAuth(websocket?.auth),
    body: {
      mode: 'ws',
      ws: []
    },
    script: {
      req: null,
      res: null
    },
    vars: {
      req: [],
      res: []
    },
    assertions: [],
    tests: null,
    docs: null
  };

  // message
  if (websocket?.message) {
    if (Array.isArray(websocket.message)) {
      // multiple messages: WebSocketMessageVariant[]
      const variants = websocket.message as WebSocketMessageVariant[];
      jackpostRequest.body.ws = variants.map((variant, index) => ({
        name: variant.title || `message ${index + 1}`,
        type: variant.message?.type || 'text',
        content: ensureString(variant.message?.data),
        selected: variant.selected || false
      }));
    } else {
      // single message uses flat WebSocketMessage
      const message = websocket.message as WebSocketMessage;
      const messageData = ensureString(message.data);
      if (messageData.trim().length) {
        jackpostRequest.body.ws = [{
          name: '',
          type: message.type || 'text',
          content: messageData
        }];
      }
    }
  }

  // scripts
  const scripts = toJackpostScripts(runtime?.scripts);
  if (scripts?.script && jackpostRequest.script) {
    if (scripts.script.req) {
      jackpostRequest.script.req = scripts.script.req;
    }
    if (scripts.script.res) {
      jackpostRequest.script.res = scripts.script.res;
    }
  }
  if (scripts?.tests) {
    jackpostRequest.tests = scripts.tests;
  }

  // variables
  const variables = toJackpostVariables(runtime?.variables);
  jackpostRequest.vars = variables;

  // docs
  if (ocRequest.docs) {
    jackpostRequest.docs = ocRequest.docs;
  }

  // settings
  const wsSettings: Record<string, number> = {
    timeout: 0,
    keepAliveInterval: 0
  };

  if (ocRequest.settings) {
    if (typeof ocRequest.settings.timeout === 'number') {
      wsSettings.timeout = ocRequest.settings.timeout;
    }
    if (typeof ocRequest.settings.keepAliveInterval === 'number') {
      wsSettings.keepAliveInterval = ocRequest.settings.keepAliveInterval;
    }
  }

  // jackpost item
  const jackpostItem: JackpostItem = {
    uid: uuid(),
    type: 'ws-request',
    seq: info?.seq || 1,
    name: ensureString(info?.name, 'Untitled Request'),
    tags: info?.tags || [],
    request: jackpostRequest,
    settings: wsSettings as any,
    fileContent: null,
    root: null,
    items: [],
    examples: [],
    filename: null,
    pathname: null
  };

  // description
  if (info?.description) {
    const desc = typeof info.description === 'string' ? info.description : (info.description as any)?.content || '';
    if (desc.trim().length) {
      jackpostItem.description = desc;
    }
  }

  return jackpostItem;
};

export default parseWebsocketRequest;
