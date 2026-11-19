import type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
import type { KeyValue as JackpostKeyValue } from '@jackpost/schema-types/common/key-value';
import type { GrpcRequest as JackpostGrpcRequest } from '@jackpost/schema-types/requests/grpc';
import type { GrpcRequest, GrpcMetadata, GrpcMessageVariant, GrpcMessage, GrpcRequestInfo, GrpcRequestDetails, GrpcRequestRuntime } from '@opencollection/types/requests/grpc';
import type { Auth } from '@opencollection/types/common/auth';
import type { Scripts } from '@opencollection/types/common/scripts';
import type { Variable } from '@opencollection/types/common/variables';
import type { Assertion } from '@opencollection/types/common/assertions';
import { stringifyYml } from '../utils';
import { isNonEmptyString } from '../../../utils';
import { toOpenCollectionAuth } from '../common/auth';
import { toOpenCollectionVariables } from '../common/variables';
import { toOpenCollectionScripts } from '../common/scripts';
import { toOpenCollectionAssertions } from '../common/assertions';
import { GRPC_SCRIPT_KEYS } from '@jackpost/common';

const stringifyGrpcRequest = (item: JackpostItem): string => {
  try {
    const ocRequest: GrpcRequest = {};
    const jackpostRequest = item.request as JackpostGrpcRequest;

    // info block
    const info: GrpcRequestInfo = {
      name: isNonEmptyString(item.name) ? item.name : 'Untitled Request',
      type: 'grpc'
    };
    if (item.seq) {
      info.seq = item.seq;
    }
    if (item.tags?.length) {
      info.tags = item.tags;
    }
    if (isNonEmptyString(item.description)) {
      info.description = item.description;
    }
    ocRequest.info = info;

    // grpc block
    const grpc: GrpcRequestDetails = {
      url: isNonEmptyString(jackpostRequest.url) ? jackpostRequest.url : '',
      method: isNonEmptyString(jackpostRequest.method) ? jackpostRequest.method : ''
    };

    // method type
    if (jackpostRequest.methodType) {
      grpc.methodType = jackpostRequest.methodType;
    }

    // proto file path
    if (isNonEmptyString(jackpostRequest.protoPath)) {
      grpc.protoFilePath = jackpostRequest.protoPath;
    }

    // metadata
    if (jackpostRequest.headers?.length) {
      const metadata: GrpcMetadata[] = jackpostRequest.headers.map((header: JackpostKeyValue) => {
        const metadataItem: GrpcMetadata = {
          name: header.name || '',
          value: header.value || ''
        };

        if (header?.description?.trim().length) {
          metadataItem.description = header.description;
        }

        if (header.enabled === false) {
          metadataItem.disabled = true;
        }

        return metadataItem;
      });

      if (metadata.length) {
        grpc.metadata = metadata;
      }
    }

    // message
    if (jackpostRequest.body?.mode === 'grpc' && jackpostRequest.body.grpc?.length) {
      const messages: GrpcMessageVariant[] = jackpostRequest.body.grpc.map(({ name, content }, index) => ({
        title: name || `message ${index + 1}`,
        message: content || ''
      }));
      grpc.message = messages;
    }

    // auth
    const auth: Auth | undefined = toOpenCollectionAuth(jackpostRequest.auth);
    if (auth) {
      grpc.auth = auth;
    }

    ocRequest.grpc = grpc;

    // runtime block
    const runtime: GrpcRequestRuntime = {};
    let hasRuntime = false;

    // variables
    const variables: Variable[] | undefined = toOpenCollectionVariables(jackpostRequest.vars);
    if (variables) {
      runtime.variables = variables;
      hasRuntime = true;
    }

    // scripts
    const scripts: Scripts | undefined = toOpenCollectionScripts(jackpostRequest, GRPC_SCRIPT_KEYS);
    if (scripts) {
      runtime.scripts = scripts;
      hasRuntime = true;
    }

    // assertions
    const assertions: Assertion[] | undefined = toOpenCollectionAssertions(jackpostRequest.assertions);
    if (assertions) {
      runtime.assertions = assertions;
      hasRuntime = true;
    }

    if (hasRuntime) {
      ocRequest.runtime = runtime;
    }

    // docs
    if (isNonEmptyString(jackpostRequest.docs)) {
      ocRequest.docs = jackpostRequest.docs;
    }

    return stringifyYml(ocRequest);
  } catch (error) {
    console.error('Error stringifying gRPC request:', error);
    throw error;
  }
};

export default stringifyGrpcRequest;
