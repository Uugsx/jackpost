import translateJpToPostman from '../../../src/utils/jackpost-to-postman-translator';

describe('Jackpost to Postman Execution Control Translation', () => {
  // setNextRequest translations
  it('should translate jp.setNextRequest', () => {
    const code = 'jp.setNextRequest("Get User Details");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.execution.setNextRequest("Get User Details");');
  });

  it('should translate jp.runner.setNextRequest', () => {
    const code = 'jp.runner.setNextRequest("Create Order");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.execution.setNextRequest("Create Order");');
  });

  it('should preserve the string "null" as a request name when translating jp.runner.setNextRequest("null")', () => {
    const code = 'jp.runner.setNextRequest("null");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.execution.setNextRequest("null");');
  });

  // skipRequest translation
  it('should translate jp.runner.skipRequest', () => {
    const code = 'jp.runner.skipRequest();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.execution.skipRequest();');
  });

  // stopExecution translation
  it('should translate jp.runner.stopExecution() to pm.execution.setNextRequest(null)', () => {
    const code = 'jp.runner.stopExecution();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.execution.setNextRequest(null);');
  });

  // Conditional execution control
  it('should handle setNextRequest in conditionals', () => {
    const code = `
if (res.getStatus() === 401) {
    jp.setNextRequest("Refresh Token");
} else if (res.getStatus() === 200) {
    jp.setNextRequest("Process Data");
}
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('if (pm.response.code === 401) {');
    expect(translatedCode).toContain('pm.execution.setNextRequest("Refresh Token");');
    expect(translatedCode).toContain('} else if (pm.response.code === 200) {');
    expect(translatedCode).toContain('pm.execution.setNextRequest("Process Data");');
  });

  it('should handle stopExecution in error handling', () => {
    const code = `
if (res.getStatus() >= 500) {
    console.error("Server error, stopping execution");
    jp.runner.stopExecution();
}
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('if (pm.response.code >= 500) {');
    expect(translatedCode).toContain('console.error("Server error, stopping execution");');
    expect(translatedCode).toContain('pm.execution.setNextRequest(null);');
  });

  it('should handle skipRequest with condition', () => {
    const code = `
const shouldSkip = jp.getEnvVar("skipNextRequest") === "true";
if (shouldSkip) {
    jp.runner.skipRequest();
}
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('const shouldSkip = pm.environment.get("skipNextRequest") === "true";');
    expect(translatedCode).toContain('if (shouldSkip) {');
    expect(translatedCode).toContain('pm.execution.skipRequest();');
  });

  it('should handle all execution control methods together', () => {
    const code = `
const status = res.getStatus();
const data = res.getBody();

if (status === 200 && data.hasMore) {
    jp.runner.setNextRequest("Fetch Next Page");
} else if (status === 429) {
    console.log("Rate limited, skipping");
    jp.runner.skipRequest();
} else if (status >= 500) {
    jp.runner.stopExecution();
}
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('const status = pm.response.code;');
    expect(translatedCode).toContain('const data = pm.response.json();');
    expect(translatedCode).toContain('pm.execution.setNextRequest("Fetch Next Page");');
    expect(translatedCode).toContain('pm.execution.skipRequest();');
    expect(translatedCode).toContain('pm.execution.setNextRequest(null);');
  });

  it('should handle dynamic request names in setNextRequest', () => {
    const code = `
const nextRequest = jp.getVar("nextRequestName");
jp.setNextRequest(nextRequest);
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('const nextRequest = pm.variables.get("nextRequestName");');
    expect(translatedCode).toContain('pm.execution.setNextRequest(nextRequest);');
  });
});
