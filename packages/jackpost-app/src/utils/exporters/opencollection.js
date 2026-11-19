import jsyaml from 'js-yaml';
import { jackpostToOpenCollection } from '@jackpost/converters';
import { filterTransientItems } from 'utils/collections';

export const exportCollection = (collection, version) => {
  // Filter out transient items before export
  collection.items = filterTransientItems(collection.items);

  const openCollection = jackpostToOpenCollection(collection);

  if (!openCollection.extensions) {
    openCollection.extensions = {};
  }
  if (!openCollection.extensions.jackpost) {
    openCollection.extensions.jackpost = {};
  }
  openCollection.extensions.jackpost.exportedAt = new Date().toISOString();
  openCollection.extensions.jackpost.exportedUsing = version ? `Jackpost/${version}` : 'Jackpost';

  return jsyaml.dump(openCollection, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });
};

export default exportCollection;
