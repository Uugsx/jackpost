import translateJpToPostman from '../../../src/utils/jackpost-to-postman-translator';

describe('Jackpost to Postman Environment Variable Translation', () => {
  it('should translate jp.getEnvVar', () => {
    const code = 'jp.getEnvVar("test");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.environment.get("test");');
  });

  it('should translate jp.setEnvVar', () => {
    const code = 'jp.setEnvVar("test", "value");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.environment.set("test", "value");');
  });

  it('should translate jp.deleteEnvVar', () => {
    const code = 'jp.deleteEnvVar("test");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.environment.unset("test");');
  });

  it('should translate jp.hasEnvVar', () => {
    const code = 'jp.hasEnvVar("apiKey");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.environment.has("apiKey");');
  });

  it('should translate jp.getEnvName() to pm.environment.name (function to property)', () => {
    const code = 'const envName = jp.getEnvName();';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('const envName = pm.environment.name;');
  });

  it('should handle nested Postman API calls with environment', () => {
    const code = 'jp.setEnvVar("computed", jp.getVar("base") + "-suffix");';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.environment.set("computed", pm.variables.get("base") + "-suffix");');
  });

  it('should handle JSON operations with environment variables', () => {
    const code = 'jp.setEnvVar("user", JSON.stringify({ id: 123, name: "John" }));';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('pm.environment.set("user", JSON.stringify({ id: 123, name: "John" }));');
  });

  it('should handle JSON.parse with environment variables', () => {
    const code = 'const userData = JSON.parse(jp.getEnvVar("user"));';
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toBe('const userData = JSON.parse(pm.environment.get("user"));');
  });

  it('should handle all environment variable methods together', () => {
    const code = `
// All environment variable methods
const token = jp.getEnvVar("token");
jp.setEnvVar("timestamp", new Date().toISOString());

console.log(\`Token: \${token}\`);
`;
    const translatedCode = translateJpToPostman(code);

    expect(translatedCode).toContain('const token = pm.environment.get("token");');
    expect(translatedCode).toContain('pm.environment.set("timestamp", new Date().toISOString());');
  });

  it('should handle environment variables with computed property names', () => {
    const code = `
const prefix = "api";
const suffix = "Key";
jp.setEnvVar(prefix + "_" + suffix, "abc123");
const computedValue = jp.getEnvVar(prefix + "_" + suffix);
`;
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toContain('pm.environment.set(prefix + "_" + suffix, "abc123");');
    expect(translatedCode).toContain('const computedValue = pm.environment.get(prefix + "_" + suffix);');
  });

  it('should handle environment variables in complex object structures', () => {
    const code = `
const config = {
    baseUrl: jp.getEnvVar("apiUrl"),
    headers: {
        "Authorization": "Bearer " + jp.getEnvVar("token"),
        "X-Api-Key": jp.getEnvVar("apiKey") || "default-key"
    },
    timeout: parseInt(jp.getEnvVar("timeout") || "5000")
};
`;
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toContain('baseUrl: pm.environment.get("apiUrl"),');
    expect(translatedCode).toContain('"Authorization": "Bearer " + pm.environment.get("token"),');
    expect(translatedCode).toContain('"X-Api-Key": pm.environment.get("apiKey") || "default-key"');
    expect(translatedCode).toContain('timeout: parseInt(pm.environment.get("timeout") || "5000")');
  });

  it('should handle environment variables in try-catch blocks', () => {
    const code = `
try {
    const configStr = jp.getEnvVar("config");
    const config = JSON.parse(configStr);
    console.log("Config loaded:", config.version);
} catch (error) {
    console.error("Failed to parse config");
    jp.setEnvVar("configError", error.message);
}
`;
    const translatedCode = translateJpToPostman(code);
    expect(translatedCode).toContain('const configStr = pm.environment.get("config");');
    expect(translatedCode).toContain('pm.environment.set("configError", error.message);');
  });
});
