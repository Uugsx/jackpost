import type { OpenCollection } from '@opencollection/types';
import type { ProtoFileItem, ProtoFileImportPath } from '@opencollection/types/config/protobuf';
import type { HttpRequestHeader } from '@opencollection/types/requests/http';
import type { ClientCertificate, PemCertificate, Pkcs12Certificate } from '@opencollection/types/config/certificates';
import type { Variable } from '@opencollection/types/common/variables';
import type { Action } from '@opencollection/types/common/actions';
import type { Scripts } from '@opencollection/types/common/scripts';
import { normalizeOpenApiSyncConfigs } from '@jackpost/common';
import { stringifyYml } from './utils';
import { toOpenCollectionAuth } from './common/auth';
import { toOpenCollectionHttpHeaders } from './common/headers';
import { toOpenCollectionVariables } from './common/variables';
import { toOpenCollectionActions } from './common/actions';
import { toOpenCollectionScripts } from './common/scripts';
import type { Auth } from '@opencollection/types/common/auth';
import { HTTP_SCRIPT_KEYS } from '@jackpost/common';

const hasCollectionConfig = (jackpostConfig: any): boolean => {
  // protobuf
  const hasProtobuf = (
    jackpostConfig.protobuf?.protoFiles?.length > 0
    || jackpostConfig.protobuf?.importPaths?.length > 0
  );

  // proxy - check if proxy is configured in newer format
  // Valid newer format: has 'inherit' property and 'config' object
  const isValidProxyFormat = jackpostConfig.proxy
    && typeof jackpostConfig.proxy === 'object'
    && 'inherit' in jackpostConfig.proxy
    && jackpostConfig.proxy.config
    && typeof jackpostConfig.proxy.config === 'object';

  const hasProxy = isValidProxyFormat;

  // client certificates
  const hasClientCertificates = jackpostConfig.clientCertificates?.certs?.length > 0;

  return hasProtobuf || hasProxy || hasClientCertificates;
};

const hasRequestDefaults = (collectionRoot: any): boolean => {
  const requestRoot = collectionRoot?.request;

  return Boolean((requestRoot?.headers?.length)
    || (requestRoot?.vars?.req?.length)
    || (requestRoot?.vars?.res?.length)
    || hasRequestScripts(collectionRoot)
    || hasRequestAuth(collectionRoot));
};

const hasRequestAuth = (collectionRoot: any): boolean => {
  const reqAuthMode = collectionRoot?.request?.auth?.mode;
  return Boolean(reqAuthMode && reqAuthMode !== 'none');
};

const hasRequestScripts = (collectionRoot: any): boolean => {
  if (!collectionRoot?.request) return false;

  return (collectionRoot.request.script?.req)
    || (collectionRoot.request.script?.res)
    || (collectionRoot.request.tests);
};

const hasPresets = (jackpostConfig: any): boolean => {
  return jackpostConfig?.presets?.requestType?.length
    || jackpostConfig?.presets?.requestUrl?.length
    || jackpostConfig?.presets?.defaultEnvironment?.length;
};

