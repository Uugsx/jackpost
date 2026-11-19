import type { FolderRequest as JackpostFolderRequest } from '@jackpost/schema-types/collection/folder';
import type { KeyValue as JackpostKeyValue } from '@jackpost/schema-types/common/key-value';
import type { HttpRequestHeader, HttpResponseHeader } from '@opencollection/types/requests/http';
import { uuid, ensureString } from '../../../utils';

export const toOpenCollectionHttpHeaders = (headers: JackpostFolderRequest['headers']): HttpRequestHeader[] | undefined => {
  if (!headers?.length) {
    return undefined;
  }

  const ocHeaders = headers.map((header: JackpostKeyValue): HttpRequestHeader => {
    const httpHeader: HttpRequestHeader = {
      name: header.name || '',
      value: header.value || ''
    };
    if (header?.description?.trim().length) {
      httpHeader.description = header.description;
    }
    if (header.enabled === false) {
      httpHeader.disabled = true;
    }
    return httpHeader;
  });

  return ocHeaders.length ? ocHeaders : undefined;
};

export const toOpenCollectionResponseHeaders = (headers: JackpostFolderRequest['headers']): HttpResponseHeader[] | undefined => {
  if (!headers?.length) {
    return undefined;
  }

  const ocHeaders = headers.map((header: JackpostKeyValue): HttpResponseHeader => ({
    name: header.name || '',
    value: header.value || ''
  }));

  return ocHeaders.length ? ocHeaders : undefined;
};

export const toJackpostHttpHeaders = (headers: HttpRequestHeader[] | HttpResponseHeader[] | null | undefined): JackpostKeyValue[] | undefined => {
  if (!headers?.length) {
    return undefined;
  }

  const jackpostHeaders = headers.map((header): JackpostKeyValue => {
    const jackpostHeader: JackpostKeyValue = {
      uid: uuid(),
      name: ensureString(header.name),
      value: ensureString(header.value),
      enabled: ('disabled' in header) ? header.disabled !== true : true
    };

    if ('description' in header && header.description) {
      jackpostHeader.description = typeof header.description === 'string' ? header.description : (header.description as any)?.content || '';
    }

    return jackpostHeader;
  });

  return jackpostHeaders.length ? jackpostHeaders : undefined;
};
