const fs = require('fs');
const path = require('path');

const { envJsonToJp } = require('../src');

describe('envJsonToJp', () => {
  it('should convert json file into .jp file', () => {
    const env = {
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
    };

    const expectedJpFile = fs.readFileSync(path.join(__dirname, 'fixtures', 'env.jp'), 'utf8');
    const actualJpFile = envJsonToJp(env);

    expect(expectedJpFile).toEqual(actualJpFile);
  });
});
