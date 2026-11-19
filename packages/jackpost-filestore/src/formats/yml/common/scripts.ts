import type { Script as OpenCollectionScript, Scripts } from '@opencollection/types/common/scripts';
import type { FolderRequest as JackpostFolderRequest } from '@jackpost/schema-types/collection/folder';
import type { HttpRequest as JackpostHttpRequest } from '@jackpost/schema-types/requests/http';
import type { WebSocketRequest as JackpostWebSocketRequest } from '@jackpost/schema-types/requests/websocket';
import type { GrpcRequest as JackpostGrpcRequest } from '@jackpost/schema-types/requests/grpc';
import type { Script as JackpostScript } from '@jackpost/schema-types/common/scripts';

export const toOpenCollectionScripts = (request: JackpostFolderRequest | JackpostHttpRequest | JackpostWebSocketRequest | JackpostGrpcRequest | null | undefined, allowedKeys: string[]): Scripts | undefined => {
  const ocScripts: Scripts = [];
  const script = request?.script as JackpostScript | null | undefined;

  const pushScript = (key: keyof JackpostScript, type: OpenCollectionScript['type'], code: string | null | undefined) => {
    if (!allowedKeys.includes(key)) {
      return;
    }
    if (!code?.trim().length) {
      return;
    }
    ocScripts.push({ type, code });
  };

  pushScript('req', 'before-request', script?.req);
  pushScript('res', 'after-response', script?.res);
  pushScript('beforeCallStart', 'grpc:before-call-start', script?.beforeCallStart);
  pushScript('beforeMessageSend', 'grpc:before-message-send', script?.beforeMessageSend);
  pushScript('afterMessageReceive', 'grpc:after-message-receive', script?.afterMessageReceive);
  pushScript('afterCallEnd', 'grpc:after-call-end', script?.afterCallEnd);

  if (request?.tests?.trim().length) {
    ocScripts.push({
      type: 'tests',
      code: request.tests
    });
  }

  return ocScripts.length > 0 ? ocScripts : undefined;
};

export const toJackpostScripts = (scripts: Scripts | null | undefined): {
  script?: JackpostScript;
  tests?: string;
} | undefined => {
  if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
    return undefined;
  }

  const jackpostScripts: {
    script?: JackpostScript;
    tests?: string;
  } = {};

  const setScript = (key: keyof JackpostScript, code: string) => {
    if (!jackpostScripts.script) {
      jackpostScripts.script = {};
    }
    jackpostScripts.script[key] = code;
  };

  for (const script of scripts) {
    if (!script.code) {
      continue;
    }

    switch (script.type) {
      case 'before-request':
        setScript('req', script.code);
        break;
      case 'after-response':
        setScript('res', script.code);
        break;
      case 'grpc:before-call-start':
        setScript('beforeCallStart', script.code);
        break;
      case 'grpc:before-message-send':
        setScript('beforeMessageSend', script.code);
        break;
      case 'grpc:after-message-receive':
        setScript('afterMessageReceive', script.code);
        break;
      case 'grpc:after-call-end':
        setScript('afterCallEnd', script.code);
        break;
      case 'tests':
        jackpostScripts.tests = script.code;
        break;
    }
  }

  return Object.keys(jackpostScripts).length > 0 ? jackpostScripts : undefined;
};
