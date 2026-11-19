const fs = require('fs');
const path = require('path');
const jpToJson = require('../src/jpToJson');
const jsonToJp = require('../src/jsonToJp');

describe('jpToJson', () => {
  it('should parse the jp file', () => {
    const input = fs.readFileSync(path.join(__dirname, 'fixtures', 'request.jp'), 'utf8');
    const expected = require('./fixtures/request.json');
    const output = jpToJson(input);

    expect(output).toEqual(expected);
  });
});

describe('jsonToJp', () => {
  it('should parse the json file', () => {
    const input = require('./fixtures/request.json');
    const expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'request.jp'), 'utf8');
    const output = jsonToJp(input);

    expect(output).toEqual(expected);
  });
});

describe('round-trip', () => {
  it('should preserve all six script blocks through jsonToJp and back', () => {
    const json = {
      script: {
        req: 'req.setHeader(\'Content-Type\', \'application/json\');',
        res: 'expect(res.status).to.equal(200);',
        beforeCallStart: 'req.setMetadata(\'authorization\', \'Bearer token\');',
        afterCallEnd: 'if (res.getStatusCode() === 0) {\n  jp.setVar(\'ok\', true);\n}',
        beforeMessageSend: 'jp.setVar(\'sent\', jp.grpc.request.message.timestamp);',
        afterMessageReceive: 'if (jp.grpc.response.message.data) {\n  jp.setVar(\'received\', true);\n}'
      }
    };

    expect(jpToJson(jsonToJp(json))).toEqual(json);
  });
});
