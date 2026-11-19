import type { Item as JackpostItem, HttpItemSettings as JackpostHttpItemSettings } from '@jackpost/schema-types/collection/item';
import type { HttpRequest as JackpostHttpRequest } from '@jackpost/schema-types/requests/http';
import type { GraphQLRequest, GraphQLRequestSettings, GraphQLBody, GraphQLRequestInfo, GraphQLRequestDetails, GraphQLRequestRuntime } from '@opencollection/types/requests/graphql';
import type { Auth } from '@opencollection/types/common/auth';
import type { Scripts } from '@opencollection/types/common/scripts';
import type { Variable } from '@opencollection/types/common/variables';
import type { Assertion } from '@opencollection/types/common/assertions';
import type { Action } from '@opencollection/types/common/actions';
import type { HttpRequestParam, HttpRequestHeader } from '@opencollection/types/requests/http';
import { stringifyYml } from '../utils';
import { isNonEmptyString } from '../../../utils';
import { toOpenCollectionAuth } from '../common/auth';
import { toOpenCollectionHttpHeaders } from '../common/headers';
import { toOpenCollectionParams } from '../common/params';
import { toOpenCollectionVariables } from '../common/variables';
import { toOpenCollectionActions } from '../common/actions';
import { toOpenCollectionScripts } from '../common/scripts';
import { toOpenCollectionAssertions } from '../common/assertions';
import { resolveTimeoutSetting, toMaxRedirects } from '@jackpost/common/utils';
import { HTTP_SCRIPT_KEYS } from '@jackpost/common';

const stringifyGraphQLRequest = (item: JackpostItem): string => {
  try {
    const ocRequest: GraphQLRequest = {};
    const jackpostRequest = item.request as JackpostHttpRequest;

    // info block
    const info: GraphQLRequestInfo = {
      name: isNonEmptyString(item.name) ? item.name : 'Untitled Request',
      type: 'graphql'
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

    // graphql block
    const graphql: GraphQLRequestDetails = {
      method: isNonEmptyString(jackpostRequest.method) ? jackpostRequest.method : 'POST',
      url: isNonEmptyString(jackpostRequest.url) ? jackpostRequest.url : ''
    };

    // headers
    const headers: HttpRequestHeader[] | undefined = toOpenCollectionHttpHeaders(jackpostRequest.headers);
    if (headers) {
      graphql.headers = headers;
    }

    // params
    const params: HttpRequestParam[] | undefined = toOpenCollectionParams(jackpostRequest.params);
    if (params) {
      graphql.params = params;
    }

    // body
    if (jackpostRequest.body?.mode === 'graphql' && jackpostRequest.body.graphql) {
      const graphqlBody: GraphQLBody = {};
      let hasBody = false;

      if (isNonEmptyString(jackpostRequest.body.graphql.query)) {
        graphqlBody.query = jackpostRequest.body.graphql.query;
        hasBody = true;
      }

      if (isNonEmptyString(jackpostRequest.body.graphql.variables)) {
        graphqlBody.variables = jackpostRequest.body.graphql.variables;
        hasBody = true;
      }

      if (hasBody) {
        graphql.body = graphqlBody;
      }
    }

    // auth (in graphql block, not runtime)
    const auth: Auth | undefined = toOpenCollectionAuth(jackpostRequest.auth);
    if (auth) {
      graphql.auth = auth;
    }

    ocRequest.graphql = graphql;

    // runtime block
    const runtime: GraphQLRequestRuntime = {};
    let hasRuntime = false;

    // variables
    const variables: Variable[] | undefined = toOpenCollectionVariables(jackpostRequest.vars);
    if (variables) {
      runtime.variables = variables;
      hasRuntime = true;
    }

    // scripts
    const scripts: Scripts | undefined = toOpenCollectionScripts(jackpostRequest, HTTP_SCRIPT_KEYS);
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

    // actions (from post-response variables)
    const resVars = jackpostRequest.vars?.res;
    const actions: Action[] | undefined = toOpenCollectionActions(resVars);
    if (actions) {
      runtime.actions = actions;
      hasRuntime = true;
    }

    if (hasRuntime) {
      ocRequest.runtime = runtime;
    }

    // settings
    const httpSettings = item.settings as JackpostHttpItemSettings | undefined;
    const settings: GraphQLRequestSettings = {};
    if (httpSettings?.encodeUrl === true) {
      settings.encodeUrl = true;
    } else if (httpSettings?.encodeUrl === false) {
      settings.encodeUrl = false;
    } else {
      settings.encodeUrl = true;
    }

    settings.timeout = resolveTimeoutSetting(httpSettings?.timeout);

    if (httpSettings?.followRedirects === true) {
      settings.followRedirects = true;
    } else if (httpSettings?.followRedirects === false) {
      settings.followRedirects = false;
    } else {
      settings.followRedirects = true;
    }

    settings.maxRedirects = toMaxRedirects(httpSettings?.maxRedirects);

    settings.forwardAuthorizationHeader = httpSettings?.forwardAuthorizationHeader ?? true;

    ocRequest.settings = settings;

    // docs
    if (isNonEmptyString(jackpostRequest.docs)) {
      ocRequest.docs = jackpostRequest.docs;
    }

    return stringifyYml(ocRequest);
  } catch (error) {
    console.error('Error stringifying GraphQL request:', error);
    throw error;
  }
};

export default stringifyGraphQLRequest;
