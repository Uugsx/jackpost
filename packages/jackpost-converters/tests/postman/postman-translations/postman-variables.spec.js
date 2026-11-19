import postmanTranslation from '../../../src/postman/postman-translations';

describe('postmanTranslations - variables commands', () => {
  test('should translate environment variable commands', () => {
    const inputScript = `
      pm.environment.get('key');
      pm.environment.set('key', 'value');
    `;
    const result = postmanTranslation(inputScript);
    expect(result).toContain('jp.getEnvVar(\'key\')');
    expect(result).toContain('jp.setEnvVar(\'key\', \'value\')');
  });

  test('should translate runtime variable commands', () => {
    const inputScript = `
      pm.variables.get('key');
      pm.variables.set('key', 'value');
    `;
    const result = postmanTranslation(inputScript);
    expect(result).toContain('jp.getVar(\'key\')');
    expect(result).toContain('jp.setVar(\'key\', \'value\')');
  });

  test('should translate pm.collectionVariables.get', () => {
    const inputScript = 'pm.collectionVariables.get(\'key\');';
    const result = postmanTranslation(inputScript);
    expect(result).toContain('jp.getCollectionVar(\'key\')');
  });

  test('should translate pm.expect with pm.environment.has', () => {
    const inputScript = 'pm.expect(pm.environment.has(\'key\')).to.be.true;';
    const result = postmanTranslation(inputScript);
    expect(result).toContain('jp.getEnvVar(\'key\') !== undefined && jp.getEnvVar(\'key\') !== null');
    expect(result).toContain('.to.be.true');
  });

  test('should translate pm.collectionVariables.set to jp.setCollectionVar', () => {
    const inputScript = 'pm.collectionVariables.set(\'key\', \'value\');';
    expect(postmanTranslation(inputScript)).toBe('jp.setCollectionVar(\'key\', \'value\');');
  });

  test('should translate pm.collectionVariables.unset to jp.deleteCollectionVar', () => {
    const inputScript = 'pm.collectionVariables.unset(\'key\');';
    expect(postmanTranslation(inputScript)).toBe('jp.deleteCollectionVar(\'key\');');
  });

  test('should translate pm.collectionVariables.clear to jp.deleteAllCollectionVars', () => {
    const inputScript = 'pm.collectionVariables.clear();';
    expect(postmanTranslation(inputScript)).toBe('jp.deleteAllCollectionVars();');
  });

  test('should translate pm.collectionVariables.toObject to jp.getAllCollectionVars', () => {
    const inputScript = 'const vars = pm.collectionVariables.toObject();';
    expect(postmanTranslation(inputScript)).toBe('const vars = jp.getAllCollectionVars();');
  });

  test('should translate pm.globals.unset to jp.deleteGlobalEnvVar', () => {
    const inputScript = 'pm.globals.unset(\'token\');';
    expect(postmanTranslation(inputScript)).toBe('jp.deleteGlobalEnvVar(\'token\');');
  });

  test('should translate pm.globals.clear to jp.deleteAllGlobalEnvVars', () => {
    const inputScript = 'pm.globals.clear();';
    expect(postmanTranslation(inputScript)).toBe('jp.deleteAllGlobalEnvVars();');
  });
});
