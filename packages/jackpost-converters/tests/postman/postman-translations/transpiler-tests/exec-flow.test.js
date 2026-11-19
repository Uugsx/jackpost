import translateCode from '../../../../src/utils/postman-to-jackpost-translator';

describe('Execution Flow Translation', () => {
  // Request flow control
  it('should translate pm.setNextRequest', () => {
    const code = 'pm.setNextRequest("Get User Details");';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.setNextRequest("Get User Details");');
  });

  it('should translate pm.setNextRequest(null) to jp.runner.stopExecution()', () => {
    const code = 'pm.setNextRequest(null);';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.stopExecution();');
  });

  it('should translate pm.setNextRequest("null") to jp.runner.setNextRequest("null") (string is a valid request name)', () => {
    const code = 'pm.setNextRequest("null");';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.setNextRequest("null");');
  });

  it('should keep pm.setNextRequest(<request name>) as jp.setNextRequest(<request name>) for non-null arguments', () => {
    const code = 'pm.setNextRequest("Get User Details");';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.setNextRequest("Get User Details");');
  });

  it('should translate pm.execution.skipRequest', () => {
    const code = 'if (condition) pm.execution.skipRequest();';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('if (condition) jp.runner.skipRequest();');
  });

  it('should translate pm.execution.setNextRequest(null)', () => {
    const code = 'pm.execution.setNextRequest(null);';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.stopExecution();');
  });

  it('should translate pm.execution.setNextRequest("null") to jp.runner.setNextRequest("null") (string is a valid request name)', () => {
    const code = 'pm.execution.setNextRequest("null");';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.setNextRequest("null");');
  });

  it('should translate pm.execution.setNextRequest("req1") to jp.runner.setNextRequest("req1")', () => {
    const code = 'pm.execution.setNextRequest("req1");';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.setNextRequest("req1");');
  });

  it('should translate pm.execution.setNextRequest() with no arguments to jp.runner.setNextRequest()', () => {
    const code = 'pm.execution.setNextRequest();';
    const translatedCode = translateCode(code);
    expect(translatedCode).toBe('jp.runner.setNextRequest();');
  });

  it('should handle pm.execution.setNextRequest with non-null parameters', () => {
    const code = `
        // Continue normal flow
        pm.execution.setNextRequest("Get user details");
        
        // With variable
        const nextReq = "Update profile";
        pm.execution.setNextRequest(nextReq);
        `;
    const translatedCode = translateCode(code);

    expect(translatedCode).toContain('jp.runner.setNextRequest("Get user details");');
    expect(translatedCode).toContain('jp.runner.setNextRequest(nextReq);');
  });

  it('should handle all execution control methods together', () => {
    const code = `
        // All execution control methods
        if (pm.response.code === 401) {
            pm.execution.skipRequest();
        } else if (pm.response.code === 500) {
            pm.execution.setNextRequest(null);
        } else {
            pm.setNextRequest("Get User Details");
        }
        `;
    const translatedCode = translateCode(code);

    expect(translatedCode).toContain('if (res.getStatus() === 401) {');
    expect(translatedCode).toContain('jp.runner.skipRequest();');
    expect(translatedCode).toContain('} else if (res.getStatus() === 500) {');
    expect(translatedCode).toContain('jp.runner.stopExecution();');
    expect(translatedCode).toContain('} else {');
    expect(translatedCode).toContain('jp.runner.setNextRequest("Get User Details");');
  });
});
