const _ = require('lodash');
const { indentString, getValueString, getKeyString, getValueUrl, serializeVar, serializeAnnotations, buildAnnotationsFromKVItem } = require('./utils');
const jsonToExampleJp = require('./example/jsonToJp');

const enabled = (items = [], key = 'enabled') => items.filter((item) => item[key]);
const disabled = (items = [], key = 'enabled') => items.filter((item) => !item[key]);

// remove the last line if two new lines are found
const stripLastLine = (text) => {
  if (!text || !text.length) return text;

  return text.replace(/(\r?\n)$/, '');
};

const jsonToJp = (json) => {
  const { meta, http, grpc, ws, params, headers, metadata, auth, body, script, tests, vars, assertions, settings, app, docs, examples } = json;

  let jp = '';

  if (meta) {
    jp += 'meta {\n';

    const tags = meta.tags;
    delete meta.tags;

    for (const key in meta) {
      jp += `  ${key}: ${meta[key]}\n`;
    }

    if (tags && tags.length) {
      jp += `  tags: [\n`;
      for (const tag of tags) {
        jp += `    ${tag}\n`;
      }
      jp += `  ]\n`;
    }

    jp += '}\n\n';
  }

  if (http?.method) {
    const { method, url, body, auth } = http;
    const standardMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace', 'connect']);

    const isStandard = standardMethods.has(method);

    jp += isStandard ? `${method} {` : `http {\n  method: ${method}`;
    jp += `\n  url: ${getValueUrl(url)}`;

    if (body?.length) {
      jp += `\n  body: ${body}`;
    }

    if (auth?.length) {
      jp += `\n  auth: ${auth}`;
    }

    jp += `\n}\n\n`;
  }

  if (grpc && grpc.url) {
    jp += `grpc {
  url: ${grpc.url}`;

    if (grpc.method && grpc.method.length) {
      jp += `
  method: ${grpc.method}`;
    }

    if (grpc.body && grpc.body.length) {
      jp += `
  body: ${grpc.body}`;
    }

    if (grpc.protoPath && grpc.protoPath.length) {
      jp += `
  protoPath: ${grpc.protoPath}`;
    }

    if (grpc.auth && grpc.auth.length) {
      jp += `
  auth: ${grpc.auth}`;
    }

    if (grpc.methodType && grpc.methodType.length) {
      jp += `
  methodType: ${grpc.methodType}`;
    }

    jp += `
}

`;
  }

  if (ws && ws.url) {
    jp += `ws {
  url: ${ws.url}`;

    if (ws.body && ws.body.length) {
      jp += `
  body: ${ws.body}`;
    }

    if (ws.auth && ws.auth.length) {
      jp += `
  auth: ${ws.auth}`;
    }

    if (ws.methodType && ws.methodType.length) {
      jp += `
  methodType: ${ws.methodType}`;
    }

    jp += `
}

`;
  }

  if (params && params.length) {
    const queryParams = params.filter((param) => param.type === 'query');
    const pathParams = params.filter((param) => param.type === 'path');

    if (queryParams.length) {
      jp += 'params:query {';
      if (enabled(queryParams).length) {
        jp += `\n${indentString(
          enabled(queryParams)
            .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${getKeyString(item.name)}: ${getValueString(item.value)}`)
            .join('\n')
        )}`;
      }

      if (disabled(queryParams).length) {
        jp += `\n${indentString(
          disabled(queryParams)
            .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}~${getKeyString(item.name)}: ${getValueString(item.value)}`)
            .join('\n')
        )}`;
      }

      jp += '\n}\n\n';
    }

    if (pathParams.length) {
      jp += 'params:path {';

      jp += `\n${indentString(pathParams.map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.name}: ${getValueString(item.value)}`).join('\n'))}`;

      jp += '\n}\n\n';
    }
  }

  if (headers && headers.length) {
    jp += 'headers {';
    if (enabled(headers).length) {
      jp += `\n${indentString(
        enabled(headers)
          .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${getKeyString(item.name)}: ${getValueString(item.value)}`)
          .join('\n')
      )}`;
    }

    if (disabled(headers).length) {
      jp += `\n${indentString(
        disabled(headers)
          .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}~${getKeyString(item.name)}: ${getValueString(item.value)}`)
          .join('\n')
      )}`;
    }

    jp += '\n}\n\n';
  }

  if (metadata && metadata.length) {
    jp += 'metadata {';
    if (enabled(metadata).length) {
      jp += `\n${indentString(
        enabled(metadata)
          .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.name}: ${getValueString(item.value)}`)
          .join('\n')
      )}`;
    }

    if (disabled(metadata).length) {
      jp += `\n${indentString(
        disabled(metadata)
          .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}~${item.name}: ${getValueString(item.value)}`)
          .join('\n')
      )}`;
    }

    jp += '\n}\n\n';
  }

  if (auth && auth.awsv4) {
    jp += `auth:awsv4 {
${indentString(`accessKeyId: ${auth?.awsv4?.accessKeyId || ''}`)}
${indentString(`secretAccessKey: ${auth?.awsv4?.secretAccessKey || ''}`)}
${indentString(`sessionToken: ${auth?.awsv4?.sessionToken || ''}`)}
${indentString(`service: ${auth?.awsv4?.service || ''}`)}
${indentString(`region: ${auth?.awsv4?.region || ''}`)}
${indentString(`profileName: ${auth?.awsv4?.profileName || ''}`)}
}

