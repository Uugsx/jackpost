import { normalizeOpenApiSyncConfigs } from "@jackpost/common";
import { toOpenCollectionActions, toOpenCollectionAuth, toOpenCollectionHeaders, toOpenCollectionScripts, toOpenCollectionVariables } from "./common";
import { toOpenCollectionEnvironments } from "./environment";
import { toOpenCollectionFolder } from "./folder";
import { toOpenCollectionItems } from "./items";
import { JackpostCollection, JackpostCollectionRoot, JackpostConfig, JackpostPresets, ClientCertificate, CollectionConfig, OpenCollection, PemCertificate, Pkcs12Certificate, Protobuf } from "./types";
import { HTTP_SCRIPT_KEYS } from '@jackpost/common';

const toOpenCollectionConfig = (jackpostConfig: JackpostConfig | undefined): CollectionConfig | undefined => {
  if (!jackpostConfig) {
    return undefined;
  }

  const config: CollectionConfig = {};

  if (jackpostConfig.protobuf?.protoFiles?.length || jackpostConfig.protobuf?.importPaths?.length) {
    config.protobuf = {} as Protobuf;

    if (jackpostConfig.protobuf.protoFiles?.length) {
      config.protobuf.protoFiles = jackpostConfig.protobuf.protoFiles.map((f) => ({
        type: 'file' as const,
        path: f.path
      }));
    }

    if (jackpostConfig.protobuf.importPaths?.length) {
      config.protobuf.importPaths = jackpostConfig.protobuf.importPaths.map((p) => {
        const importPath: { path: string; disabled?: boolean } = { path: p.path };
        if (p.enabled === false) {
          importPath.disabled = true;
        }
        return importPath;
      });
    }
  }

  if (jackpostConfig.proxy) {
    config.proxy = {
      disabled: jackpostConfig.proxy.disabled,
      inherit: jackpostConfig.proxy.inherit,
      config: jackpostConfig.proxy.config
    };
  }

  if (jackpostConfig.clientCertificates?.certs?.length) {
    config.clientCertificates = jackpostConfig.clientCertificates.certs
      .map((cert): ClientCertificate | null => {
        if (cert.type === 'cert') {
          const pemCert: PemCertificate = {
            domain: cert.domain || '',
            type: 'pem',
            certificateFilePath: cert.certFilePath || '',
            privateKeyFilePath: cert.keyFilePath || ''
          };
          if (cert.passphrase) {
            pemCert.passphrase = cert.passphrase;
          }
          if (cert.disabled === true) {
            pemCert.disabled = true;
          }
          return pemCert;
        } else if (cert.type === 'pfx') {
          const pkcs12Cert: Pkcs12Certificate = {
            domain: cert.domain || '',
            type: 'pkcs12',
            pkcs12FilePath: cert.pfxFilePath || ''
          };
          if (cert.passphrase) {
            pkcs12Cert.passphrase = cert.passphrase;
          }
          if (cert.disabled === true) {
            pkcs12Cert.disabled = true;
          }
          return pkcs12Cert;
        }
        return null;
      })
      .filter((cert): cert is ClientCertificate => cert !== null);
  }

  return Object.keys(config).length > 0 ? config : undefined;
};

const hasRequestDefaults = (root: JackpostCollectionRoot | undefined): boolean => {
  const request = root?.request;
  return Boolean(
    request?.headers?.length ||
    request?.vars?.req?.length ||
    request?.vars?.res?.length ||
    request?.script?.req ||
    request?.script?.res ||
    request?.tests ||
    (request?.auth && request.auth.mode !== 'none')
  );
};

export const jackpostToOpenCollection = (collection: JackpostCollection): OpenCollection => {
  const jackpostConfig = collection.jackpostConfig as JackpostConfig | undefined;

  const collectionVersion = jackpostConfig?.version;
  const hasCollectionVersion = collectionVersion != null && collectionVersion !== '';

  const openCollection: OpenCollection = {
    opencollection: '1.0.0',
    info: {
      name: collection.name || 'Untitled Collection',
      ...(hasCollectionVersion ? { version: String(collectionVersion) } : {})
    }
  };

  const config = toOpenCollectionConfig(jackpostConfig);
  if (config) {
    openCollection.config = config;
  }

  const environments = toOpenCollectionEnvironments(collection.environments ?? undefined);
  if (environments?.length) {
    if (!openCollection.config) {
      openCollection.config = {};
    }
    openCollection.config.environments = environments;
  }

  const items = toOpenCollectionItems(collection.items, toOpenCollectionFolder);
  if (items.length) {
    openCollection.items = items as OpenCollection['items'];
  }

  if (hasRequestDefaults(collection.root as JackpostCollectionRoot)) {
    const request = (collection.root as JackpostCollectionRoot)?.request;
    openCollection.request = {};

    const headers = toOpenCollectionHeaders(request?.headers);
    if (headers) {
      openCollection.request.headers = headers;
    }

    const auth = toOpenCollectionAuth(request?.auth);
    if (auth) {
      openCollection.request.auth = auth;
    }

    const variables = toOpenCollectionVariables(request?.vars);
    if (variables) {
      openCollection.request.variables = variables;
    }

    const actions = toOpenCollectionActions(request?.vars?.res);
    if (actions) {
      openCollection.request.actions = actions;
    }
    // TODO: Widen scope to include GRPC scripts once Collection/Folder level inheritance is added to GRPC.
    const scripts = toOpenCollectionScripts(request as any, HTTP_SCRIPT_KEYS);
    if (scripts) {
      openCollection.request.scripts = scripts;
    }
  }

  if ((collection.root as JackpostCollectionRoot)?.docs) {
    openCollection.docs = {
      content: (collection.root as JackpostCollectionRoot).docs!,
      type: 'text/markdown'
    };
  }

  openCollection.bundled = true;

  const jackpostExtension: {
    ignore?: string[];
    presets?: JackpostPresets;
    soapEndpoints?: string[];
    scripts?: { flow?: 'sandwich' | 'sequential' };
    openapi?: JackpostConfig['openapi'];
  } = {};

  if (jackpostConfig?.ignore?.length) {
    jackpostExtension.ignore = jackpostConfig.ignore;
  }

  const presets = jackpostConfig?.presets;
  if (presets?.requestType || presets?.requestUrl || presets?.defaultEnvironment) {
    jackpostExtension.presets = {};
    if (presets.requestType) {
      jackpostExtension.presets.requestType = presets.requestType;
    }
    if (presets.requestUrl) {
      jackpostExtension.presets.requestUrl = presets.requestUrl;
    }
    if (presets.defaultEnvironment) {
      jackpostExtension.presets.defaultEnvironment = presets.defaultEnvironment;
    }
  }

  if (Array.isArray(jackpostConfig?.soapEndpoints) && jackpostConfig.soapEndpoints.length > 0) {
    jackpostExtension.soapEndpoints = jackpostConfig.soapEndpoints;
  }

  const scriptFlow = jackpostConfig?.scripts?.flow;
  if (scriptFlow === 'sandwich' || scriptFlow === 'sequential') {
    jackpostExtension.scripts = { flow: scriptFlow };
  }

  const openApiEntries = normalizeOpenApiSyncConfigs(jackpostConfig?.openapi);
  if (openApiEntries.length > 0) {
    jackpostExtension.openapi = openApiEntries;
  }

  if (Object.keys(jackpostExtension).length > 0) {
    openCollection.extensions = {
      jackpost: jackpostExtension
    };
  }

  return openCollection;
};