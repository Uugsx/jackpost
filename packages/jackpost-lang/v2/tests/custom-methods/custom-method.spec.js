const fs = require('fs');
const path = require('path');
const jpToJson = require('../../src/jpToJson');
const jsonToJp = require('../../src/jsonToJp');

describe('Custom Method Conversion Tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  describe('parse (JP to JSON)', () => {
    it('should parse FETCH custom method from JP to JSON', () => {
      const input = fs.readFileSync(path.join(fixturesDir, 'custom-method.jp'), 'utf8');
      const expected = require(path.join(fixturesDir, 'custom-method.json'));
      const output = jpToJson(input);

      expect(output).toEqual(expected);
    });

    it('should parse X-CUSTOM method from JP to JSON', () => {
      const input = fs.readFileSync(path.join(fixturesDir, 'custom-method-x-custom.jp'), 'utf8');
      const expected = require(path.join(fixturesDir, 'custom-method-x-custom.json'));
      const output = jpToJson(input);

      expect(output).toEqual(expected);
    });

    it('should parse custom method with special characters from JP to JSON', () => {
      const input = fs.readFileSync(path.join(fixturesDir, 'custom-method-with-special-chars.jp'), 'utf8');
      const expected = require(path.join(fixturesDir, 'custom-method-with-special-chars.json'));
      const output = jpToJson(input);

      expect(output).toEqual(expected);
    });
  });

  describe('stringify (JSON to JP)', () => {
    it('should stringify FETCH custom method from JSON to JP', () => {
      const input = require(path.join(fixturesDir, 'custom-method.json'));
      const expected = fs.readFileSync(path.join(fixturesDir, 'custom-method.jp'), 'utf8');
      const output = jsonToJp(input);

      expect(output).toEqual(expected);
    });

    it('should stringify X-CUSTOM method from JSON to JP', () => {
      const input = require(path.join(fixturesDir, 'custom-method-x-custom.json'));
      const expected = fs.readFileSync(path.join(fixturesDir, 'custom-method-x-custom.jp'), 'utf8');
      const output = jsonToJp(input);

      expect(output).toEqual(expected);
    });

    it('should stringify custom method with special characters from JSON to JP', () => {
      const input = require(path.join(fixturesDir, 'custom-method-with-special-chars.json'));
      const expected = fs.readFileSync(path.join(fixturesDir, 'custom-method-with-special-chars.jp'), 'utf8');
      const output = jsonToJp(input);

      expect(output).toEqual(expected);
    });
  });
});
