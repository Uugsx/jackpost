import postmanTranslation from '../../../src/postman/postman-translations';

describe('postmanTranslations - edge cases', () => {
  test('should handle nested commands and edge cases', () => {
    const inputScript = `
      const sampleObjects = [
        {
          key: pm.environment.get('key'),
          value: pm.variables.get('value')
        },
        {
          key: pm.collectionVariables.get('key'),
          value: pm.collectionVariables.get('value')
        }
      ];
      const dataTesting = Object.entries(sampleObjects || {}).reduce((acc, [key, value]) => {
        // this is a comment
        acc[key] = pm.collectionVariables.get(pm.environment.get(value));
        return acc; // Return the accumulator
      }, {});
      Object.values(dataTesting).forEach((data) => {
        pm.environment.set(data.key, pm.variables.get(data.value));
      });
    `;
    const expectedOutput = `
      const sampleObjects = [
        {
          key: jp.getEnvVar('key'),
          value: jp.getVar('value')
        },
        {
          key: jp.getCollectionVar('key'),
          value: jp.getCollectionVar('value')
        }
      ];
      const dataTesting = Object.entries(sampleObjects || {}).reduce((acc, [key, value]) => {
        // this is a comment
        acc[key] = jp.getCollectionVar(jp.getEnvVar(value));
        return acc; // Return the accumulator
      }, {});
      Object.values(dataTesting).forEach((data) => {
        jp.setEnvVar(data.key, jp.getVar(data.value));
      });
    `;
    expect(postmanTranslation(inputScript)).toBe(expectedOutput);
  });
});
