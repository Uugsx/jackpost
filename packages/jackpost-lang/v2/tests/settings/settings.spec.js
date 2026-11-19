const fs = require('fs');
const path = require('path');
const jpToJson = require('../../src/jpToJson');
const jsonToJp = require('../../src/jsonToJp');

describe('Settings Conversion Tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  describe('parse (JP to JSON)', () => {
    it('should parse minimal settings from JP to JSON', () => {
      const input = fs.readFileSync(path.join(fixturesDir, 'settings-minimal.jp'), 'utf8');
      const expected = require(path.join(fixturesDir, 'settings-minimal.json'));
      const output = jpToJson(input);

      expect(output).toEqual(expected);
    });

    it('should parse all settings options from JP to JSON', () => {
      const input = fs.readFileSync(path.join(fixturesDir, 'settings-all-options.jp'), 'utf8');
      const expected = require(path.join(fixturesDir, 'settings-all-options.json'));
      const output = jpToJson(input);

      expect(output).toEqual(expected);
    });
  });

  describe('stringify (JSON to JP)', () => {
    it('should stringify minimal settings from JSON to JP (with defaults)', () => {
      const input = require(path.join(fixturesDir, 'settings-minimal.json'));
      const expected = fs.readFileSync(path.join(fixturesDir, 'settings-minimal.jp'), 'utf8');
      const output = jsonToJp(input);

      expect(output).toEqual(expected);
    });

    it('should stringify all settings options from JSON to JP', () => {
      const input = require(path.join(fixturesDir, 'settings-all-options.json'));
      const expected = fs.readFileSync(path.join(fixturesDir, 'settings-all-options.jp'), 'utf8');
      const output = jsonToJp(input);

      expect(output).toEqual(expected);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through JSON -> JP -> JSON conversion', () => {
      const originalJson = require(path.join(fixturesDir, 'settings-all-options.json'));

      // Convert JSON to JP
      const jp = jsonToJp(originalJson);

      // Convert JP back to JSON
      const convertedJson = jpToJson(jp);

      expect(convertedJson).toEqual(originalJson);
    });
  });
});
