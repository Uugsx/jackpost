const chai = require('chai');
const Jp = require('../jp');
const { getUnresolvedVariableCollector } = require('../unresolved-variables');
const JackpostRequest = require('../jackpost-request');
const JackpostResponse = require('../jackpost-response');
const { cleanJson } = require('../utils');
const { createJpTestResultMethods } = require('../utils/results');
const { runScriptInNodeVm } = require('../sandbox/node-vm');
const jsonwebtoken = require('jsonwebtoken');
const { executeQuickJsVmAsync } = require('../sandbox/quickjs');
const { SANDBOX } = require('../utils/sandbox');
const { bindRunRequest, createScopeSetter } = require('./scripted-entries');

class TestRuntime {
  constructor(props) {
    this.runtime = props?.runtime || 'quickjs';
  }

  async runTests(
    testsFile,
    request,
    response,
    envVariables,
    runtimeVariables,
    collectionPath,
    onConsoleLog,
    processEnvVars,
    scriptingConfig,
    runRequestByItemPathname,
    collectionName
  ) {
    const globalEnvironmentVariables = request?.globalEnvironmentVariables || {};
    const oauth2CredentialVariables = request?.oauth2CredentialVariables || {};
    const collectionVariables = request?.collectionVariables || {};
    const folderVariables = request?.folderVariables || {};
    const requestVariables = request?.requestVariables || {};
    const promptVariables = request?.promptVariables || {};
    const assertionResults = request?.assertionResults || [];
    const certsAndProxyConfig = request?.certsAndProxyConfig;
    const scriptPath = request?.pathname;
    const jp = new Jp({
      runtime: this.runtime,
      envVariables,
      runtimeVariables,
      processEnvVars,
      collectionPath,
      collectionVariables,
      folderVariables,
      requestVariables,
      globalEnvironmentVariables,
      globalEnvironmentName: request?.globalEnvironmentName,
      oauth2CredentialVariables,
      collectionName,
      promptVariables,
      certsAndProxyConfig,
      requestUrl: request?.url,
      onUnresolved: getUnresolvedVariableCollector(request)
    });
    const req = new JackpostRequest(request);
    const res = new JackpostResponse(response);

    // extend jp with result getter methods
    const { __jackpostTestResults, test, waitForPendingTests } = createJpTestResultMethods(jp, assertionResults, chai);

    if (!testsFile || !testsFile.length) {
      return {
        request,
        envVariables: null,
        runtimeVariables: null,
        collectionVariables: null,
        globalEnvironmentVariables: null,
        results: __jackpostTestResults.getResults(),
        nextRequestName: jp.nextRequest,
        stopExecution: jp.stopExecution
      };
    }

    const context = {
      test,
      jp,
      req,
      res,
      expect: chai.expect,
      assert: chai.assert,
      __jackpostTestResults: __jackpostTestResults,
      jwt: jsonwebtoken,
      __jpSetScope: createScopeSetter(jp)
    };

    if (onConsoleLog && typeof onConsoleLog === 'function') {
      const customLogger = (type) => {
        return (...args) => {
          onConsoleLog(type, cleanJson(args));
        };
      };
      context.console = {
        log: customLogger('log'),
        info: customLogger('info'),
        warn: customLogger('warn'),
        debug: customLogger('debug'),
        error: customLogger('error')
      };
    }

    bindRunRequest(jp, runRequestByItemPathname);

    let scriptError = null;

    if (this.runtime === SANDBOX.NODEVM) {
      try {
        await runScriptInNodeVm({
          script: testsFile,
          context,
          collectionPath,
          scriptingConfig,
          scriptPath
        });
      } catch (error) {
        scriptError = error;
      }
      await waitForPendingTests();
    } else {
      // default runtime is `quickjs`
      try {
        await executeQuickJsVmAsync({
          script: testsFile,
          context: context,
          collectionPath,
          scriptPath
        });
      } catch (error) {
        scriptError = error;
      }
    }

    const result = {
      request,
      envVariables: jp._envDirty ? cleanJson(envVariables) : null,
      runtimeVariables: jp._runtimeVarsDirty ? cleanJson(runtimeVariables) : null,
      collectionVariables: jp._collVarsDirty ? cleanJson(collectionVariables) : null,
      globalEnvironmentVariables: jp._globalEnvDirty ? cleanJson(globalEnvironmentVariables) : null,
      oauth2CredentialsToReset: jp.oauth2CredentialsToReset,
      results: cleanJson(__jackpostTestResults.getResults()),
      nextRequestName: jp.nextRequest,
      stopExecution: jp.stopExecution,
      scriptedRequestEntries: cleanJson(jp.scriptedRequestEntries || [])
    };

    if (scriptError) {
      scriptError.partialResults = result;
      throw scriptError;
    }

    return result;
  }
}

module.exports = TestRuntime;
