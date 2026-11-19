import type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
import { uuid } from '../../../utils';

export interface AppFile {
  info: {
    name?: string;
    type: 'app';
    seq?: number;
    tags?: string[];
  };
  code?: string;
}

const parseApp = (ocApp: AppFile): JackpostItem => {
  const info = ocApp.info || ({} as AppFile['info']);

  const jackpostItem: JackpostItem = {
    uid: uuid(),
    type: 'app',
    seq: typeof info.seq === 'number' ? info.seq : 1,
    name: info.name || 'App',
    tags: Array.isArray(info.tags) ? info.tags : [],
    request: null,
    settings: null,
    app: { code: ocApp.code || '' },
    fileContent: null,
    root: null,
    items: [],
    examples: [],
    filename: null,
    pathname: null
  };

  return jackpostItem;
};

export default parseApp;
