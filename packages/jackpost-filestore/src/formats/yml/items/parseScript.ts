import type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
import type { ScriptFile } from '@opencollection/types/collection/item';
import { uuid } from '../../../utils';

const parseScript = (ocScript: ScriptFile): JackpostItem => {
  const jackpostItem: JackpostItem = {
    uid: uuid(),
    type: 'js',
    seq: 1,
    name: 'Script',
    tags: [],
    request: null,
    settings: null,
    fileContent: ocScript.script || '',
    root: null,
    items: [],
    examples: [],
    filename: null,
    pathname: null
  };

  return jackpostItem;
};

export default parseScript;