`;
  }

  if (auth && auth.basic) {
    jp += `auth:basic {
${indentString(`username: ${auth?.basic?.username || ''}`)}
${indentString(`password: ${auth?.basic?.password || ''}`)}
}

`;
  }

  if (auth && auth.wsse) {
    jp += `auth:wsse {
${indentString(`username: ${auth?.wsse?.username || ''}`)}
${indentString(`password: ${auth?.wsse?.password || ''}`)}
}

`;
  }

  if (auth && auth.bearer) {
    jp += `auth:bearer {
${indentString(`token: ${auth?.bearer?.token || ''}`)}
}

`;
  }

  if (auth && auth.digest) {
    jp += `auth:digest {
${indentString(`username: ${auth?.digest?.username || ''}`)}
${indentString(`password: ${auth?.digest?.password || ''}`)}
}

`;
  }

  if (auth && auth.ntlm) {
    jp += `auth:ntlm {
${indentString(`username: ${auth?.ntlm?.username || ''}`)}
${indentString(`password: ${auth?.ntlm?.password || ''}`)}
${indentString(`domain: ${auth?.ntlm?.domain || ''}`)}

}

`;
  }

  if (auth && auth.oauth1) {
    jp += `auth:oauth1 {
${indentString(`consumer_key: ${auth?.oauth1?.consumerKey || ''}`)}
${indentString(`consumer_secret: ${auth?.oauth1?.consumerSecret || ''}`)}
${indentString(`access_token: ${auth?.oauth1?.accessToken || ''}`)}
${indentString(`token_secret: ${auth?.oauth1?.accessTokenSecret || ''}`)}
${indentString(`callback_url: ${auth?.oauth1?.callbackUrl || ''}`)}
${indentString(`verifier: ${auth?.oauth1?.verifier || ''}`)}
${indentString(`signature_method: ${auth?.oauth1?.signatureMethod || ''}`)}
${indentString(`private_key: ${auth?.oauth1?.privateKeyType === 'file' ? `@file(${auth?.oauth1?.privateKey || ''})` : getValueString(auth?.oauth1?.privateKey || '')}`)}
${indentString(`timestamp: ${auth?.oauth1?.timestamp || ''}`)}
${indentString(`nonce: ${auth?.oauth1?.nonce || ''}`)}
${indentString(`version: ${auth?.oauth1?.version || ''}`)}
${indentString(`realm: ${auth?.oauth1?.realm || ''}`)}
${indentString(`placement: ${auth?.oauth1?.placement || ''}`)}
${indentString(`include_body_hash: ${(auth?.oauth1?.includeBodyHash || false).toString()}`)}
}

