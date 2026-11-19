import { uuid } from '../../common/index.js';
import type {
  HttpRequestBody,
  RawBody,
  FormUrlEncodedBody,
  FormUrlEncodedEntry,
  MultipartFormBody,
  MultipartFormEntry,
  FileBody,
  FileBodyVariant,
  GraphQLBody,
  JackpostHttpRequestBody,
  JackpostKeyValue,
  JackpostMultipartFormEntry,
  JackpostFileEntry,
  JackpostGraphqlBody
} from '../types';

export const fromOpenCollectionBody = (body: HttpRequestBody | GraphQLBody | undefined, requestType: string = 'http'): JackpostHttpRequestBody => {
  const defaultBody: JackpostHttpRequestBody = {
    mode: 'none',
    json: null,
    text: null,
    xml: null,
    sparql: null,
    formUrlEncoded: [],
    multipartForm: [],
    graphql: null,
    file: []
  };

  if (!body) {
    return defaultBody;
  }

  if (requestType === 'graphql') {
    const gqlBody = body as GraphQLBody;
    return {
      ...defaultBody,
      mode: 'graphql',
      graphql: {
        query: gqlBody.query || '',
        variables: gqlBody.variables || ''
      }
    };
  }

  const httpBody = body as HttpRequestBody;

  if ('type' in httpBody) {
    switch (httpBody.type) {
      case 'json': {
        const rawBody = httpBody as RawBody;
        return {
          ...defaultBody,
          mode: 'json',
          json: rawBody.data || ''
        };
      }

      case 'text': {
        const rawBody = httpBody as RawBody;
        return {
          ...defaultBody,
          mode: 'text',
          text: rawBody.data || ''
        };
      }

      case 'xml': {
        const rawBody = httpBody as RawBody;
        return {
          ...defaultBody,
          mode: 'xml',
          xml: rawBody.data || ''
        };
      }

      case 'sparql': {
        const rawBody = httpBody as RawBody;
        return {
          ...defaultBody,
          mode: 'sparql',
          sparql: rawBody.data || ''
        };
      }

      case 'form-urlencoded': {
        const formBody = httpBody as FormUrlEncodedBody;
        return {
          ...defaultBody,
          mode: 'formUrlEncoded',
          formUrlEncoded: (formBody.data || []).map((field): JackpostKeyValue => {
            const entry: JackpostKeyValue = {
              uid: uuid(),
              name: field.name || '',
              value: field.value || '',
              enabled: field.disabled !== true
            };
            const desc = typeof field.description === 'string' ? field.description : field.description?.content;
            if (desc && desc.trim().length) entry.description = desc;
            return entry;
          })
        };
      }

      case 'multipart-form': {
        const multipartBody = httpBody as MultipartFormBody;
        return {
          ...defaultBody,
          mode: 'multipartForm',
          multipartForm: (multipartBody.data || []).map((field): JackpostMultipartFormEntry => {
            const entry: JackpostMultipartFormEntry = {
              uid: uuid(),
              type: field.type || 'text',
              name: field.name || '',
              value: Array.isArray(field.value) ? field.value : (field.value || ''),
              contentType: field.contentType || null,
              enabled: field.disabled !== true
            };
            const desc = typeof field.description === 'string' ? field.description : field.description?.content;
            if (desc && desc.trim().length) entry.description = desc;
            return entry;
          })
        };
      }

      case 'file': {
        const fileBody = httpBody as FileBody;
        return {
          ...defaultBody,
          mode: 'file',
          file: (fileBody.data || []).map((file): JackpostFileEntry => {
            const entry: JackpostFileEntry = {
              uid: uuid(),
              filePath: file.filePath || '',
              contentType: file.contentType || '',
              selected: file.selected !== false
            };
            const desc = typeof file.description === 'string'
              ? file.description
              : (file.description as { content?: string } | undefined)?.content;
            if (desc && desc.trim().length) entry.description = desc;
            return entry;
          })
        };
      }
    }
  }

  return defaultBody;
};

export const toOpenCollectionBody = (body: JackpostHttpRequestBody | null | undefined): HttpRequestBody | undefined => {
  if (!body || body.mode === 'none') {
    return undefined;
  }

  switch (body.mode) {
    case 'json':
      return { type: 'json', data: body.json || '' };

    case 'text':
      return { type: 'text', data: body.text || '' };

    case 'xml':
      return { type: 'xml', data: body.xml || '' };

    case 'sparql':
      return { type: 'sparql', data: body.sparql || '' };

    case 'formUrlEncoded': {
      const formData: FormUrlEncodedEntry[] = (body.formUrlEncoded || []).map((field): FormUrlEncodedEntry => {
        const entry: FormUrlEncodedEntry = {
          name: field.name || '',
          value: field.value || ''
        };

        if (field.description && typeof field.description === 'string' && field.description.trim().length) {
          entry.description = field.description;
        }

        if (field.enabled === false) {
          entry.disabled = true;
        }

        return entry;
      });

      return { type: 'form-urlencoded', data: formData };
    }

    case 'multipartForm': {
      const multipartData: MultipartFormEntry[] = (body.multipartForm || []).map((field): MultipartFormEntry => {
        const entry: MultipartFormEntry = {
          name: field.name || '',
          type: field.type || 'text',
          value: field.value || ''
        };

        if (field.description && typeof field.description === 'string' && field.description.trim().length) {
          entry.description = field.description;
        }

        if (field.contentType && typeof field.contentType === 'string' && field.contentType.trim().length) {
          entry.contentType = field.contentType;
        }

        if (field.enabled === false) {
          entry.disabled = true;
        }

        return entry;
      });

      return { type: 'multipart-form', data: multipartData };
    }

    case 'file': {
      const fileData: FileBodyVariant[] = (body.file || []).map((file): FileBodyVariant => {
        const entry: FileBodyVariant = {
          filePath: file.filePath || '',
          contentType: file.contentType || '',
          selected: file.selected !== false
        };

        if (file.description && typeof file.description === 'string' && file.description.trim().length) {
          entry.description = file.description;
        }

        return entry;
      });

      return { type: 'file', data: fileData };
    }

    case 'graphql':
      return undefined;

    default:
      return undefined;
  }
};

export const toOpenCollectionGraphqlBody = (body: JackpostHttpRequestBody | null | undefined): GraphQLBody | undefined => {
  if (!body || body.mode !== 'graphql' || !body.graphql) {
    return undefined;
  }

  return {
    query: body.graphql.query || '',
    variables: body.graphql.variables || ''
  };
};
