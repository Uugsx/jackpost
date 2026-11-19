const { redactLargeJpTextBlocks, restoreRedactedBlocks } = require('../utils/redact-large-text-blocks');
const { parseJpRequest, parseJpCollection } = require('../index');

const parseViaRedaction = (content, parser) => {
  const { skeleton, blocks } = redactLargeJpTextBlocks(content);
  return restoreRedactedBlocks(parser(skeleton), blocks);
};

const toCRLF = (content) => content.replace(/\n/g, '\r\n');

const requestJp = `meta {
  name: Redaction Test
  type: http
  seq: 1
}

get {
  url: https://example.com/api
  body: json
}

headers {
  content-type: application/json
}

body:json {
  {
    "hello": "world",
    "nested": {
      "a": 1,
      "b": [1, 2, 3]
    }
  }
}

body:text {
  This is a text body
  spanning multiple lines
}

script:pre-request {
  const x = 1;
  if (x) {
    console.log("hi");
  }
}

script:post-response {
  jp.setVar("y", 2);
}

tests {
  test("ok", function() {
    expect(1).to.equal(1);
  });
}

docs {
  # Title

  Some **markdown** docs with a fenced block:

      code line stays indented
}
`;

const graphqlJp = `meta {
  name: GraphQL Test
  type: graphql
  seq: 1
}

post {
  url: https://example.com/graphql
  body: graphql
}

body:graphql {
  {
    launchesPast {
      launch_site {
        site_name
      }
    }
  }
}

body:graphql:vars {
  {
    "limit": 10
  }
}
`;

const grpcJp = `meta {
  name: gRPC Test
  type: grpc
  seq: 1
}

grpc {
  url: grpc://localhost:50051
  method: /hello.Greeter/SayHello
  methodType: unary
}

body:grpc {
  name: message 1
  content: '''
    {
      "greeting": "hi"
    }
  '''
}

script:grpc:before-call-start {
  const startedAt = 1;
  if (startedAt) {
    jp.setVar("startedAt", startedAt);
  }
}

script:grpc:after-call-end {
  jp.setVar("endedAt", 2);
}

script:grpc:before-message-send {
  jp.setVar("sentAt", jp.grpc.request.message.timestamp);
}

script:grpc:after-message-receive {
  jp.setVar("receivedAt", jp.grpc.response.message.timestamp);
}

tests {
  test("hook ran", function() {
    expect(jp.getVar("startedAt")).to.equal(1);
  });
}
`;

const xmlSparqlJp = `meta {
  name: Others
  type: http
  seq: 1
}

post {
  url: https://example.com
  body: xml
}

body:xml {
  <xml>
    <name>John</name>
  </xml>
}

body:sparql {
  SELECT * WHERE {
    ?s ?p ?o .
  }
  LIMIT 10
}
`;

const collectionJp = `headers {
  x-trace: enabled
}

script:pre-request {
  jp.setEnvVar("base", "https://example.com");
}

tests {
  test("collection level", function() {
    expect(true).to.equal(true);
  });
}

docs {
  # Collection docs

  Notes for the whole collection.
}
`;

const folderJp = `meta {
  name: My Folder
  seq: 2
}

docs {
  # Folder docs
}
`;

const blankLinesJp = `meta {
  name: Blanks
  type: http
  seq: 1
}

post {
  url: https://example.com
  body: json
}

body:json {

  {
    "a": 1
  }


}
`;

const appJp = `meta {
  name: App Request
  type: http
  seq: 1
}

get {
  url: https://example.com
  body: none
  auth: none
}

app {
  enabled: true
  code: '''
    <div id="x">hi</div>
    <style>
    body {
      color: red;
    }
    </style>
    <script>
      function go() {
        return { ok: 1 };
      }
    </script>
  '''
}

docs {
  # Docs after the app block
}
`;

const standaloneAppJp = `meta {
  name: Dashboard
  type: app
  seq: 2
}

app {
  code: '''
    <div id="app">standalone</div>
  '''
}
`;

