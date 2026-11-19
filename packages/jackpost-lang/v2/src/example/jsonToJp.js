const { indentString, getValueString } = require('../utils');

// remove the last line if two new lines are found
const stripLastLine = (text) => {
  if (!text || !text.length) return text;

  return text.replace(/(\r?\n)$/, '');
};

const quoteKey = (key) => {
  const quotableChars = [':', '"', '{', '}', ' '];
  return quotableChars.some((char) => key.includes(char)) ? ('"' + key.replaceAll('"', '\\"') + '"') : key;
};

// Custom indentation function for proper spacing
const indentStringCustom = (str, spaces = 4) => {
  if (!str || !str.length) {
    return str || '';
  }

  const indent = ' '.repeat(spaces);
  return str
    .split(/\r\n|\r|\n/)
    .map((line) => indent + line)
    .join('\n');
};

// Convert JSON to example JP format with proper colon syntax
const jsonToExampleJp = (json) => {
  const { name, description, request, response } = json;
  const { url, method, params, headers, body } = request || {};
  const { headers: responseHeaders, status: responseStatus, statusText: responseStatusText, body: responseBody } = response || {};

  let jp = '';

  if (name) {
    jp += `name: ${name}\n`;
  }

  if (description) {
    const descriptionValue = getValueString(description);
    jp += `description: ${descriptionValue}\n`;
  }

  // Request block
  jp += '\nrequest: {\n';

  jp += `  url: ${url}\n`;

  jp += `  method: ${method}\n`;

  // Add mode field inside request block, right after method
  if (request && request.body && request.body.mode) {
    jp += `  mode: ${request.body.mode}\n`;
  }

  if (params && params.length) {
    const queryParams = params.filter((param) => param.type === 'query');
    const pathParams = params.filter((param) => param.type === 'path');

    if (queryParams.length) {
      jp += '  params:query: {\n';
      jp += `${indentStringCustom(queryParams
        .map((item) => `${item.enabled ? '' : '~'}${quoteKey(item.name)}: ${item.value}`)
        .join('\n'), 4)}`;
      jp += '\n  }\n\n';
    }

    if (pathParams.length) {
      jp += '  params:path: {\n';
      jp += `${indentStringCustom(pathParams
        .map((item) => `${item.enabled ? '' : '~'}${quoteKey(item.name)}: ${item.value}`)
        .join('\n'), 4)}`;
      jp += '\n  }\n\n';
    }
  }

  if (headers && headers.length) {
    jp += '  headers: {\n';
    jp += `${indentStringCustom(headers
      .map((item) => `${item.enabled ? '' : '~'}${quoteKey(item.name)}: ${item.value}`)
      .join('\n'), 4)}`;
    jp += '\n  }\n\n';
  }

  // All body types from request side
  if (body && body.json) {
    jp += `  body:json: {\n${indentStringCustom(body.json, 4)}\n  }\n\n`;
  }

  if (body && body.text) {
    jp += `  body:text: {\n${indentStringCustom(body.text, 4)}\n  }\n\n`;
  }

  if (body && body.xml) {
    jp += `  body:xml: {\n${indentStringCustom(body.xml, 4)}\n  }\n\n`;
  }

  if (body && body.sparql) {
    jp += `  body:sparql: {\n${indentStringCustom(body.sparql, 4)}\n  }\n\n`;
  }

  if (body && body.graphql && body.graphql.query) {
    jp += `  body:graphql: {\n${indentStringCustom(body.graphql.query, 4)}\n  }\n\n`;
  }

  if (body && body.graphql && body.graphql.variables) {
    jp += `  body:graphql:vars: {\n${indentStringCustom(body.graphql.variables, 4)}\n  }\n\n`;
  }

  if (body && body.formUrlEncoded && body.formUrlEncoded.length) {
    jp += `  body:form-urlencoded: {\n`;
    const enabledValues = body.formUrlEncoded
      .filter((item) => item.enabled)
      .map((item) => `${quoteKey(item.name)}: ${item.value}`)
      .join('\n');
    const disabledValues = body.formUrlEncoded
      .filter((item) => !item.enabled)
      .map((item) => `~${quoteKey(item.name)}: ${item.value}`)
      .join('\n');

    if (enabledValues) {
      jp += `${indentStringCustom(enabledValues, 4)}\n`;
    }
    if (disabledValues) {
      jp += `${indentStringCustom(disabledValues, 4)}\n`;
    }
    jp += '  }\n\n';
  }

  if (body && body.multipartForm && body.multipartForm.length) {
    jp += `  body:multipart-form: {\n`;
    const multipartForms = body.multipartForm;
    if (multipartForms.length) {
      jp += `${indentStringCustom(multipartForms
        .map((item) => {
          const enabled = item.enabled ? '' : '~';
          const contentType
            = item.contentType && item.contentType !== '' ? ' @contentType(' + item.contentType + ')' : '';

          if (item.type === 'text') {
            // Use getValueString to wrap multiline values with triple quotes
            const valueString = getValueString(item.value);
            return `${enabled}${quoteKey(item.name)}: ${valueString}${contentType}`;
          }

          if (item.type === 'file') {
            const filepaths = Array.isArray(item.value) ? item.value : [];
            const filestr = filepaths.join('|');
            const value = `@file(${filestr})`;
            return `${enabled}${quoteKey(item.name)}: ${value}${contentType}`;
          }
        })
        .join('\n'), 4)}\n`;
    }
    jp += '  }\n\n';
  }

  if (body && body.file && body.file.length) {
    jp += `  body:file: {\n`;
    const files = body.file;
    if (files.length) {
      jp += `${indentStringCustom(files
        .map((item) => {
          const selected = item.selected ? '' : '~';
          const contentType
            = item.contentType && item.contentType !== '' ? ' @contentType(' + item.contentType + ')' : '';
          const filePath = item.filePath || '';
          const value = `@file(${filePath})`;
          const itemName = 'file';
          return `${selected}${quoteKey(itemName)}: ${value}${contentType}`;
        })
        .join('\n'), 4)}\n`;
    }
    jp += '  }\n\n';
  }
  /**
   * Only remove the last line if there are two new lines at the end
   * else the stripLastLine function will remove the last line and the curly braces move to the end of last line
   */
  if (jp.endsWith('\n\n')) {
    jp = stripLastLine(jp);
  }

  jp += '}\n\n';

  // Response block
  if (response) {
    jp += 'response: {\n';

    // Response headers
    if (responseHeaders && responseHeaders.length) {
      jp += '  headers: {\n';
      jp += `${indentStringCustom(responseHeaders
        .map((item) => `${quoteKey(item.name)}: ${item.value}`)
        .join('\n'), 4)}`;
      jp += '\n  }\n\n';
    }

    // Response status
    if (responseStatus || responseStatusText) {
      jp += '  status: {\n';
      if (responseStatus !== undefined) {
        jp += `    code: ${responseStatus}\n`;
      }
      if (responseStatusText !== undefined) {
        jp += `    text: ${responseStatusText}\n`;
      }
      jp += '  }\n\n';
    }

    // Response body with type and content
    if (responseBody) {
      jp += '  body: {\n';

      if (responseBody.type) {
        jp += `    type: ${responseBody.type}\n`;
      }

      if (responseBody.content !== undefined) {
        let contentString = typeof responseBody.content === 'string' ? responseBody.content : JSON.stringify(responseBody.content, null, 2);
        jp += `    content: '''\n${indentStringCustom(contentString, 6)}\n    '''\n`;
      }

      jp += '  }\n\n';
    }

    jp = stripLastLine(jp);
    jp += '}';
  }

  /**
   * Only remove the last line if there are two new lines at the end
   * else the stripLastLine function will remove the last line and the curly braces move to the end of last line
   */
  while (jp.endsWith('\n')) {
    jp = stripLastLine(jp);
  }

  return jp;
};

module.exports = jsonToExampleJp;
