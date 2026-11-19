const fs = require('fs');
const path = require('path');
const collectionJpToJson = require('../src/collectionJpToJson');
const jsonToCollectionJp = require('../src/jsonToCollectionJp');

describe('collectionJpToJson', () => {
  it('should parse the collection jp file', () => {
    const input = fs.readFileSync(path.join(__dirname, 'fixtures', 'collection.jp'), 'utf8');
    const expected = require('./fixtures/collection.json');
    const output = collectionJpToJson(input);

    expect(output).toEqual(expected);
  });
});

describe('jsonToCollectionJp', () => {
  it('should convert the collection json to jp', () => {
    const input = require('./fixtures/collection.json');
    const expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'collection.jp'), 'utf8');
    const output = jsonToCollectionJp(input);

    expect(output).toEqual(expected);
  });
});

describe('description round-trip in collection.jp', () => {
  it('should round-trip a multiline description on a header', () => {
    const json = {
      headers: [{ name: 'Authorization', value: 'Bearer token', enabled: true, description: 'Line 1\nLine 2' }]
    };
    const jp = jsonToCollectionJp(json);
    const parsed = collectionJpToJson(jp);
    expect(parsed.headers[0].description).toBe('Line 1\nLine 2');
    expect(parsed.headers[0].value).toBe('Bearer token');
  });

  it('should round-trip a description on a var with a multiline value', () => {
    const json = {
      vars: {
        req: [{ name: 'myVar', value: 'line1\nline2', enabled: true, description: 'my desc' }]
      }
    };
    const jp = jsonToCollectionJp(json);
    const parsed = collectionJpToJson(jp);
    expect(parsed.vars.req[0].description).toBe('my desc');
    expect(parsed.vars.req[0].value).toBe('line1\nline2');
  });

  it('should round-trip a description containing triple-quotes', () => {
    const json = {
      headers: [{ name: 'X-Token', value: 'abc', enabled: true, description: 'has \'\'\' quotes' }]
    };
    const jp = jsonToCollectionJp(json);
    const parsed = collectionJpToJson(jp);
    expect(parsed.headers[0].description).toBe('has \'\'\' quotes');
  });
});

describe('jsonToCollectionJp - meta tags', () => {
  it('should serialize tags as a list block', () => {
    const jp = jsonToCollectionJp({ meta: { name: 'folder', seq: 1, tags: ['tag_1', 'tag_2'] } });

    expect(jp).toEqual(`meta {
  name: folder
  seq: 1
  tags: [
    tag_1
    tag_2
  ]
}
`);
  });

  it('should not write a tags key when tags is an empty array', () => {
    const jp = jsonToCollectionJp({ meta: { name: 'folder', tags: [] } });

    expect(jp).toEqual(`meta {
  name: folder
}
`);
  });

  it('should not write a tags key when tags is absent', () => {
    const jp = jsonToCollectionJp({ meta: { name: 'folder' } });

    expect(jp).toEqual(`meta {
  name: folder
}
`);
  });

  it('should serialize tags alongside other blocks', () => {
    const jp = jsonToCollectionJp({
      meta: { name: 'folder', tags: ['tag_1'] },
      headers: [{ name: 'content-type', value: 'application/json', enabled: true }],
      docs: 'some docs'
    });

    expect(jp).toEqual(`meta {
  name: folder
  tags: [
    tag_1
  ]
}

headers {
  content-type: application/json
}

docs {
  some docs
}
`);
  });
});

describe('tags round-trip in collection.jp', () => {
  it('should round-trip folder meta tags', () => {
    const json = { meta: { name: 'folder', seq: 1, tags: ['tag_1', 'tag-2', 'Tag_3'] } };
    const parsed = collectionJpToJson(jsonToCollectionJp(json));

    expect(parsed.meta.tags).toEqual(['tag_1', 'tag-2', 'Tag_3']);
    expect(parsed.meta.name).toEqual('folder');
    expect(parsed.meta.seq).toEqual('1');
  });

  it('should round-trip a collection.jp that has tags and other blocks', () => {
    const json = {
      meta: { name: 'folder', tags: ['smoke'] },
      headers: [{ name: 'Authorization', value: 'Bearer 123', enabled: true }],
      docs: 'This folder needs auth token to be set in the headers.'
    };
    const parsed = collectionJpToJson(jsonToCollectionJp(json));

    expect(parsed.meta.tags).toEqual(['smoke']);
    expect(parsed.headers).toEqual([{ name: 'Authorization', value: 'Bearer 123', enabled: true }]);
    expect(parsed.docs).toEqual('This folder needs auth token to be set in the headers.');
  });

  it('should round-trip a meta block with no tags', () => {
    const parsed = collectionJpToJson(jsonToCollectionJp({ meta: { name: 'folder', tags: [] } }));

    expect(parsed.meta.tags).toBeUndefined();
    expect(parsed.meta.name).toEqual('folder');
  });
});
