import translateCode from '../utils/postman-to-jackpost-translator';
import { buildScriptUsage } from './postman-script-report';

const replacements = {
  'pm\\.environment\\.get\\(': 'jp.getEnvVar(',
  'pm\\.environment\\.set\\(': 'jp.setEnvVar(',
  'pm\\.variables\\.get\\(': 'jp.getVar(',
  'pm\\.variables\\.set\\(': 'jp.setVar(',
  'pm\\.variables\\.replaceIn\\(': 'jp.interpolate(',
  'pm\\.collectionVariables\\.get\\(': 'jp.getCollectionVar(',
  'pm\\.collectionVariables\\.set\\(': 'jp.setCollectionVar(',
  'pm\\.collectionVariables\\.has\\(': 'jp.hasCollectionVar(',
  'pm\\.collectionVariables\\.unset\\(': 'jp.deleteCollectionVar(',
  'pm\\.collectionVariables\\.clear\\(': 'jp.deleteAllCollectionVars(',
  'pm\\.collectionVariables\\.toObject\\(': 'jp.getAllCollectionVars(',
  // Only the actual null literal stops the runner; the string 'null' is a valid
  // request name and falls through to setNextRequest.
  'pm\\.setNextRequest\\(null\\)': 'jp.runner.stopExecution()',
  'pm\\.setNextRequest\\(': 'jp.runner.setNextRequest(',
  'pm\\.test\\(': 'test(',
  'pm.response.to.have\\.status\\(': 'expect(res.getStatus()).to.equal(',
  'pm\\.response\\.to\\.have\\.status\\(': 'expect(res.getStatus()).to.equal(',
  'pm\\.response\\.json\\(': 'res.getBody(',
  'pm\\.expect\\(': 'expect(',
  'pm\\.environment\\.has\\(([^)]+)\\)': 'jp.getEnvVar($1) !== undefined && jp.getEnvVar($1) !== null',
  'pm\\.response\\.code': 'res.getStatus()',
  'pm\\.response\\.text\\(\\)': 'JSON.stringify(res.getBody())',
  'pm\\.expect\\.fail\\(': 'expect.fail(',
  'pm\\.response\\.responseTime': 'res.getResponseTime()',
  'pm\\.globals\\.set\\(': 'jp.setGlobalEnvVar(',
  'pm\\.globals\\.get\\(': 'jp.getGlobalEnvVar(',
  'pm\\.globals\\.has\\(': 'jp.hasGlobalEnvVar(',
  'pm\\.globals\\.unset\\(': 'jp.deleteGlobalEnvVar(',
  'pm\\.globals\\.toObject\\(': 'jp.getAllGlobalEnvVars(',
  'pm\\.globals\\.clear\\(': 'jp.deleteAllGlobalEnvVars(',
  'pm\\.environment\\.toObject\\(': 'jp.getAllEnvVars(',
  'pm\\.environment\\.clear\\(': 'jp.deleteAllEnvVars(',
  'pm\\.variables\\.toObject\\(': 'jp.getAllVars(',
  // Request header PropertyList methods
  'pm\\.request\\.headers\\.remove\\(': 'req.deleteHeader(',
  'pm\\.request\\.headers\\.get\\(': 'req.headerList.get(',
  'pm\\.request\\.headers\\.has\\(': 'req.headerList.has(',
  'pm\\.request\\.headers\\.one\\(': 'req.headerList.one(',
  'pm\\.request\\.headers\\.all\\(': 'req.headerList.all(',
  'pm\\.request\\.headers\\.idx\\(': 'req.headerList.idx(',
  'pm\\.request\\.headers\\.count\\(': 'req.headerList.count(',
  'pm\\.request\\.headers\\.indexOf\\(': 'req.headerList.indexOf(',
  'pm\\.request\\.headers\\.find\\(': 'req.headerList.find(',
  'pm\\.request\\.headers\\.filter\\(': 'req.headerList.filter(',
  'pm\\.request\\.headers\\.each\\(': 'req.headerList.each(',
  'pm\\.request\\.headers\\.map\\(': 'req.headerList.map(',
  'pm\\.request\\.headers\\.reduce\\(': 'req.headerList.reduce(',
  'pm\\.request\\.headers\\.toObject\\(': 'req.headerList.toObject(',
  'pm\\.request\\.headers\\.clear\\(': 'req.headerList.clear(',
  'pm\\.request\\.headers\\.add\\(': 'req.headerList.add(',
  'pm\\.request\\.headers\\.upsert\\(': 'req.headerList.upsert(',
  'pm\\.request\\.headers\\.toString\\(': 'req.headerList.toString(',
  'pm\\.request\\.headers\\.toJSON\\(': 'req.headerList.toJSON(',
  'pm\\.request\\.headers\\.populate\\(': 'req.headerList.populate(',
  'pm\\.request\\.headers\\.repopulate\\(': 'req.headerList.repopulate(',
  'pm\\.request\\.headers\\.assimilate\\(': 'req.headerList.assimilate(',
  // Lossy: positional inserts map to add (position irrelevant for headers)
  // Note: regex can't drop the second arg, so it passes through as-is
  'pm\\.request\\.headers\\.prepend\\(': 'req.headerList.add(',
  'pm\\.request\\.headers\\.insert\\(': 'req.headerList.add(',
  'pm\\.request\\.headers\\.insertAfter\\(': 'req.headerList.add(',
  // Response header PropertyList methods
  'pm\\.response\\.headers\\.get\\(': 'res.getHeader(',
  'pm\\.response\\.headers\\.has\\(': 'res.headerList.has(',
  'pm\\.response\\.headers\\.one\\(': 'res.headerList.one(',
  'pm\\.response\\.headers\\.all\\(': 'res.headerList.all(',
  'pm\\.response\\.headers\\.idx\\(': 'res.headerList.idx(',
  'pm\\.response\\.headers\\.count\\(': 'res.headerList.count(',
  'pm\\.response\\.headers\\.indexOf\\(': 'res.headerList.indexOf(',
  'pm\\.response\\.headers\\.find\\(': 'res.headerList.find(',
  'pm\\.response\\.headers\\.filter\\(': 'res.headerList.filter(',
  'pm\\.response\\.headers\\.each\\(': 'res.headerList.each(',
  'pm\\.response\\.headers\\.map\\(': 'res.headerList.map(',
  'pm\\.response\\.headers\\.reduce\\(': 'res.headerList.reduce(',
  'pm\\.response\\.headers\\.toObject\\(': 'res.headerList.toObject(',
  'pm\\.response\\.headers\\.toString\\(': 'res.headerList.toString(',
  'pm\\.response\\.headers\\.toJSON\\(': 'res.headerList.toJSON(',
  'pm\\.response\\.to\\.have\\.jsonSchema\\(': 'expect(res.getBody()).to.have.jsonSchema(',
  'pm\\.response\\.to\\.not\\.have\\.jsonSchema\\(': 'expect(res.getBody()).to.not.have.jsonSchema(',
  'pm\\.response\\.not\\.to\\.have\\.jsonSchema\\(': 'expect(res.getBody()).not.to.have.jsonSchema(',
  'pm\\.response\\.to\\.have\\.not\\.jsonSchema\\(': 'expect(res.getBody()).to.have.not.jsonSchema(',
  'pm\\.response\\.to\\.have\\.jsonBody\\(': 'expect(res.getBody()).to.have.jsonBody(',
  'pm\\.response\\.to\\.not\\.have\\.jsonBody\\(': 'expect(res.getBody()).to.not.have.jsonBody(',
  'pm\\.response\\.not\\.to\\.have\\.jsonBody\\(': 'expect(res.getBody()).not.to.have.jsonBody(',
  'pm\\.response\\.to\\.have\\.not\\.jsonBody\\(': 'expect(res.getBody()).to.have.not.jsonBody(',
  'pm\\.response\\.to\\.have\\.body\\(': 'expect(res.getBody()).to.equal(',
  'pm\\.response\\.to\\.have\\.header\\(': 'expect(res.getHeaders()).to.have.property(',
  'pm\\.response\\.size\\(\\)': 'res.getSize()',
  'pm\\.response\\.size\\(\\)\\.body': 'res.getSize().body',
  'pm\\.response\\.responseSize': 'res.getSize().body',
  'pm\\.response\\.size\\(\\)\\.header': 'res.getSize().header',
  'pm\\.response\\.size\\(\\)\\.total': 'res.getSize().total',
  'pm\\.environment\\.name': 'jp.getEnvName()',
  'pm\\.response\\.status': 'res.statusText',
  'pm\\.response\\.headers': 'res.getHeaders()',
  'tests\\[\'([^\']+)\'\\]\\s*=\\s*([^;]+);': 'test("$1", function() { expect(Boolean($2)).to.be.true; });',

  // Supported Postman request translations:
  // - pm.request.url / request.url     -> req.getUrl()
  // - pm.request.url.getHost() -> req.getHost()
  // - pm.request.url.getPath() -> req.getPath()
  // - pm.request.url.getQueryString() -> req.getQueryString()
  // - pm.request.url.variables -> req.getPathParams()
  // - pm.request.method / request.method -> req.getMethod()
  // - pm.request.headers / request.headers -> req.getHeaders()
  // - pm.request.body / request.body   -> req.getBody()
  // - pm.info.requestName / request.name -> req.getName()
  'pm\\.request\\.url\\.getHost\\(\\)': 'req.getHost()',
  'pm\\.request\\.url\\.getPath\\(\\)': 'req.getPath()',
  'pm\\.request\\.url\\.getQueryString\\(\\)': 'req.getQueryString()',
  'pm\\.request\\.url\\.variables': 'req.getPathParams()',
  'pm\\.request\\.url': 'req.getUrl()',
  'pm\\.request\\.method': 'req.getMethod()',
  'pm\\.request\\.headers': 'req.getHeaders()',
  'pm\\.request\\.body': 'req.getBody()',
  'pm\\.info\\.requestName': 'req.getName()',
  'request\\.url': 'req.getUrl()',
  'request\\.method': 'req.getMethod()',
  'request\\.headers': 'req.getHeaders()',
  'request\\.body': 'req.getBody()',
  'request\\.name': 'req.getName()',
  // deprecated translations
  'postman\\.setEnvironmentVariable\\(': 'jp.setEnvVar(',
  'postman\\.getEnvironmentVariable\\(': 'jp.getEnvVar(',
  'postman\\.clearEnvironmentVariable\\(': 'jp.deleteEnvVar(',
  'pm\\.execution\\.skipRequest\\(\\)': 'jp.runner.skipRequest()',
  'pm\\.execution\\.skipRequest': 'jp.runner.skipRequest',
  // Only the actual null literal stops the runner; the string 'null' falls through to setNextRequest.
  'pm\\.execution\\.setNextRequest\\(null\\)': 'jp.runner.stopExecution()',
  'pm\\.execution\\.setNextRequest\\(': 'jp.runner.setNextRequest(',
  // Cookie jar translations — order matters:
  // 1. Specific jar method patterns must come before the general jar() pattern,
  //    otherwise jar() consumes the prefix and the method patterns never match.
  // 2. All jar patterns must precede the simpler pm.cookies.* patterns below,
  //    since replacements are applied in insertion order.
  'pm\\.cookies\\.jar\\(\\)\\.get\\(': 'jp.cookies.jar().getCookie(',
  'pm\\.cookies\\.jar\\(\\)\\.set\\(': 'jp.cookies.jar().setCookie(',
  'pm\\.cookies\\.jar\\(\\)\\.unset\\(': 'jp.cookies.jar().deleteCookie(',
  'pm\\.cookies\\.jar\\(\\)\\.clear\\(': 'jp.cookies.jar().deleteCookies(',
  'pm\\.cookies\\.jar\\(\\)\\.getAll\\(': 'jp.cookies.jar().getCookies(',
  'pm\\.cookies\\.jar\\(\\)': 'jp.cookies.jar()',
  // Direct cookie access
  'pm\\.cookies\\.get\\(': 'jp.cookies.get(',
  'pm\\.cookies\\.has\\(': 'jp.cookies.has(',
  'pm\\.cookies\\.toObject\\(': 'jp.cookies.toObject(',
  'pm\\.cookies\\.toString\\(': 'jp.cookies.toString(',
  'pm\\.cookies\\.clear\\(': 'jp.cookies.clear(',
  'pm\\.cookies\\.remove\\(': 'jp.cookies.delete(',
  // PropertyList cookie methods
  'pm\\.cookies\\.one\\(': 'jp.cookies.one(',
  'pm\\.cookies\\.all\\(': 'jp.cookies.all(',
  'pm\\.cookies\\.idx\\(': 'jp.cookies.idx(',
  'pm\\.cookies\\.count\\(': 'jp.cookies.count(',
  'pm\\.cookies\\.indexOf\\(': 'jp.cookies.indexOf(',
  'pm\\.cookies\\.find\\(': 'jp.cookies.find(',
  'pm\\.cookies\\.filter\\(': 'jp.cookies.filter(',
  'pm\\.cookies\\.each\\(': 'jp.cookies.each(',
  'pm\\.cookies\\.map\\(': 'jp.cookies.map(',
  'pm\\.cookies\\.reduce\\(': 'jp.cookies.reduce(',
  'pm\\.cookies\\.add\\(': 'jp.cookies.add(',
  'pm\\.cookies\\.append\\(': 'jp.cookies.append(',
  'pm\\.cookies\\.upsert\\(': 'jp.cookies.upsert(',
  // Lossy: position-aware inserts map to add (position irrelevant for cookies)
  'pm\\.cookies\\.prepend\\(': 'jp.cookies.add(',
  'pm\\.cookies\\.insert\\(': 'jp.cookies.add(',
  'pm\\.cookies\\.insertAfter\\(': 'jp.cookies.add('
};

