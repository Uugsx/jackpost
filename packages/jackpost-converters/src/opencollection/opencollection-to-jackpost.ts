import { OpenCollection } from "@opencollection/types";
import { normalizeOpenApiSyncConfigs } from "@jackpost/common";
import { JackpostCollection, JackpostCollectionRoot, JackpostConfig, JackpostPresets, PemCertificate, Pkcs12Certificate } from "./types";
import { fromOpenCollectionActions, fromOpenCollectionAuth, fromOpenCollectionHeaders, fromOpenCollectionScripts, fromOpenCollectionVariables } from "./common";
import { uuid } from "../common";
import { fromOpenCollectionItems } from "./items";
import { fromOpenCollectionFolder } from "./folder";
import { fromOpenCollectionEnvironments } from "./environment";
import { HTTP_SCRIPT_KEYS } from '@jackpost/common';

const fromOpenCollectionConfig = (oc: OpenCollection): JackpostConfig => {
  const jackpostExtension = oc.extensions?.jackpost as {
    ignore?: string[];
    presets?: JackpostPresets;
    soapEndpoints?: string[];
    scripts?: { flow?: unknown };
    openapi?: JackpostConfig['openapi'];
  } | undefined;

  const ignoreList = jackpostExtension && Array.isArray(jackpostExtension.ignore)
    ? jackpostExtension.ignore
    : ['node_modules', '.git'];

  const jackpostConfig: JackpostConfig = {
    name: oc.info?.name || 'Untitled Collection',
    type: 'collection',
    ignore: ignoreList
  };

  if (oc.info?.version != null && oc.info.version !== '') {
    jackpostConfig.version = String(oc.info.version);
  }

  if (jackpostExtension?.presets?.requestType || jackpostExtension?.presets?.requestUrl || jackpostExtension?.presets?.defaultEnvironment) {
    jackpostConfig.presets = {};
    if (jackpostExtension.presets.requestType) {
      jackpostConfig.presets.requestType = jackpostExtension.presets.requestType;
    }
    if (jackpostExtension.presets.requestUrl) {
      jackpostConfig.presets.requestUrl = jackpostExtension.presets.requestUrl;
    }
    if (jackpostExtension.presets.defaultEnvironment) {
      jackpostConfig.presets.defaultEnvironment = jackpostExtension.presets.defaultEnvironment;
    }
  }

  if (Array.isArray(jackpostExtension?.soapEndpoints) && jackpostExtension.soapEndpoints.length > 0) {
    jackpostConfig.soapEndpoints = jackpostExtension.soapEndpoints.filter((e) => typeof e === 'string');
  }

  const scriptFlow = jackpostExtension?.scripts?.flow;
  if (scriptFlow === 'sandwich' || scriptFlow === 'sequential') {
    jackpostConfig.scripts = { flow: scriptFlow };
  }

  const openApiEntries = normalizeOpenApiSyncConfigs(jackpostExtension?.openapi);
  if (openApiEntries.length > 0) {
    jackpostConfig.openapi = openApiEntries;
  }

  const config = oc.config;
  if (!config) {
    return jackpostConfig;
  }

  if (config.protobuf) {
    jackpostConfig.protobuf = {
      protoFiles: config.protobuf.protoFiles?.map((f) => ({
        path: f.path
      })),
      importPaths: config.protobuf.importPaths?.map((p) => ({
        path: p.path,
        enabled: p.disabled !== true
      }))
    };
  }

  if (config.proxy) {
    jackpostConfig.proxy = {
      disabled: config.proxy.disabled,
      inherit: config.proxy.inherit,
      config: config.proxy.config
    };
  }

  if (config.clientCertificates?.length) {
    jackpostConfig.clientCertificates = {
      certs: config.clientCertificates.map((cert) => {
        const disabled = cert.disabled === true;
        if (cert.type === 'pem') {
          const pemCert = cert as PemCertificate;
          return {
            domain: pemCert.domain || '',
            type: 'cert' as const,
            certFilePath: pemCert.certificateFilePath || '',
            keyFilePath: pemCert.privateKeyFilePath || '',
            passphrase: pemCert.passphrase || '',
            ...(disabled && { disabled: true })
          };
        } else if (cert.type === 'pkcs12') {
          const pkcs12Cert = cert as Pkcs12Certificate;
          return {
            domain: pkcs12Cert.domain || '',
            type: 'pfx' as const,
            pfxFilePath: pkcs12Cert.pkcs12FilePath || '',
            passphrase: pkcs12Cert.passphrase || '',
            ...(disabled && { disabled: true })
          };
        }
        return null;
      }).filter((cert): cert is NonNullable<typeof cert> => cert !== null)
    };
  }

  return jackpostConfig;
};

const fromOpenCollectionRoot = (oc: OpenCollection): JackpostCollectionRoot => {
  const root: JackpostCollectionRoot = {};

  if (oc.request) {
    // TODO: Widen scope to include GRPC scripts once Collection/Folder level inheritance is added to GRPC.
    const scripts = fromOpenCollectionScripts(oc.request.scripts, HTTP_SCRIPT_KEYS);
    root.request = {
      headers: fromOpenCollectionHeaders(oc.request.headers),
      auth: fromOpenCollectionAuth(oc.request.auth),
      script: scripts?.script,
      vars: {
        ...fromOpenCollectionVariables(oc.request.variables),
        res: fromOpenCollectionActions(oc.request.actions)
      },
      tests: scripts?.tests
    };
  }

  if (oc.docs) {
    root.docs = typeof oc.docs === 'string'
      ? oc.docs
      : oc.docs.content || '';
  }

  root.meta = {
    name: oc.info?.name || 'Untitled Collection'
  };

  return root;
};

export const openCollectionToJackpost = (openCollection: OpenCollection): JackpostCollection => {
  const jackpostCollection: JackpostCollection = {
    uid: uuid(),
    name: openCollection.info?.name || 'Untitled Collection',
    version: '1',
    items: fromOpenCollectionItems(openCollection.items, (folder: unknown) => fromOpenCollectionFolder(folder as Parameters<typeof fromOpenCollectionFolder>[0])),
    environments: fromOpenCollectionEnvironments(openCollection.config?.environments),
    jackpostConfig: fromOpenCollectionConfig(openCollection) as Record<string, unknown>,
    root: fromOpenCollectionRoot(openCollection)
  };

  return jackpostCollection;
};