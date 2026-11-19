const chai = require('chai');
const Jp = require('../jp');
const { getUnresolvedVariableCollector } = require('../unresolved-variables');
const JackpostRequest = require('../jackpost-request');
const JackpostResponse = require('../jackpost-response');
const { cleanJson } = require('../utils');
const { createJpTestResultMethods } = require('../utils/results');
const { runScriptInNodeVm } = require('../sandbox/node-vm');
const { executeQuickJsVmAsync } = require('../sandbox/quickjs');
const { SANDBOX } = require('../utils/sandbox');
const { bindRunRequest, createScopeSetter } = require('./scripted-entries');

class ScriptRuntime {
  constructor(props) {
    this.runtime = props?.runtime || 'quickjs';
  }

  // This approach is getting out of hand
  // Need to refactor this to use a single arg (object) instead of 7
  async runRequestScript(
    script,
    request,
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

    // extend jp with result getter methods
    const { __jackpostTestResults, test, waitForPendingTests } = createJpTestResultMethods(jp, assertionResults, chai);

    const context = {
      jp,
      req,
      test,
      expect: chai.expect,
      assert: chai.assert,
      __jackpostTestResults: __jackpostTestResults,
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
        debug: customLogger('debug'),
        info: customLogger('info'),
        warn: customLogger('warn'),
        error: customLogger('error')
      };
    }

    bindRunRequest(jp, runRequestByItemPathname);

    // Helper to build the result object for pre-request scripts
    // Extracted to avoid duplication across runtime branches
    const buildRequestScriptResult = () => ({
      request,
      envVariables: jp._envDirty ? cleanJson(envVariables) : null,
      runtimeVariables: jp._runtimeVarsDirty ? cleanJson(runtimeVariables) : null,
      collectionVariables: jp._collVarsDirty ? cleanJson(collectionVariables) : null,
      globalEnvironmentVariables: jp._globalEnvDirty ? cleanJson(globalEnvironmentVariables) : null,
      oauth2CredentialsToReset: jp.oauth2CredentialsToReset,
      results: cleanJson(__jackpostTestResults.getResults()),
      nextRequestName: jp.nextRequest,
      skipRequest: jp.skipRequest,
      stopExecution: jp.stopExecution,
      scriptedRequestEntries: cleanJson(jp.scriptedRequestEntries || [])
    });

    const attachScriptResultToOnFailHandler = () => {
      if (typeof request.onFailHandler !== 'function') {
        return;
      }

      const onFailHandler = request.onFailHandler;
      request.onFailHandler = async (error) => {
        await onFailHandler(error);
        return buildRequestScriptResult();
      };
    };

    // Track script errors to attach partial results before re-throwing
    // This ensures that any test() calls that passed before the error are preserved
    // Similar pattern to test-runtime.js which already handles this correctly
    let scriptError = null;

    if (this.runtime === SANDBOX.NODEVM) {
      try {
        await runScriptInNodeVm({
          script,
          context,
          collectionPath,
          scriptingConfig,
          scriptPath
        });
      } catch (error) {
        scriptError = error;
      }
      await waitForPendingTests();

      // If script errored, attach partial results so callers can display passed tests
      // before the error occurred (e.g., 2 tests pass, then script throws)
      if (scriptError) {
        scriptError.partialResults = buildRequestScriptResult();
        throw scriptError;
      }

      attachScriptResultToOnFailHandler();
      return buildRequestScriptResult();
    }

    // default runtime is `quickjs`
    try {
      await executeQuickJsVmAsync({
        script: script,
        context: context,
        collectionPath,
        scriptPath
      });
    } catch (error) {
      scriptError = error;
    }

    if (scriptError) {
      scriptError.partialResults = buildRequestScriptResult();
      throw scriptError;
    }

    attachScriptResultToOnFailHandler();
    return buildRequestScriptResult();
  }

  async runResponseScript(
    script,
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
    const assertionResults = request?.assertionResults || {};
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

    const context = {
      jp,
      req,
      res,
      test,
      expect: chai.expect,
      assert: chai.assert,
      __jackpostTestResults: __jackpostTestResults,
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
        error: customLogger('error'),
        debug: customLogger('debug')
      };
    }

    bindRunRequest(jp, runRequestByItemPathname);

    // Helper to build the result object for post-response scripts
    // Extracted to avoid duplication across runtime branches
    const buildResponseScriptResult = () => ({
      response,
      envVariables: jp._envDirty ? cleanJson(envVariables) : null,
      runtimeVariables: jp._runtimeVarsDirty ? cleanJson(runtimeVariables) : null,
      collectionVariables: jp._collVarsDirty ? cleanJson(collectionVariables) : null,
      globalEnvironmentVariables: jp._globalEnvDirty ? cleanJson(globalEnvironmentVariables) : null,
      oauth2CredentialsToReset: jp.oauth2CredentialsToReset,
      results: cleanJson(__jackpostTestResults.getResults()),
      nextRequestName: jp.nextRequest,
      skipRequest: jp.skipRequest,
      stopExecution: jp.stopExecution,
      scriptedRequestEntries: cleanJson(jp.scriptedRequestEntries || [])
    });

    // Track script errors to attach partial results before re-throwing
    // This ensures that any test() calls that passed before the error are preserved
    // Similar pattern to test-runtime.js which already handles this correctly
    let scriptError = null;

    if (this.runtime === SANDBOX.NODEVM) {
      try {
        await runScriptInNodeVm({
          script,
          context,
          collectionPath,
          scriptingConfig,
          scriptPath
        });
      } catch (error) {
        scriptError = error;
      }
      await waitForPendingTests();

      // If script errored, attach partial results so callers can display passed tests
      // before the error occurred (e.g., 2 tests pass, then script throws)
      if (scriptError) {
        scriptError.partialResults = buildResponseScriptResult();
        throw scriptError;
      }

      return buildResponseScriptResult();
    }

    // default runtime is `quickjs`
    try {
      await executeQuickJsVmAsync({
        script: script,
        context: context,
        collectionPath,
        scriptPath
      });
    } catch (error) {
      scriptError = error;
    }

    if (scriptError) {
      scriptError.partialResults = buildResponseScriptResult();
      throw scriptError;
    }

    return buildResponseScriptResult();
  }
}

module.exports = ScriptRuntime;