`;
  }

  if (auth && auth.oauth2) {
    switch (auth?.oauth2?.grantType) {
      case 'password':
        jp += `auth:oauth2 {
${indentString(`grant_type: password`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ''}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ''}`)}
${indentString(`username: ${auth?.oauth2?.username || ''}`)}
${indentString(`password: ${auth?.oauth2?.password || ''}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ''}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ''}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ''}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ''}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ''}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || 'access_token'}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ''}`)}${
  auth?.oauth2?.tokenPlacement == 'header' ? '\n' + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ''}`) : ''
}${
  auth?.oauth2?.tokenPlacement !== 'header' ? '\n' + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ''}`) : ''
}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
        break;
      case 'authorization_code':
        jp += `auth:oauth2 {
${indentString(`grant_type: authorization_code`)}
${indentString(`callback_url: ${auth?.oauth2?.callbackUrl || ''}`)}
${indentString(`authorization_url: ${auth?.oauth2?.authorizationUrl || ''}`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ''}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ''}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ''}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ''}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ''}`)}
${indentString(`state: ${auth?.oauth2?.state || ''}`)}
${indentString(`pkce: ${(auth?.oauth2?.pkce || false).toString()}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ''}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ''}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || 'access_token'}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ''}`)}${
  auth?.oauth2?.tokenPlacement == 'header' ? '\n' + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ''}`) : ''
}${
  auth?.oauth2?.tokenPlacement !== 'header' ? '\n' + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ''}`) : ''
}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
        break;
      case 'client_credentials':
        jp += `auth:oauth2 {
${indentString(`grant_type: client_credentials`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ''}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ''}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ''}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ''}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ''}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ''}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ''}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || 'access_token'}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ''}`)}${
  auth?.oauth2?.tokenPlacement == 'header' ? '\n' + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ''}`) : ''
}${
  auth?.oauth2?.tokenPlacement !== 'header' ? '\n' + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ''}`) : ''
}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
        break;
      case 'implicit':
        jp += `auth:oauth2 {
${indentString(`grant_type: implicit`)}
${indentString(`callback_url: ${auth?.oauth2?.callbackUrl || ''}`)}
${indentString(`authorization_url: ${auth?.oauth2?.authorizationUrl || ''}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ''}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ''}`)}
${indentString(`state: ${auth?.oauth2?.state || ''}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ''}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || 'access_token'}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ''}`)}${
  auth?.oauth2?.tokenPlacement == 'header' ? '\n' + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ''}`) : ''
}${
  auth?.oauth2?.tokenPlacement !== 'header' ? '\n' + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ''}`) : ''
}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
}

