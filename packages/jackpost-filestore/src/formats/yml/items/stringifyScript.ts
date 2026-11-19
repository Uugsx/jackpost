import type { Item as JackpostItem } from '@jackpost/schema-types/collection/item';
import type { ScriptFile } from '@opencollection/types/collection/item';
import { stringifyYml } from '../utils';

const stringifyScript = (item: JackpostItem): string => {
  try {
    const ocScript: ScriptFile = {
      type: 'script'
    };

    if (item.fileContent?.trim().length) {
      ocScript.script = item.fileContent;
    }

    return stringifyYml(ocScript);
  } catch (error) {
    console.error('Error stringifying script:', error);
    throw error;
  }
};

export default stringifyScript;
