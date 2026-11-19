import { parseYml } from './utils';
import { ensureString, isNonEmptyString } from '../../utils';
import { toJackpostHttpHeaders } from './common/headers';
import { toJackpostParams } from './common/params';
import { toJackpostBody } from './common/body';
import type {
  MockServerFile,
  MockRouteEntry,
  JackpostMockServer,
  JackpostMockRoute,
  MockRuleCondition
} from './mockServerTypes';

const emptyRequestBody = () => ({
  mode: 'none',
  json: null,
  text: null,
  xml: null,
  sparql: null,
  formUrlEncoded: null,
  multipartForm: null,
  graphql: null,
  file: null
});

const toJackpostRuleConditions = (conditions: MockRuleCondition[] | null | undefined) => {
  if (!Array.isArray(conditions)) {
    return [];
  }

  return conditions.map((condition) => ({
    target: ensureString(condition?.target),
    key: ensureString(condition?.key),
    operator: ensureString(condition?.operator, 'equals'),
    value: ensureString(condition?.value)
  }));
};

const toJackpostMockRoute = (route: MockRouteEntry): JackpostMockRoute => {
  const responseStatus = Number(route?.response?.status) || 200;
  const responseStatusText = ensureString(route?.response?.statusText);

  const jackpostRoute: JackpostMockRoute = {
    name: ensureString(route?.name, 'Untitled Mock Response'),
    description: ensureString(route?.description),
    request: {
      url: ensureString(route?.request?.url, '/'),
      method: ensureString(route?.request?.method, 'GET'),
      headers: toJackpostHttpHeaders(route?.request?.headers) || [],
      params: toJackpostParams(route?.request?.params) || [],
      body: toJackpostBody(route?.request?.body) || emptyRequestBody()
    },
    response: {
      status: responseStatus,
      statusText: responseStatusText === 'OK' && responseStatus !== 200 ? '' : responseStatusText,
      headers: toJackpostHttpHeaders(route?.response?.headers) || [],
      body: {
        type: ensureString(route?.response?.body?.type, 'json'),
        content: ensureString(route?.response?.body?.data)
      }
    },
    rules: {
      operator: route?.rules?.operator === 'OR' ? 'OR' : 'AND',
      conditions: toJackpostRuleConditions(route?.rules?.conditions)
    }
  };

  const rawExample = route?.copiedFrom?.example;
  const rawRequestPath = route?.copiedFrom?.requestPath;
  const copiedFromExample = isNonEmptyString(rawExample) ? rawExample : null;
  const copiedFromRequestPath = isNonEmptyString(rawRequestPath) ? rawRequestPath : null;

  if (copiedFromExample || copiedFromRequestPath) {
    jackpostRoute.copiedFrom = {
      exampleName: copiedFromExample,
      requestPathname: copiedFromRequestPath
    };
  }

  return jackpostRoute;
};

const parseMockServer = (content: string): JackpostMockServer => {
  const parsed: MockServerFile = parseYml(content);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid mock server file');
  }

  const info = parsed.info || ({} as NonNullable<MockServerFile['info']>);
  const mock = parsed.mock || ({} as NonNullable<MockServerFile['mock']>);

  const jackpostMockServer: JackpostMockServer = {
    name: ensureString(info.name, 'Mock Server'),
    port: Number(mock.port) || null,
    delay: Number(mock.delay) || 0,
    source: null,
    routes: Array.isArray(parsed.routes) ? parsed.routes.map(toJackpostMockRoute) : []
  };

  const sourceType = mock.source?.type;
  const sourcePath = mock.source?.path;
  if ((sourceType === 'collection' || sourceType === 'spec') && isNonEmptyString(sourcePath)) {
    jackpostMockServer.source = {
      type: sourceType,
      path: sourcePath
    };
  }

  return jackpostMockServer;
};

export default parseMockServer;
