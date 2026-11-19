// OpenCollection types - main module
export type { OpenCollection, Extensions } from '@opencollection/types';

// OpenCollection collection/item types
export type { Item, Folder, FolderInfo } from '@opencollection/types/collection/item';

// OpenCollection HTTP request types
export type {
  HttpRequest,
  HttpRequestHeader,
  HttpResponseHeader,
  HttpRequestParam,
  HttpRequestBody,
  HttpRequestSettings,
  HttpRequestExample,
  HttpRequestExampleRequest,
  HttpRequestExampleResponse,
  HttpRequestExampleResponseBody,
  HttpRequestBodyVariant,
  HttpRequestInfo,
  HttpRequestDetails,
  HttpRequestRuntime,
  RawBody,
  FormUrlEncodedBody,
  FormUrlEncodedEntry,
  MultipartFormBody,
  MultipartFormEntry,
  FileBody,
  FileBodyVariant
} from '@opencollection/types/requests/http';

// OpenCollection GraphQL request types
export type {
  GraphQLRequest,
  GraphQLRequestSettings,
  GraphQLRequestInfo,
  GraphQLRequestDetails,
  GraphQLRequestRuntime,
  GraphQLBody,
  GraphQLBodyVariant
} from '@opencollection/types/requests/graphql';

// OpenCollection gRPC request types
export type {
  GrpcRequest,
  GrpcRequestInfo,
  GrpcRequestDetails,
  GrpcRequestRuntime,
  GrpcMetadata,
  GrpcMessage,
  GrpcMessageVariant,
  GrpcMessagePayload,
  GrpcMethodType
} from '@opencollection/types/requests/grpc';

// OpenCollection WebSocket request types
export type {
  WebSocketRequest,
  WebSocketRequestInfo,
  WebSocketRequestDetails,
  WebSocketRequestRuntime,
  WebSocketMessage,
  WebSocketMessageVariant,
  WebSocketPayload,
  WebSocketMessageType
} from '@opencollection/types/requests/websocket';

// OpenCollection config types
export type { Environment } from '@opencollection/types/config/environments';
export type { CollectionConfig } from '@opencollection/types/config/collection';
export type { Protobuf, ProtoFileItem, ProtoFileImportPath } from '@opencollection/types/config/protobuf';
export type { Proxy, ProxyConnectionConfig, ProxyConnectionAuth } from '@opencollection/types/config/proxy';
export type { ClientCertificate, PemCertificate, Pkcs12Certificate } from '@opencollection/types/config/certificates';

// OpenCollection common types
export type { RequestDefaults, RequestSettings } from '@opencollection/types/common/request-defaults';
export type { Documentation } from '@opencollection/types/common/documentation';
export type { Description } from '@opencollection/types/common/description';
export type { Info, Author } from '@opencollection/types/common/info';
export type {
  Variable,
  VariableValueVariant
} from '@opencollection/types/common/variables';
export type { Scripts } from '@opencollection/types/common/scripts';
export type { Assertion } from '@opencollection/types/common/assertions';
export type { Tag } from '@opencollection/types/common/tags';
export type {
  Action,
  ActionSetVariable,
  ActionPhase,
  ActionVariableScope,
  SetVariableActionSelector,
  SetVariableActionTarget
} from '@opencollection/types/common/actions';

// OpenCollection auth types
export type {
  Auth,
  AuthBasic,
  AuthBearer,
  AuthDigest,
  AuthNTLM,
  AuthAwsV4,
  AuthApiKey,
  AuthWsse,
  AuthOAuth1
} from '@opencollection/types/common/auth';

export type { AuthOAuth2 } from '@opencollection/types/common/auth-oauth2';

// Jackpost types - collection
export type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
export type {
  FolderRoot as JackpostFolderRoot,
  FolderRequest as JackpostFolderRequest,
  FolderMeta as JackpostFolderMeta
} from '@jackpost/schema-types/collection/folder';
export type { Collection as JackpostCollection } from '@jackpost/schema-types/collection/collection';
export type {
  Environment as JackpostEnvironment,
  EnvironmentVariable as JackpostEnvironmentVariable
} from '@jackpost/schema-types/collection/environment';
export type {
  Example as JackpostExample,
  ExampleRequest as JackpostExampleRequest,
  ExampleResponse as JackpostExampleResponse,
  ExampleResponseBody as JackpostExampleResponseBody
} from '@jackpost/schema-types/collection/examples';

