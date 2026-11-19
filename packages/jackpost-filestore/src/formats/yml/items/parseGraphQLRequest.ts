import type { Item as JackpostItem, HttpItemSettings as JackpostHttpItemSettings } from '@jackpost/schema-types/collection/item';
import type { HttpRequest as JackpostHttpRequest } from '@jackpost/schema-types/requests/http';
import type { GraphQLRequest, GraphQLRequestSettings, GraphQLBody } from '@opencollection/types/requests/graphql';
import { toJackpostAuth } from '../common/auth';
import { toJackpostHttpHeaders } from '../common/headers';
import { toJackpostParams } from '../common/params';
import { toJackpostVariables } from '../common/variables';
import { toJackpostPostResponseVariables } from '../common/actions';
import { toJackpostScripts } from '../common/scripts';
import { toJackpostAssertions } from '../common/assertions';
import { uuid, ensureString } from '../../../utils';
import { utils } from '@jackpost/common';
const { toBool, toMaxRedirects } = utils;

const parseGraphQLRequest = (ocRequest: GraphQLRequest): JackpostItem => {
  const info = ocRequest.info;
  const graphql = ocRequest.graphql;
  const runtime = ocRequest.runtime;

  const jackpostRequest: JackpostHttpRequest = {
    url: ensureString(graphql?.url),
    method: ensureString(graphql?.method, 'POST'),
    headers: toJackpostHttpHeaders(graphql?.headers) || [],
    params: toJackpostParams(graphql?.params) || [],
    auth: toJackpostAuth(graphql?.auth),
    body: {
      mode: 'graphql',
      json: null,
      text: null,
      xml: null,
      sparql: null,
      formUrlEncoded: [],
      multipartForm: [],
      graphql: {
        query: (graphql?.body as GraphQLBody)?.query || '',
        variables: (graphql?.body as GraphQLBody)?.variables || ''
      },
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

  // jackpost item
  const jackpostItem: JackpostItem = {
    uid: uuid(),
    type: 'graphql-request',
    seq: info?.seq || 1,
    name: ensureString(info?.name, 'Untitled Request'),
    tags: info?.tags || [],
    request: jackpostRequest,
    settings: null,
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

    jackpostItem.settings = settings;
  }

  return jackpostItem;
};

export default parseGraphQLRequest;