const extendedReplacements = Object.keys(replacements).reduce((acc, key) => {
  const newKey = key.replace(/^pm\\\./, 'postman\\.');
  acc[key] = replacements[key];
  acc[newKey] = replacements[key];
  return acc;
}, {});

const compiledReplacements = Object.entries(extendedReplacements).map(([pattern, replacement]) => ({
  regex: new RegExp(pattern, 'g'),
  replacement
}));

const processRegexReplacement = (code) => {
  for (const { regex, replacement } of compiledReplacements) {
    code = code.replace(regex, replacement);
  }
  return code;
};

const firstLine = (message) => String(message ?? '').split('\n')[0];

/**
 * Translates one Postman script, alongside its API-usage measurement.
 *
 * `usage` is measured here, not by the caller, because a fallback to
 * find-and-replace is only visible at this point — the translated text alone
 * doesn't reveal which pass produced it.
 *
 * @param {string|string[]} script
 * @returns {{ translated: string, usage: Object|null }}
 */
const translatePostmanScript = (script, { onTranslationFailure, logFailures = true } = {}) => {
  const source = Array.isArray(script) ? script.join('\n') : script;

  try {
    const translated = translateCode(source);
    return { translated, usage: buildScriptUsage({ source, translated, fellBackToRegex: false }) };
  } catch (e) {
    if (logFailures) {
      console.warn('Error in postman translation:', e);
    }
    let fallback = 'regex';

    let translated;
    try {
      translated = processRegexReplacement(source);
    } catch (regexError) {
      if (logFailures) {
        console.warn('Error in postman translation:', regexError);
      }
      translated = source;
      fallback = 'verbatim';
    }

    if (onTranslationFailure) {
      onTranslationFailure({ message: firstLine(e?.message), fallback });
    }

    return { translated, usage: buildScriptUsage({ source, translated, fellBackToRegex: true }) };
  }
};

const postmanTranslation = (script, options) => translatePostmanScript(script, options).translated;

export { translatePostmanScript };
export default postmanTranslation;
