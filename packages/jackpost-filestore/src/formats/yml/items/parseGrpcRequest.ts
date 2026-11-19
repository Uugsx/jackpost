import type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
import type { GrpcRequest as JackpostGrpcRequest } from '@jackpost/schema-types/requests/grpc';
import type { GrpcRequest, GrpcMetadata, GrpcMessageVariant } from '@opencollection/types/requests/grpc';
import type { KeyValue as JackpostKeyValue } from '@jackpost/schema-types/common/key-value';
import { toJackpostAuth } from '../common/auth';
import { toJackpostVariables } from '../common/variables';
import { toJackpostScripts } from '../common/scripts';
import { toJackpostAssertions } from '../common/assertions';
import { isNonEmptyString, uuid, ensureString } from '../../../utils';

const toJackpostGrpcMetadata = (metadata: GrpcMetadata[] | null | undefined): JackpostKeyValue[] | undefined => {
  if (!metadata?.length) {
    return undefined;
  }

  const jackpostMetadata = metadata.map((meta: GrpcMetadata): JackpostKeyValue => {
    const jackpostMeta: JackpostKeyValue = {
      uid: uuid(),
      name: ensureString(meta.name),
      value: ensureString(meta.value),
      enabled: meta.disabled !== true
    };

    if (meta.description) {
      const desc = typeof meta.description === 'string' ? meta.description : (meta.description as any)?.content || '';
      if (desc.trim().length) {
        jackpostMeta.description = desc;
      }
    }

    return jackpostMeta;
  });

  return jackpostMetadata.length ? jackpostMetadata : undefined;
};

const parseGrpcRequest = (ocRequest: GrpcRequest): JackpostItem => {
  const info = ocRequest.info;
  const grpc = ocRequest.grpc;
  const runtime = ocRequest.runtime;

  const jackpostRequest: JackpostGrpcRequest = {
    url: ensureString(grpc?.url),
    method: ensureString(grpc?.method),
    methodType: grpc?.methodType || '',
    protoPath: grpc?.protoFilePath || null,
    headers: toJackpostGrpcMetadata(grpc?.metadata) || [],
    auth: toJackpostAuth(grpc?.auth),
    body: {
      mode: 'grpc',
      grpc: []
    },
    script: {
      beforeCallStart: null,
      beforeMessageSend: null,
      afterMessageReceive: null,
      afterCallEnd: null
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
  const rawMessage = grpc?.message;
  if (Array.isArray(rawMessage)) {
    jackpostRequest.body.grpc = (rawMessage as GrpcMessageVariant[]).map(({ title, message }, index) => ({
      name: title || `message ${index + 1}`,
      content: ensureString(message)
    }));
  } else if (isNonEmptyString(rawMessage)) {
    jackpostRequest.body.grpc = [{
      name: '',
      content: rawMessage as string
    }];
  }

  // scripts
  const scripts = toJackpostScripts(runtime?.scripts);
  if (scripts?.script && jackpostRequest.script) {
    if (scripts.script.beforeCallStart) {
      jackpostRequest.script.beforeCallStart = scripts.script.beforeCallStart;
    }
    if (scripts.script.beforeMessageSend) {
      jackpostRequest.script.beforeMessageSend = scripts.script.beforeMessageSend;
    }
    if (scripts.script.afterMessageReceive) {
      jackpostRequest.script.afterMessageReceive = scripts.script.afterMessageReceive;
    }
    if (scripts.script.afterCallEnd) {
      jackpostRequest.script.afterCallEnd = scripts.script.afterCallEnd;
    }
  }
  if (scripts?.tests) {
    jackpostRequest.tests = scripts.tests;
  }

  // variables
  const variables = toJackpostVariables(runtime?.variables);
  jackpostRequest.vars = variables;

  // assertions
  const assertions = toJackpostAssertions(runtime?.assertions);
  if (assertions) {
    jackpostRequest.assertions = assertions;
  }

  // docs
  if (ocRequest.docs) {
    jackpostRequest.docs = ocRequest.docs;
  }

  // jackpost item
  const jackpostItem: JackpostItem = {
    uid: uuid(),
    type: 'grpc-request',
    seq: info?.seq || 1,
    name: ensureString(info?.name, 'Untitled Request'),
    tags: info?.tags || [],
    request: jackpostRequest,
    settings: {},
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

export default parseGrpcRequest;