const appWithoutCodeJp = `meta {
  name: No Code
  type: http
  seq: 1
}

get {
  url: https://example.com
  body: none
  auth: none
}

app {
  enabled: true
}
`;

const appEmptyCodeJp = `meta {
  name: Empty Code
  type: http
  seq: 1
}

app {
  enabled: true
  code: '''
  '''
}
`;

const docsAboutAppCodeJp = `meta {
  name: Docs About App Code
  type: http
  seq: 1
}

get {
  url: https://example.com
}

docs {
  # How the app block works

  app {
    code: '''
      <div>hi</div>
    '''
  }
}
`;

const appWithoutCodeThenDocsJp = `meta {
  name: No Code Then Docs
  type: http
  seq: 1
}

get {
  url: https://example.com
}

app {
  enabled: true
}

docs {
  Set the code like this:

  code: '''
    <div>hi</div>
  '''
}
`;

describe('redactLargeJpTextBlocks', () => {
  describe('matches a normal parse (ohm oracle)', () => {
    const requestCases = [
      ['request with bodies, scripts, tests, docs', requestJp],
      ['graphql query + variables', graphqlJp],
      ['xml + sparql bodies', xmlSparqlJp],
      ['grpc request with lifecycle hooks', grpcJp],
      ['CRLF grpc request with lifecycle hooks', toCRLF(grpcJp)],
      ['CRLF request', toCRLF(requestJp)],
      ['leading + trailing blank lines in body', blankLinesJp],
      ['CRLF leading + trailing blank lines', toCRLF(blankLinesJp)],
      ['request-level app code', appJp],
      ['CRLF request-level app code', toCRLF(appJp)],
      ['standalone app item', standaloneAppJp],
      ['app block without code', appWithoutCodeJp],
      ['app block with an empty code value', appEmptyCodeJp],
      ['docs documenting an app code block', docsAboutAppCodeJp],
      ['app block without code followed by docs holding a code pair', appWithoutCodeThenDocsJp]
    ];

    it.each(requestCases)('%s', (_name, content) => {
      expect(parseViaRedaction(content, parseJpRequest)).toEqual(parseJpRequest(content));
    });

    const collectionCases = [
      ['collection', collectionJp],
      ['folder', folderJp],
      ['CRLF collection', toCRLF(collectionJp)]
    ];

    it.each(collectionCases)('%s', (_name, content) => {
      expect(parseViaRedaction(content, parseJpCollection)).toEqual(parseJpCollection(content));
    });
  });

  it('extracts each large text block and shrinks the skeleton', () => {
    const { skeleton, blocks } = redactLargeJpTextBlocks(requestJp);
    expect(blocks.length).toBe(6);
    expect(skeleton.length).toBeLessThan(requestJp.length);
    blocks.forEach((block) => {
      expect(skeleton).toContain(block.token);
      expect(skeleton).not.toContain(block.value);
    });
  });

  it('extracts the grpc lifecycle hooks and leaves the dictionary message block in place', () => {
    const { skeleton, blocks } = redactLargeJpTextBlocks(grpcJp);
    // all four lifecycle hooks + tests; `body:grpc` is a dictionary and stays in the skeleton
    expect(blocks.length).toBe(5);
    expect(skeleton.length).toBeLessThan(grpcJp.length);
    blocks.forEach((block) => {
      expect(skeleton).toContain(block.token);
      expect(skeleton).not.toContain(block.value);
    });
  });

  it('keeps the skeleton bounded regardless of block size', () => {
    const blob = 'x'.repeat(4 * 1024 * 1024);
    const jp = `meta {
  name: Huge
  type: http
  seq: 1
}

post {
  url: https://example.com
  body: json
}

body:json {
  { "blob": "${blob}" }
}
`;
    const { skeleton, blocks } = redactLargeJpTextBlocks(jp);
    expect(jp.length).toBeGreaterThan(4 * 1024 * 1024);
    expect(skeleton.length).toBeLessThan(1024);
    expect(blocks[0].value).toContain(blob);
  });

  it('keeps huge app code out of the skeleton, pair and delimiters intact', () => {
    const blob = 'x'.repeat(4 * 1024 * 1024);
    const jp = appJp.replace('<div id="x">hi</div>', `<div>${blob}</div>`);

    const { skeleton, blocks } = redactLargeJpTextBlocks(jp);
    expect(skeleton.length).toBeLessThan(1024);
    expect(skeleton).toMatch(/code: '''\n\s+__JP_REDACTED_TEXT_BLOCK_\w+__\n\s+'''/);
    expect(skeleton).toContain('enabled: true');
    expect(blocks.some((block) => block.value.includes(blob))).toBe(true);
  });

  it('leaves an app block whose code has no value untouched', () => {
    const { blocks } = redactLargeJpTextBlocks(appEmptyCodeJp);
    expect(blocks).toEqual([]);
  });

  it('leaves a code pair outside the app block untouched', () => {
    const { blocks } = redactLargeJpTextBlocks(docsAboutAppCodeJp);
    expect(blocks.length).toBe(1);
    expect(blocks[0].value).toContain("code: '''");
    expect(blocks[0].value).toContain('<div>hi</div>');
    expect(blocks[0].value).not.toContain('__JP_REDACTED_TEXT_BLOCK_');
  });

  it('leaves a code pair after an app block that has no code untouched', () => {
    const { blocks } = redactLargeJpTextBlocks(appWithoutCodeThenDocsJp);
    expect(blocks.length).toBe(1);
    expect(blocks[0].value).toContain("code: '''");
    expect(blocks[0].value).not.toContain('__JP_REDACTED_TEXT_BLOCK_');
  });

  it('leaves dictionary body blocks untouched', () => {
    const multipart = `meta {
  name: Multipart
  type: http
  seq: 1
}

post {
  url: https://example.com
  body: multipartForm
}

body:multipart-form {
  field: value
}
`;
    const { blocks } = redactLargeJpTextBlocks(multipart);
    expect(blocks.length).toBe(0);
    expect(parseViaRedaction(multipart, parseJpRequest)).toEqual(parseJpRequest(multipart));
  });

  it('captures nested braces in content without ending the block early', () => {
    const nested = `body:json {
  {
    "a": {
      "b": [ { "c": 1 } ],
      "d": {}
    }
  }
}

script:pre-request {
  function outer() {
    if (true) {
      return { ok: 1 };
    }
  }
}
`;
    const { blocks } = redactLargeJpTextBlocks(nested);
    expect(blocks.length).toBe(2);
    expect(blocks[0].value).toContain('"c": 1');
    expect(blocks[0].value).toContain('"d": {}');
    expect(blocks[1].value).toContain('return { ok: 1 };');
    expect(parseViaRedaction(nested, parseJpRequest)).toEqual(parseJpRequest(nested));
  });

  it('only redacts blocks at column 0, never indented tags', () => {
    const indented = `docs {
  Nested pseudo-block should be treated as content:
    body:json {
      { "a": 1 }
    }
}
`;
    const { blocks } = redactLargeJpTextBlocks(indented);
    expect(blocks.length).toBe(1);
    expect(blocks[0].value).toContain('body:json {');
  });

  it('returns content unchanged when no large text blocks are present', () => {
    const minimal = `meta {
  name: Bare
  type: http
  seq: 1
}

get {
  url: https://example.com
}
`;
    const { skeleton, blocks } = redactLargeJpTextBlocks(minimal);
    expect(blocks).toEqual([]);
    expect(skeleton).toBe(minimal);
  });
});

describe('restoreRedactedBlocks', () => {
  it('returns the parsed object unchanged when there are no blocks', () => {
    const parsed = { request: { body: { json: 'x' } } };
    expect(restoreRedactedBlocks(parsed, [])).toBe(parsed);
  });
});
