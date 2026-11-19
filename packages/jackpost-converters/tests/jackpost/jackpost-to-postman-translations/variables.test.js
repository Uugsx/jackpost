import translateJpToPostman from '../../../src/utils/jackpost-to-postman-translator';

describe('Jackpost to Postman Variables Translation', () => {
  // Regular variables tests
  it('should translate jp.getVar', () => {
    const code = 'jp.getVar("test");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.get("test");');
  });

  it('should translate jp.setVar', () => {
    const code = 'jp.setVar("test", "value");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.set("test", "value");');
  });

  it('should translate jp.hasVar', () => {
    const code = 'jp.hasVar("userId");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.has("userId");');
  });

  it('should translate jp.deleteVar', () => {
    const code = 'jp.deleteVar("tempVar");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.unset("tempVar");');
  });

  it('should translate jp.interpolate', () => {
    const code = 'jp.interpolate("Hello {{name}}");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.replaceIn("Hello {{name}}");');
  });

  it('should translate jp.interpolate with complex template', () => {
    const code = 'const greeting = jp.interpolate("Hello {{name}}, your user id is {{userId}}");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('const greeting = pm.variables.replaceIn("Hello {{name}}, your user id is {{userId}}");');
  });

  // Global variables tests
  it('should translate jp.getGlobalEnvVar', () => {
    const code = 'jp.getGlobalEnvVar("test");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.globals.get("test");');
  });

  it('should translate jp.setGlobalEnvVar', () => {
    const code = 'jp.setGlobalEnvVar("test", "value");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.globals.set("test", "value");');
  });

  it('should translate jp.hasGlobalEnvVar', () => {
    const code = 'jp.hasGlobalEnvVar("token");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.globals.has("token");');
  });

  it('should translate jp.deleteGlobalEnvVar', () => {
    const code = 'jp.deleteGlobalEnvVar("token");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.globals.unset("token");');
  });

  it('should translate jp.deleteAllGlobalEnvVars', () => {
    const code = 'jp.deleteAllGlobalEnvVars();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.globals.clear();');
  });

  it('should translate jp.getAllGlobalEnvVars', () => {
    const code = 'const globals = jp.getAllGlobalEnvVars();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('const globals = pm.globals.toObject();');
  });

  // Collection variables tests
  it('should translate jp.getCollectionVar', () => {
    const code = 'jp.getCollectionVar("baseUrl");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.collectionVariables.get("baseUrl");');
  });

  it('should translate jp.setCollectionVar', () => {
    const code = 'jp.setCollectionVar("baseUrl", "https://api.example.com");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.collectionVariables.set("baseUrl", "https://api.example.com");');
  });

  it('should translate jp.hasCollectionVar', () => {
    const code = 'jp.hasCollectionVar("baseUrl");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.collectionVariables.has("baseUrl");');
  });

  it('should translate jp.deleteCollectionVar', () => {
    const code = 'jp.deleteCollectionVar("baseUrl");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.collectionVariables.unset("baseUrl");');
  });

  it('should translate jp.getAllCollectionVars', () => {
    const code = 'const vars = jp.getAllCollectionVars();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('const vars = pm.collectionVariables.toObject();');
  });

  it('should translate jp.deleteAllCollectionVars', () => {
    const code = 'jp.deleteAllCollectionVars();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.collectionVariables.clear();');
  });

  // Folder variables tests
  it('should translate jp.getFolderVar', () => {
    const code = 'jp.getFolderVar("folderToken");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.get("folderToken");');
  });

  // Request variables tests
  it('should translate jp.getRequestVar', () => {
    const code = 'jp.getRequestVar("requestId");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.get("requestId");');
  });

  // Combined tests
  it('should handle conditional expressions with variable calls', () => {
    const code = 'const userStatus = jp.hasVar("userId") ? "logged-in" : "guest";';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('const userStatus = pm.variables.has("userId") ? "logged-in" : "guest";');
  });

  it('should handle all variable methods together', () => {
    const code = `
// All variable methods
const hasUserId = jp.hasVar("userId");
const userId = jp.getVar("userId");
jp.setVar("requestTime", new Date().toISOString());

console.log(\`Has userId: \${hasUserId}, User ID: \${userId}\`);
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('const hasUserId = pm.variables.has("userId");');
    expect(translatedCode).toContain('const userId = pm.variables.get("userId");');
    expect(translatedCode).toContain('pm.variables.set("requestTime", new Date().toISOString());');
  });

  it('should handle nested expressions with variables', () => {
    const code = 'jp.setVar("fullPath", jp.getEnvVar("baseUrl") + jp.getVar("endpoint"));';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.variables.set("fullPath", pm.environment.get("baseUrl") + pm.variables.get("endpoint"));');
  });
});
