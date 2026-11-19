import type { HttpRequestParam as JackpostHttpRequestParam } from '@jackpost/schema-types/requests/http';
import type { HttpRequestParam } from '@opencollection/types/requests/http';
import { uuid, ensureString } from '../../../utils';

export const toOpenCollectionParams = (params: JackpostHttpRequestParam[] | null | undefined): HttpRequestParam[] | undefined => {
  if (!params?.length) {
    return undefined;
  }

  const ocParams = params.map((param: JackpostHttpRequestParam): HttpRequestParam => {
    const ocParam: HttpRequestParam = {
      name: param.name || '',
      value: param.value || '',
      type: param.type
    };

    if (param?.description?.trim().length) {
      ocParam.description = param.description;
    }

    if (param.enabled === false) {
      ocParam.disabled = true;
    }

    return ocParam;
  });

  return ocParams.length ? ocParams : undefined;
};

export const toJackpostParams = (params: HttpRequestParam[] | null | undefined): JackpostHttpRequestParam[] | undefined => {
  if (!params?.length) {
    return undefined;
  }

  const jackpostParams = params.map((param: HttpRequestParam): JackpostHttpRequestParam => {
    const jackpostParam: JackpostHttpRequestParam = {
      uid: uuid(),
      name: ensureString(param.name),
      value: ensureString(param.value),
      type: param.type,
      enabled: param.disabled !== true
    };

    if (param.description) {
      if (typeof param.description === 'string' && param.description.trim().length) {
        jackpostParam.description = param.description;
      } else if (typeof param.description === 'object' && param.description.content?.trim().length) {
        jackpostParam.description = param.description.content;
      }
    }

    return jackpostParam;
  });

  return jackpostParams.length ? jackpostParams : undefined;
};
