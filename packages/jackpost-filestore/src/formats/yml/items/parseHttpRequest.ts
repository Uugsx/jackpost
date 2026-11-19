import type { Item as JackpostItem, HttpItemSettings as JackpostHttpItemSettings } from '@jackpost/schema-types/collection/item';
import type { HttpRequest as JackpostHttpRequest } from '@jackpost/schema-types/requests/http';
import type { HttpRequest, HttpRequestBody } from '@opencollection/types/requests/http';
import { toJackpostAuth } from '../common/auth';
import { toJackpostHttpHeaders } from '../common/headers';
import { toJackpostParams } from '../common/params';
import { toJackpostBody } from '../common/body';
import { toJackpostVariables } from '../common/variables';
import { toJackpostPostResponseVariables } from '../common/actions';
import { toJackpostScripts } from '../common/scripts';
import { toJackpostAssertions } from '../common/assertions';
import { toJackpostApp } from '../common/app';
import { normalizeOmitHeaders } from '../common/omit-headers';
import { uuid, ensureString } from '../../../utils';
import { utils } from '@jackpost/common';
const { toBool, toMaxRedirects } = utils;

const parseHttpRequest = (ocRequest: HttpRequest): JackpostItem => {
  const info = ocRequest.info;
  const http = ocRequest.http;
  const runtime = ocRequest.runtime;

  const jackpostRequest: JackpostHttpRequest = {
    url: ensureString(http?.url),
    method: ensureString(http?.method, 'GET'),
    headers: toJackpostHttpHeaders(http?.headers) || [],
    params: toJackpostParams(http?.params) || [],
    auth: toJackpostAuth(http?.auth),
    body: toJackpostBody(http?.body as HttpRequestBody) || {
      mode: 'none',
      json: null,
      text: null,
      xml: null,
      sparql: null,
      formUrlEncoded: [],
      multipartForm: [],
      graphql: null,
      file: []
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

  // variables (pre-request from variables, post-response from actions)
  const variables = toJackpostVariables(runtime?.variables);
  const postResponseVars = toJackpostPostResponseVariables(runtime?.actions);
  jackpostRequest.vars = {
    req: variables.req,
    res: postResponseVars
  };

  // assertions
  const assertions = toJackpostAssertions(runtime?.assertions);
  if (assertions) {
    jackpostRequest.assertions = assertions;
  }

  // docs
  if (ocRequest.docs) {
    jackpostRequest.docs = ocRequest.docs;
  }

  // app
  const app = toJackpostApp((ocRequest as any).app);

  // jackpost item
  const jackpostItem: JackpostItem = {
    uid: uuid(),
    type: 'http-request',
    seq: info?.seq || 1,
    name: ensureString(info?.name, 'Untitled Request'),
    tags: info?.tags || [],
    request: jackpostRequest,
    settings: null,
    app,
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

  // settings
  if (ocRequest.settings) {
    const settings: JackpostHttpItemSettings = {};

    settings.encodeUrl = toBool(ocRequest.settings.encodeUrl, true);

    if (typeof ocRequest.settings.timeout === 'number') {
      settings.timeout = ocRequest.settings.timeout;
    } else if (ocRequest.settings.timeout === 'inherit') {
      settings.timeout = 'inherit';
    } else {
      settings.timeout = 0;
    }

    settings.followRedirects = toBool(ocRequest.settings.followRedirects, true);
    settings.maxRedirects = toMaxRedirects(ocRequest.settings.maxRedirects);
    settings.forwardAuthorizationHeader = toBool(ocRequest.settings.forwardAuthorizationHeader, true);

    const omitHeaders = normalizeOmitHeaders(ocRequest.settings.omitHeaders);
    if (omitHeaders) {
      settings.omitHeaders = omitHeaders;
    }

    jackpostItem.settings = settings;
  }

  // examples
  if (ocRequest.examples?.length) {
    jackpostItem.examples = ocRequest.examples.map((example) => {
      const jackpostExample: any = {
        uid: uuid(),
        itemUid: uuid(),
        name: ensureString(example.name, 'Untitled Example'),
        type: 'http-request',
        request: null,
        response: null
      };

      if (example.description) {
        if (typeof example.description === 'string' && example.description.trim().length) {
          jackpostExample.description = example.description;
        } else if (typeof example.description === 'object' && example.description.content?.trim().length) {
          jackpostExample.description = example.description.content;
        }
      }

      if (example.request) {
        jackpostExample.request = {
          url: ensureString(example.request.url),
          method: ensureString(example.request.method, 'GET'),
          headers: toJackpostHttpHeaders(example.request.headers) || [],
          params: toJackpostParams(example.request.params) || [],
          body: toJackpostBody(example.request.body) || {
            mode: 'none',
            json: null,
            text: null,
            xml: null,
            sparql: null,
            formUrlEncoded: null,
            multipartForm: null,
            graphql: null,
            file: null
          }
        };
      }

      if (example.response) {
        jackpostExample.response = {
          status: typeof example.response.status === 'number' ? example.response.status
            : example.response.status !== undefined ? Number(example.response.status) : null,
          statusText: example.response.statusText || null,
          headers: toJackpostHttpHeaders(example.response.headers) || [],
          body: null
        };

        if (example.response.body) {
          jackpostExample.response.body = {
            type: example.response.body.type || 'text',
            content: example.response.body.data || ''
          };
        }
      }

      return jackpostExample;
    });
  }

  return jackpostItem;
};

export default parseHttpRequest;
