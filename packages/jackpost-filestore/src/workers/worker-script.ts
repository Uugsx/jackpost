import { parentPort } from 'node:worker_threads';
import {
  parseJpRequest,
  parseJpCollection,
  parseJpEnvironment,
  stringifyJpRequest,
  stringifyJpCollection,
  stringifyJpEnvironment
} from '../formats/jp';
import {
  parseYmlItem,
  parseYmlFolder,
  parseYmlEnvironment,
  stringifyYmlItem,
  stringifyYmlFolder,
  stringifyYmlEnvironment
} from '../formats/yml';
import { CollectionFormat } from '../types';
import { DEFAULT_COLLECTION_FORMAT } from '../constants';

type TaskType
  = | 'parse'
    | 'stringify'
    | 'parseFolder'
    | 'stringifyFolder'
    | 'parseEnvironment'
    | 'stringifyEnvironment';

interface WorkerMessage {
  taskType: TaskType;
  data: {
    data: any;
    format?: CollectionFormat;
  };
}

const runTask = (taskType: TaskType, data: any, format: CollectionFormat): any => {
  switch (taskType) {
    case 'parse':
      return format === 'yml' ? parseYmlItem(data) : parseJpRequest(data);
    case 'stringify':
      return format === 'yml' ? stringifyYmlItem(data) : stringifyJpRequest(data);
    case 'parseFolder':
      return format === 'yml' ? parseYmlFolder(data) : parseJpCollection(data);
    case 'stringifyFolder':
      return format === 'yml' ? stringifyYmlFolder(data) : stringifyJpCollection(data, true);
    case 'parseEnvironment':
      return format === 'yml' ? parseYmlEnvironment(data) : parseJpEnvironment(data);
    case 'stringifyEnvironment':
      return format === 'yml' ? stringifyYmlEnvironment(data) : stringifyJpEnvironment(data);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
};

parentPort?.on('message', async (message: WorkerMessage) => {
  try {
    const { taskType, data: messageData } = message;
    const { data, format = DEFAULT_COLLECTION_FORMAT } = messageData;
    const result = runTask(taskType, data, format);
    parentPort?.postMessage(result);
  } catch (error: any) {
    console.error('Worker error:', error);
    parentPort?.postMessage({ error: error?.message });
  }
});
