const fs = require('node:fs');
const path = require('node:path');
const { jpRequestParseAndRedactBodyData } = require("../utils/request-parse-and-redact-body-data");

describe("parse and redact body data", () => {
  it("should redact body blocks from the jp file string", () => {
    const fixturesPath = `/fixtures/request-parse-and-redact-body-data`;
    const inputJpString = fs.readFileSync(path.join(__dirname, fixturesPath, './input.jp'), 'utf8');
    const expectedOutputJpString = fs.readFileSync(path.join(__dirname, fixturesPath, './output.jp'), 'utf8');

    const res = jpRequestParseAndRedactBodyData(inputJpString);
    expect(res.jpFileStringWithRedactedBody).toBe(expectedOutputJpString);
    expect(res.extractedBodyContent).toEqual({
      graphql: `
{
  launchesPast {
    launch_site {
      site_name
    }
    launch_success
  }
}
      `.trim(),
      json: `
{
  "hello": "world"
}     
      `.trim(),
      sparql: `
SELECT * WHERE {
  ?subject ?predicate ?object .
}
LIMIT 10
      `.trim(),
      text: `This is a text body`, 
      xml: `
<xml>
  <name>John</name>
  <age>30</age>
</xml>
      `.trim()
    })
  });
});