// Jackpost types - common
export type { KeyValue as JackpostKeyValue } from '@jackpost/schema-types/common/key-value';
export type { Variable as JackpostVariable, Variables as JackpostVariables } from '@jackpost/schema-types/common/variables';
export type { Script as JackpostScript } from '@jackpost/schema-types/common/scripts';
export type {
  Auth as JackpostAuth,
  AuthMode as JackpostAuthMode,
  AuthAwsV4 as JackpostAuthAwsV4,
  AuthBasic as JackpostAuthBasic,
  AuthBearer as JackpostAuthBearer,
  AuthDigest as JackpostAuthDigest,
  AuthNTLM as JackpostAuthNTLM,
  AuthWsse as JackpostAuthWsse,
  AuthApiKey as JackpostAuthApiKey,
  AuthOauth1 as JackpostAuthOauth1,
  OAuth2 as JackpostOAuth2
} from '@jackpost/schema-types/common/auth';
export type { MultipartFormEntry as JackpostMultipartFormEntry, MultipartForm as JackpostMultipartForm } from '@jackpost/schema-types/common/multipart-form';
export type { FileEntry as JackpostFileEntry, FileList as JackpostFileList } from '@jackpost/schema-types/common/file';
export type { GraphqlBody as JackpostGraphqlBody } from '@jackpost/schema-types/common/graphql';

// Jackpost types - requests
export type {
  HttpRequest as JackpostHttpRequest,
  HttpRequestBody as JackpostHttpRequestBody,
  HttpRequestBodyMode as JackpostHttpRequestBodyMode,
  HttpRequestParam as JackpostHttpRequestParam,
  HttpRequestParamType as JackpostHttpRequestParamType
} from '@jackpost/schema-types/requests/http';
export type {
  GrpcRequest as JackpostGrpcRequest,
  GrpcRequestBody as JackpostGrpcRequestBody,
  GrpcMessage as JackpostGrpcMessage,
  GrpcMethodType as JackpostGrpcMethodType
} from '@jackpost/schema-types/requests/grpc';
export type {
  WebSocketRequest as JackpostWebSocketRequest,
  WebSocketRequestBody as JackpostWebSocketRequestBody,
  WebSocketMessage as JackpostWsMessage
} from '@jackpost/schema-types/requests/websocket';

export interface JackpostPresets {
  requestType?: string;
  requestUrl?: string;
  defaultEnvironment?: string;
}

export interface JackpostConfig {
  version?: string;
  // present only for OpenCollection (yml) collections; its presence marks the format.
  opencollection?: string;
  name?: string;
  type?: string;
  ignore?: string[];
  presets?: JackpostPresets;
  soapEndpoints?: string[];
  protobuf?: {
    protoFiles?: { path: string }[];
    importPaths?: { path: string; enabled?: boolean }[];
  };
  proxy?: {
    disabled?: boolean;
    inherit?: boolean;
    config?: {
      protocol?: string;
      hostname?: string;
      port?: number;
      auth?: {
        disabled?: boolean;
        username?: string;
        password?: string;
      };
      bypassProxy?: string;
    };
  };
  clientCertificates?: {
    certs?: Array<{
      domain?: string;
      type?: 'cert' | 'pfx';
      certFilePath?: string;
      keyFilePath?: string;
      pfxFilePath?: string;
      passphrase?: string;
      disabled?: boolean;
    }>;
  };
  scripts?: {
    additionalContextRoots?: string[];
    flow?: 'sandwich' | 'sequential';
  };
  openapi?: Array<{
    sourceUrl: string;
    groupBy?: 'tags' | 'path';
    authPlacement?: 'request' | 'collection';
    requestNameSource?: 'summary' | 'operationId' | 'description' | 'path';
    lastSyncDate?: string;
    specHash?: string;
    autoCheck?: boolean;
    autoCheckInterval?: number;
  }>;
}

export interface JackpostCollectionRoot {
  request?: any;
  docs?: string;
  meta?: {
    name?: string;
    seq?: number;
  };
}