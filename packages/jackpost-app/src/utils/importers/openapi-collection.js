import { JackpostError } from 'utils/common/error';
import { openApiToJackpost } from '@jackpost/converters';

export const convertOpenapiToJackpost = (data, options = {}) => {
  try {
    return openApiToJackpost(data, options);
  } catch (err) {
    console.error('Error converting OpenAPI to Jackpost:', err);
    throw new JackpostError('Import collection failed: ' + err.message);
  }
};

export const isOpenApiSpec = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (typeof data.info !== 'object' || data.info === null) {
    return false;
  }

  if (typeof data.openapi === 'string' && data.openapi.trim().length) {
    return true;
  }

  if (typeof data.swagger === 'string' && data.swagger.trim().length) {
    return true;
  }

  return false;
};

export const isSwagger2Spec = (spec) => Boolean(spec?.swagger) && String(spec.swagger).startsWith('2');

export const buildOpenApiSyncJackpostConfig = (collection, { sourceUrl, groupBy, authPlacement, requestNameSource }) => ({
  version: collection.version || '1',
  name: collection.name || 'Untitled Collection',
  type: 'collection',
  ignore: ['node_modules', '.git'],
  ...collection.jackpostConfig,
  openapi: [{ sourceUrl, groupBy, authPlacement, requestNameSource, autoCheck: true, autoCheckInterval: 5 }]
});