const stringifyCollection = (collectionRoot: any, jackpostConfig: any): string => {
  try {
    const oc: OpenCollection = {};

    oc.opencollection = '1.0.0';
    oc.info = {
      name: jackpostConfig.name || 'Untitled Collection'
    };

    if (jackpostConfig.version != null && jackpostConfig.version !== '') {
      oc.info.version = String(jackpostConfig.version);
    }

    // collection config
    if (hasCollectionConfig(jackpostConfig)) {
      oc.config = {};

      if (jackpostConfig.protobuf?.protoFiles?.length || jackpostConfig.protobuf?.importPaths?.length) {
        oc.config.protobuf = {};

        if (jackpostConfig.protobuf.protoFiles?.length) {
          oc.config.protobuf.protoFiles = jackpostConfig.protobuf.protoFiles.map((protoFile: any): ProtoFileItem => ({
            type: 'file' as const,
            path: protoFile.path
          }));
        }

        if (jackpostConfig.protobuf.importPaths?.length) {
          oc.config.protobuf.importPaths = jackpostConfig.protobuf.importPaths.map((importPath: any): ProtoFileImportPath => {
            const item: ProtoFileImportPath = { path: importPath.path };
            if (importPath.enabled === false) {
              item.disabled = true;
            }
            return item;
          });
        }
      }

      // proxy - only write newer format
      // Validate that jackpostConfig.proxy is in newer format before writing
      const isValidProxyFormat = jackpostConfig.proxy
        && typeof jackpostConfig.proxy === 'object'
        && 'inherit' in jackpostConfig.proxy
        && jackpostConfig.proxy.config
        && typeof jackpostConfig.proxy.config === 'object';

      if (isValidProxyFormat) {
        oc.config.proxy = {
          inherit: jackpostConfig.proxy.inherit,
          config: {
            protocol: jackpostConfig.proxy.config.protocol || 'http',
            hostname: jackpostConfig.proxy.config.hostname || '',
            port: jackpostConfig.proxy.config.port || '',
            auth: {
              username: jackpostConfig.proxy.config.auth?.username || '',
              password: jackpostConfig.proxy.config.auth?.password || ''
            },
            bypassProxy: jackpostConfig.proxy.config.bypassProxy || ''
          }
        };

        // Add optional disabled field if true
        if (jackpostConfig.proxy.disabled === true) {
          oc.config.proxy.disabled = true;
        }

        // Add optional auth.disabled field if true
        if (jackpostConfig.proxy.config?.auth?.disabled === true) {
          if (oc.config.proxy.config && oc.config.proxy.config.auth) {
            oc.config.proxy.config.auth.disabled = true;
          }
        }
      }

      // client certificates
      if (jackpostConfig.clientCertificates?.certs?.length) {
        oc.config.clientCertificates = jackpostConfig.clientCertificates.certs
          .map((cert: any): ClientCertificate | null => {
            if (cert.type === 'cert') {
              const pemCert: PemCertificate = {
                domain: cert.domain,
                type: 'pem',
                certificateFilePath: cert.certFilePath,
                privateKeyFilePath: cert.keyFilePath,
                ...(cert.passphrase && { passphrase: cert.passphrase }),
                ...(cert.disabled === true && { disabled: true })
              };
              return pemCert;
            } else if (cert.type === 'pfx') {
              const pkcs12Cert: Pkcs12Certificate = {
                domain: cert.domain,
                type: 'pkcs12',
                pkcs12FilePath: cert.pfxFilePath,
                ...(cert.passphrase && { passphrase: cert.passphrase }),
                ...(cert.disabled === true && { disabled: true })
              };
              return pkcs12Cert;
            } else {
              // Unsupported certificate type - ignore silently
              return null;
            }
          })
          .filter((cert: ClientCertificate | null): cert is ClientCertificate => cert !== null);
      }
    }

    // request defaults
    if (hasRequestDefaults(collectionRoot)) {
      oc.request = {};

      // headers
      if (collectionRoot.request?.headers?.length) {
        const ocHeaders: HttpRequestHeader[] | undefined = toOpenCollectionHttpHeaders(collectionRoot.request?.headers);
        if (ocHeaders) {
          oc.request.headers = ocHeaders;
        }
      }

      // auth
      if (hasRequestAuth(collectionRoot)) {
        const ocAuth: Auth | undefined = toOpenCollectionAuth(collectionRoot.request?.auth);
        if (ocAuth) {
          oc.request.auth = ocAuth;
        }
      }

      // variables
      if (collectionRoot.request?.vars?.req?.length) {
        const ocVariables: Variable[] | undefined = toOpenCollectionVariables(collectionRoot.request?.vars);
        if (ocVariables) {
          oc.request.variables = ocVariables;
        }
      }

      // actions (post-response variables)
      if (collectionRoot.request?.vars?.res?.length) {
        const ocActions: Action[] | undefined = toOpenCollectionActions(collectionRoot.request?.vars?.res);
        if (ocActions) {
          (oc.request as any).actions = ocActions;
        }
      }

      // scripts
      if (hasRequestScripts(collectionRoot)) {
        // TODO: Widen scope to include GRPC scripts once Collection/Folder level inheritance is added to gRPC.
        const ocScripts: Scripts | undefined = toOpenCollectionScripts(collectionRoot.request, HTTP_SCRIPT_KEYS);
        if (ocScripts) {
          oc.request.scripts = ocScripts;
        }
      }
    }

    // docs
    if (collectionRoot?.docs?.trim().length) {
      oc.docs = {
        content: collectionRoot.docs,
        type: 'text/markdown'
      };
    }

    // bundled
    oc.bundled = false;

    // extensions
    oc.extensions = {};

    const hasJackpostExtensions = jackpostConfig.ignore?.length || hasPresets(jackpostConfig);

    if (hasJackpostExtensions) {
      const jackpostExtension: any = {};

      if (jackpostConfig.ignore?.length) {
        const ignoreList: string[] = [];
        jackpostConfig.ignore.forEach((ignore: string) => {
          ignoreList.push(ignore);
        });
        jackpostExtension.ignore = ignoreList;
      }

      if (hasPresets(jackpostConfig)) {
        const presetsExtension: any = {};
        const presetsRequest: any = {};
        if (jackpostConfig.presets.requestType?.length) {
          presetsRequest.type = jackpostConfig.presets.requestType;
        }
        if (jackpostConfig.presets.requestUrl?.length) {
          presetsRequest.url = jackpostConfig.presets.requestUrl;
        }
        if (Object.keys(presetsRequest).length) {
          presetsExtension.request = presetsRequest;
        }
        if (jackpostConfig.presets.defaultEnvironment?.length) {
          presetsExtension.defaultEnvironment = jackpostConfig.presets.defaultEnvironment;
        }
        jackpostExtension.presets = presetsExtension;
      }

      oc.extensions.jackpost = jackpostExtension;
    }

    // jackpost-specific script extensions
    const jackpostScripts: Record<string, unknown> = {};
    if (jackpostConfig.scripts?.additionalContextRoots?.length) {
      jackpostScripts.additionalContextRoots = jackpostConfig.scripts.additionalContextRoots;
    }
    if (jackpostConfig.scripts?.flow === 'sandwich' || jackpostConfig.scripts?.flow === 'sequential') {
      jackpostScripts.flow = jackpostConfig.scripts.flow;
    }
    if (Object.keys(jackpostScripts).length > 0) {
      if (!oc.extensions.jackpost) {
        oc.extensions.jackpost = {};
      }
      (oc.extensions.jackpost as any).scripts = jackpostScripts;
    }

    // jackpost-specific extensions
    const openApiEntries = normalizeOpenApiSyncConfigs(jackpostConfig.openapi);
    if (openApiEntries.length > 0) {
      if (!oc.extensions.jackpost) {
        oc.extensions.jackpost = {};
      }
      (oc.extensions.jackpost as any).openapi = openApiEntries;
    }

    const soapEndpoints = (jackpostConfig as any).soapEndpoints;
    if (Array.isArray(soapEndpoints) && soapEndpoints.length > 0) {
      if (!oc.extensions.jackpost) {
        oc.extensions.jackpost = {};
      }
      (oc.extensions.jackpost as any).soapEndpoints = soapEndpoints;
    }

    const wsdlSourceUrl = (jackpostConfig as any).wsdl?.sourceUrl;
    if (typeof wsdlSourceUrl === 'string' && wsdlSourceUrl) {
      if (!oc.extensions.jackpost) {
        oc.extensions.jackpost = {};
      }
      (oc.extensions.jackpost as any).wsdl = { sourceUrl: wsdlSourceUrl };
    }

    return stringifyYml(oc);
  } catch (error) {
    console.error('Error stringifying opencollection.yml:', error);
    throw error;
  }
};

export default stringifyCollection;