`;
        break;
    }

    if (auth?.oauth2?.additionalParameters) {
      const { authorization: authorizationParams, token: tokenParams, refresh: refreshParams } = auth?.oauth2?.additionalParameters;
      const authorizationHeaders = authorizationParams?.filter((p) => p?.sendIn == 'headers');
      if (authorizationHeaders?.length) {
        jp += `auth:oauth2:additional_params:auth_req:headers {
${indentString(
  authorizationHeaders
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const authorizationQueryParams = authorizationParams?.filter((p) => p?.sendIn == 'queryparams');
      if (authorizationQueryParams?.length) {
        jp += `auth:oauth2:additional_params:auth_req:queryparams {
${indentString(
  authorizationQueryParams
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const tokenHeaders = tokenParams?.filter((p) => p?.sendIn == 'headers');
      if (tokenHeaders?.length) {
        jp += `auth:oauth2:additional_params:access_token_req:headers {
${indentString(
  tokenHeaders
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const tokenQueryParams = tokenParams?.filter((p) => p?.sendIn == 'queryparams');
      if (tokenQueryParams?.length) {
        jp += `auth:oauth2:additional_params:access_token_req:queryparams {
${indentString(
  tokenQueryParams
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const tokenBodyValues = tokenParams?.filter((p) => p?.sendIn == 'body');
      if (tokenBodyValues?.length) {
        jp += `auth:oauth2:additional_params:access_token_req:body {
${indentString(
  tokenBodyValues
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const refreshHeaders = refreshParams?.filter((p) => p?.sendIn == 'headers');
      if (refreshHeaders?.length) {
        jp += `auth:oauth2:additional_params:refresh_token_req:headers {
${indentString(
  refreshHeaders
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const refreshQueryParams = refreshParams?.filter((p) => p?.sendIn == 'queryparams');
      if (refreshQueryParams?.length) {
        jp += `auth:oauth2:additional_params:refresh_token_req:queryparams {
${indentString(
  refreshQueryParams
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
      const refreshBodyValues = refreshParams?.filter((p) => p?.sendIn == 'body');
      if (refreshBodyValues?.length) {
        jp += `auth:oauth2:additional_params:refresh_token_req:body {
${indentString(
  refreshBodyValues
    .filter((item) => item?.name?.length)
    .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.enabled ? '' : '~'}${getKeyString(item.name)}: ${getValueString(item.value)}`)
    .join('\n')
)}
}

`;
      }
    }
  }

  if (auth && auth.apikey) {
    jp += `auth:apikey {
${indentString(`key: ${auth?.apikey?.key || ''}`)}
${indentString(`value: ${auth?.apikey?.value || ''}`)}
${indentString(`placement: ${auth?.apikey?.placement || ''}`)}
}

`;
  }

  if (auth && auth.akamaiEdgegrid) {
    jp += `auth:akamai-edgegrid {
${indentString(`accessToken: ${auth?.akamaiEdgegrid?.accessToken || ''}`)}
${indentString(`clientToken: ${auth?.akamaiEdgegrid?.clientToken || ''}`)}
${indentString(`clientSecret: ${auth?.akamaiEdgegrid?.clientSecret || ''}`)}
${indentString(`nonce: ${auth?.akamaiEdgegrid?.nonce || ''}`)}
${indentString(`timestamp: ${auth?.akamaiEdgegrid?.timestamp || ''}`)}
${indentString(`baseURL: ${auth?.akamaiEdgegrid?.baseURL || ''}`)}
${indentString(`headersToSign: ${auth?.akamaiEdgegrid?.headersToSign || ''}`)}
${indentString(`maxBodySize: ${auth?.akamaiEdgegrid?.maxBodySize ?? ''}`)}
}

`;
  }

  if (body && body.json && body.json.length) {
    jp += `body:json {
${indentString(body.json)}
}

`;
  }

  if (body && body.text && body.text.length) {
    jp += `body:text {
${indentString(body.text)}
}

`;
  }

  if (body && body.xml && body.xml.length) {
    jp += `body:xml {
${indentString(body.xml)}
}

`;
  }

  if (body && body.sparql && body.sparql.length) {
    jp += `body:sparql {
${indentString(body.sparql)}
}

`;
  }

  if (body && body.formUrlEncoded && body.formUrlEncoded.length) {
    jp += `body:form-urlencoded {\n`;

    if (enabled(body.formUrlEncoded).length) {
      const enabledValues = enabled(body.formUrlEncoded)
        .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${getKeyString(item.name)}: ${getValueString(item.value)}`)
        .join('\n');
      jp += `${indentString(enabledValues)}\n`;
    }

    if (disabled(body.formUrlEncoded).length) {
      const disabledValues = disabled(body.formUrlEncoded)
        .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}~${getKeyString(item.name)}: ${getValueString(item.value)}`)
        .join('\n');
      jp += `${indentString(disabledValues)}\n`;
    }

    jp += '}\n\n';
  }

  if (body && body.multipartForm && body.multipartForm.length) {
    jp += `body:multipart-form {`;
    const multipartForms = enabled(body.multipartForm).concat(disabled(body.multipartForm));

    if (multipartForms.length) {
      jp += `\n${indentString(
        multipartForms
          .map((item) => {
            const enabledPrefix = item.enabled ? '' : '~';
            const contentType
              = item.contentType && item.contentType !== '' ? ' @contentType(' + item.contentType + ')' : '';
            const annotPrefix = serializeAnnotations(buildAnnotationsFromKVItem(item));
            if (item.type === 'text') {
              return `${annotPrefix}${enabledPrefix}${getKeyString(item.name)}: ${getValueString(item.value)}${contentType}`;
            }

            if (item.type === 'file') {
              const filepaths = (Array.isArray(item.value) ? item.value : []).filter(Boolean);
              const filestr = filepaths.join('|');

              const value = `@file(${filestr})`;
              return `${annotPrefix}${enabledPrefix}${getKeyString(item.name)}: ${value}${contentType}`;
            }
          })
          .join('\n')
      )}`;
    }

    jp += '\n}\n\n';
  }

  if (body && body.file && body.file.length) {
    jp += `body:file {`;
    const files = enabled(body.file, 'selected').concat(disabled(body.file, 'selected'));

    if (files.length) {
      jp += `\n${indentString(
        files
          .map((item) => {
            const selected = item.selected ? '' : '~';
            const contentType
              = item.contentType && item.contentType !== '' ? ' @contentType(' + item.contentType + ')' : '';
            const annotPrefix = serializeAnnotations(buildAnnotationsFromKVItem(item));
            const filePath = item.filePath || '';
            const value = `@file(${filePath})`;
            const itemName = 'file';
            return `${annotPrefix}${selected}${itemName}: ${value}${contentType}`;
          })
          .join('\n')
      )}`;
    }

    jp += '\n}\n\n';
  }

  if (body && body.graphql && body.graphql.query) {
    jp += `body:graphql {\n`;
    jp += `${indentString(body.graphql.query)}`;
    jp += '\n}\n\n';
  }

  if (body && body.graphql && body.graphql.variables) {
    jp += `body:graphql:vars {\n`;
    jp += `${indentString(body.graphql.variables)}`;
    jp += '\n}\n\n';
  }

  if (body && body.grpc) {
    // Convert each gRPC message to a separate body:grpc block
    if (Array.isArray(body.grpc)) {
      body.grpc.forEach((m) => {
        const { name, content } = m;

        jp += `body:grpc {\n`;

        jp += `${indentString(`name: ${getValueString(name)}`)}\n`;

        // Convert content to JSON string if it's an object
        let jsonValue = typeof content === 'object' ? JSON.stringify(content, null, 2) : content || '{}';

        // Wrap content with triple quotes for multiline support, without extra indentation
        jp += `${indentString(`content: '''\n${indentString(jsonValue)}\n'''`)}\n`;
        jp += '}\n\n';
      });
    }
  }

  if (body && body.ws) {
    // Convert each ws message to a separate body:ws block
    if (Array.isArray(body.ws)) {
      body.ws.forEach((message) => {
        const { name, content, type = '', selected } = message;

        jp += `body:ws {\n`;

        jp += `${indentString(`name: ${getValueString(name)}`)}\n`;
        if (type.length) {
          jp += `${indentString(`type: ${getValueString(type)}`)}\n`;
        }
        if (selected) {
          jp += `${indentString(`selected: true`)}\n`;
        }

        // Convert content to JSON string if it's an object
        let contentValue = typeof content === 'object' ? JSON.stringify(content, null, 2) : content || '';

        // Wrap content with triple quotes for multiline support, without extra indentation
        jp += `${indentString(`content: '''\n${indentString(contentValue)}\n'''`)}\n`;
        jp += '}\n\n';
      });
    }
  }

  let reqvars = _.get(vars, 'req');
  let resvars = _.get(vars, 'res');
  if (reqvars && reqvars.length) {
    const varsEnabled = _.filter(reqvars, (v) => v.enabled && !v.local);
    const varsDisabled = _.filter(reqvars, (v) => !v.enabled && !v.local);
    const varsLocalEnabled = _.filter(reqvars, (v) => v.enabled && v.local);
    const varsLocalDisabled = _.filter(reqvars, (v) => !v.enabled && v.local);

    jp += `vars:pre-request {`;

    if (varsEnabled.length) {
      jp += `\n${indentString(varsEnabled.map((item) => serializeVar(item)).join('\n'))}`;
    }

    if (varsLocalEnabled.length) {
      jp += `\n${indentString(varsLocalEnabled.map((item) => serializeVar(item, '@')).join('\n'))}`;
    }

    if (varsDisabled.length) {
      jp += `\n${indentString(varsDisabled.map((item) => serializeVar(item, '~')).join('\n'))}`;
    }

    if (varsLocalDisabled.length) {
      jp += `\n${indentString(varsLocalDisabled.map((item) => serializeVar(item, '~@')).join('\n'))}`;
    }

    jp += '\n}\n\n';
  }
  if (resvars && resvars.length) {
    const varsEnabled = _.filter(resvars, (v) => v.enabled && !v.local);
    const varsDisabled = _.filter(resvars, (v) => !v.enabled && !v.local);
    const varsLocalEnabled = _.filter(resvars, (v) => v.enabled && v.local);
    const varsLocalDisabled = _.filter(resvars, (v) => !v.enabled && v.local);

    jp += `vars:post-response {`;

    if (varsEnabled.length) {
      jp += `\n${indentString(varsEnabled.map((item) => serializeVar(item)).join('\n'))}`;
    }

    if (varsLocalEnabled.length) {
      jp += `\n${indentString(varsLocalEnabled.map((item) => serializeVar(item, '@')).join('\n'))}`;
    }

    if (varsDisabled.length) {
      jp += `\n${indentString(varsDisabled.map((item) => serializeVar(item, '~')).join('\n'))}`;
    }

    if (varsLocalDisabled.length) {
      jp += `\n${indentString(varsLocalDisabled.map((item) => serializeVar(item, '~@')).join('\n'))}`;
    }

    jp += '\n}\n\n';
  }

  if (assertions && assertions.length) {
    jp += `assert {`;

    if (enabled(assertions).length) {
      jp += `\n${indentString(
        enabled(assertions)
          .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}${item.name}: ${getValueString(item.value)}`)
          .join('\n')
      )}`;
    }

    if (disabled(assertions).length) {
      jp += `\n${indentString(
        disabled(assertions)
          .map((item) => `${serializeAnnotations(buildAnnotationsFromKVItem(item))}~${getKeyString(item.name)}: ${getValueString(item.value)}`)
          .join('\n')
      )}`;
    }

    jp += '\n}\n\n';
  }

  if (script && script.req && script.req.length) {
    jp += `script:pre-request {
${indentString(script.req)}
}

`;
  }

  if (script && script.res && script.res.length) {
    jp += `script:post-response {
${indentString(script.res)}
}

`;
  }

  if (script && script.beforeCallStart && script.beforeCallStart.length) {
    jp += `script:grpc:before-call-start {
${indentString(script.beforeCallStart)}
}

`;
  }

  if (script && script.beforeMessageSend && script.beforeMessageSend.length) {
    jp += `script:grpc:before-message-send {
${indentString(script.beforeMessageSend)}
}

`;
  }

  if (script && script.afterMessageReceive && script.afterMessageReceive.length) {
    jp += `script:grpc:after-message-receive {
${indentString(script.afterMessageReceive)}
}

`;
  }

  if (script && script.afterCallEnd && script.afterCallEnd.length) {
    jp += `script:grpc:after-call-end {
${indentString(script.afterCallEnd)}
}

`;
  }

  if (tests && tests.length) {
    jp += `tests {
${indentString(tests)}
}

`;
  }

  if (app && (app.enabled === true || (app.code && app.code.length))) {
    jp += `app {\n`;
    if (app.enabled === true) {
      jp += `  enabled: true\n`;
    }
    if (app.code && app.code.length) {
      jp += `  code: '''\n${indentString(app.code, 2)}\n  '''\n`;
    }
    jp += '}\n\n';
  }

  if (settings && Object.keys(settings).length) {
    const omitHeaders = settings.omitHeaders;
    const settingsWithoutOmitHeaders = { ...settings };
    delete settingsWithoutOmitHeaders.omitHeaders;

    const hasOmitHeaders = Array.isArray(omitHeaders) && omitHeaders.some((name) => name && String(name).trim().length);
    const hasOtherSettings = Object.keys(settingsWithoutOmitHeaders).length > 0;

    if (hasOmitHeaders || hasOtherSettings) {
      jp += 'settings {\n';

      for (const key in settingsWithoutOmitHeaders) {
        jp += `  ${key}: ${settingsWithoutOmitHeaders[key]}\n`;
      }

      if (hasOmitHeaders) {
        jp += `  omitHeaders: [\n`;
        for (const headerName of omitHeaders) {
          if (headerName && String(headerName).trim().length) {
            jp += `    ${String(headerName).trim()}\n`;
          }
        }
        jp += `  ]\n`;
      }

      jp += '}\n\n';
    }
  }

  if (docs && docs.length) {
    jp += `docs {
${indentString(docs)}
}

`;
  }

  if (examples && examples.length) {
    examples.forEach((example) => {
      const jpExample = jsonToExampleJp(example);
      jp += `example {\n${indentString(jpExample)}\n}\n\n`;
    });
  }

  return stripLastLine(jp);
};

module.exports = jsonToJp;
module.exports.jsonToExampleJp = jsonToExampleJp;

// alternative to writing the below code to avoid undefined
