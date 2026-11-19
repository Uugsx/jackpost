const fs = require('fs');
const path = require('path');

const { jpToEnvJson } = require('../src');

describe('jpToEnvJson', () => {
  it('should parse .jp file contents', () => {
    const requestFile = fs.readFileSync(path.join(__dirname, 'fixtures', 'env.jp'), 'utf8');
    const result = jpToEnvJson(requestFile);

    expect(result).toEqual({
      variables: [
        {
          enabled: true,
          name: 'host',
          value: 'https://www.google.com',
          type: 'text'
        },
        {
          enabled: true,
          name: 'jwt',
          value: 'secret',
          type: 'text'
        },
        {
          enabled: false,
          name: 'Content-type',
          value: 'application/json',
          type: 'text'
        }
      ]
    });
  });
});
