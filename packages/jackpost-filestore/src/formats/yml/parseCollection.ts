import type { OpenCollection } from '@opencollection/types';
import type { FolderRoot } from '@jackpost/schema-types/collection/folder';
import { normalizeOpenApiSyncConfigs } from '@jackpost/common';
import { parseYml } from './utils';
import { toJackpostAuth } from './common/auth';
import { toJackpostHttpHeaders } from './common/headers';
import { toJackpostVariables } from './common/variables';
import { toJackpostPostResponseVariables } from './common/actions';
import { toJackpostScripts } from './common/scripts';
import { ensureString } from '../../utils';
import type { JackpostPresetsExtension } from '../../types';

interface ParsedCollection {
  collectionRoot: FolderRoot;
  jackpostConfig: Record<string, any>;
}

const parseCollection = (ymlString: string): ParsedCollection => {
  try {
    const oc: OpenCollection = parseYml(ymlString);

    // jackpost config
    const jackpostConfig: Record<string, any> = {
      opencollection: oc.opencollection || '1.0.0',
      name: ensureString(oc.info?.name, 'Untitled Collection'),
      type: 'collection',
      ignore: []
    };

    if (oc.info?.version != null && oc.info.version !== '') {
      jackpostConfig.version = ensureString(oc.info.version, '');
    }

    const jackpostExtension = (oc.extensions as any)?.jackpost;
    if (jackpostExtension?.ignore && Array.isArray(jackpostExtension.ignore)) {
      jackpostConfig.ignore = jackpostExtension.ignore;
    }

    // presets
    if (jackpostExtension?.presets) {
      const presets = jackpostExtension.presets as JackpostPresetsExtension;
      if (presets.request || presets.defaultEnvironment) {
        jackpostConfig.presets = {
          requestType: presets.request?.type || '',
          requestUrl: presets.request?.url || ''
        };
        if (presets.defaultEnvironment) {
          jackpostConfig.presets.defaultEnvironment = presets.defaultEnvironment;
        }
      }
    }

    // jackpost-specific extensions
    const jackpostExtensions = oc.extensions?.jackpost as any;
    if (Array.isArray(jackpostExtensions?.scripts?.additionalContextRoots)) {
      const sanitizedRoots = jackpostExtensions.scripts.additionalContextRoots
        .filter((item: any) => typeof item === 'string');

      if (sanitizedRoots.length > 0) {
        jackpostConfig.scripts = {
          ...jackpostConfig.scripts,
          additionalContextRoots: sanitizedRoots
        };
      }
    }
    // scripts.flow controls collection/folder/request script execution order
    // ('sandwich' | 'sequential'); unrecognized values fall back to the runtime default.
    if (jackpostExtensions?.scripts?.flow === 'sandwich' || jackpostExtensions?.scripts?.flow === 'sequential') {
      jackpostConfig.scripts = {
        ...jackpostConfig.scripts,
        flow: jackpostExtensions.scripts.flow
      };
    }

    const openApiEntries = normalizeOpenApiSyncConfigs(jackpostExtensions?.openapi);
    if (openApiEntries.length > 0) {
      jackpostConfig.openapi = openApiEntries;
    }

    if (Array.isArray(jackpostExtensions?.soapEndpoints)) {
      const endpoints = jackpostExtensions.soapEndpoints.filter((e: any) => typeof e === 'string' && e);
      if (endpoints.length > 0) {
        (jackpostConfig as any).soapEndpoints = endpoints;
      }
    }
    if (typeof jackpostExtensions?.wsdl?.sourceUrl === 'string' && jackpostExtensions.wsdl.sourceUrl) {
      (jackpostConfig as any).wsdl = { sourceUrl: jackpostExtensions.wsdl.sourceUrl };
    }

    // protobuf
    if (oc.config?.protobuf) {
      jackpostConfig.protobuf = {
        protoFiles: oc.config.protobuf.protoFiles?.map((protoFile: any) => ({
          path: protoFile.path
        })) || [],
        importPaths: oc.config.protobuf.importPaths?.map((importPath: any) => ({
          path: importPath.path,
          enabled: importPath.disabled !== true
        })) || []
      };
    }

    // proxy - only support newer format
    // Default: inherit from global preferences
    jackpostConfig.proxy = {
      inherit: true,
      config: {
        protocol: 'http',
        hostname: '',
        port: '',
        auth: {
          username: '',
          password: ''
        },
        bypassProxy: ''
      }
    };

    if (oc.config?.proxy && typeof oc.config.proxy === 'object') {
      // Validate newer format: must have 'inherit' and 'config' properties
      const proxyConfig = oc.config.proxy as any;

      if ('inherit' in proxyConfig && typeof proxyConfig.inherit === 'boolean' && proxyConfig.config && typeof proxyConfig.config === 'object') {
        // Valid newer format
        jackpostConfig.proxy = {
          inherit: proxyConfig.inherit,
          config: {
            protocol: proxyConfig.config.protocol || 'http',
            hostname: proxyConfig.config.hostname || '',
            port: proxyConfig.config.port || '',
            auth: {
              username: proxyConfig.config.auth?.username || '',
              password: proxyConfig.config.auth?.password || ''
            },
            bypassProxy: proxyConfig.config.bypassProxy || ''
          }
        };

        // Handle optional disabled field
        if (proxyConfig.disabled === true) {
          jackpostConfig.proxy.disabled = true;
        }

        // Handle optional auth.disabled field
        if (proxyConfig.config.auth?.disabled === true) {
          jackpostConfig.proxy.config.auth.disabled = true;
        }
      }
      // If not in newer format, use default (inherit: true)
    }

    // client certificates
    if (oc.config?.clientCertificates?.length) {
      jackpostConfig.clientCertificates = {
        certs: oc.config.clientCertificates.map((cert: any) => {
          if (cert.type === 'pem') {
            return {
              domain: cert.domain,
              type: 'cert',
              certFilePath: cert.certificateFilePath,
              keyFilePath: cert.privateKeyFilePath,
              passphrase: cert.passphrase || '',
              ...(cert.disabled === true && { disabled: true })
            };
          } else if (cert.type === 'pkcs12') {
            return {
              domain: cert.domain,
              type: 'pfx',
              pfxFilePath: cert.pkcs12FilePath,
              passphrase: cert.passphrase || '',
              ...(cert.disabled === true && { disabled: true })
            };
          }
          return null;
        }).filter((cert: any) => cert !== null)
      };
    }

    // collection root
    const collectionRoot: FolderRoot = {
      meta: null,
      request: null,
      docs: null
    };

    // request defaults
    if (oc.request) {
      collectionRoot.request = {
        headers: null,
        auth: null,
        script: {
          req: null,
          res: null
        },
        vars: {
          req: [],
          res: []
        },
        tests: null
      };

      // headers
      const headers = toJackpostHttpHeaders(oc.request.headers);
      collectionRoot.request.headers = headers || [];

      // auth
      const auth = toJackpostAuth(oc.request.auth);
      if (auth) {
        collectionRoot.request.auth = auth;
      }

      // variables
      const variables = toJackpostVariables(oc.request.variables);
      const postResponseVars = toJackpostPostResponseVariables((oc.request as any).actions);
      collectionRoot.request.vars = {
        req: variables.req,
        res: postResponseVars
      };

      // scripts
      const scripts = toJackpostScripts(oc.request.scripts);
      if (scripts?.script && collectionRoot.request.script) {
        if (scripts.script.req) {
          collectionRoot.request.script.req = scripts.script.req;
        }
        if (scripts.script.res) {
          collectionRoot.request.script.res = scripts.script.res;
        }
      }
      if (scripts?.tests) {
        collectionRoot.request.tests = scripts.tests;
      }
    }

    // docs
    if (oc.docs) {
      if (typeof oc.docs === 'string') {
        collectionRoot.docs = oc.docs;
      } else if (typeof oc.docs === 'object' && oc.docs.content) {
        collectionRoot.docs = oc.docs.content;
      }
    }

    return {
      collectionRoot,
      jackpostConfig
    };
  } catch (error) {
    console.error('Error parsing collection:', error);
    throw error;
  }
};

export default parseCollection;
