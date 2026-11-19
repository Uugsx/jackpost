import fs from 'node:fs';
import path from 'node:path';
import parseCollection from '../parseCollection';

const loadFixture = (name) =>
  fs.readFileSync(path.join(__dirname, 'fixtures', 'presets', `${name}.yml`), 'utf8');

describe('yml parseCollection - presets', () => {
  it('parses presets when request.type and request.url are present', () => {
    const { jackpostConfig } = parseCollection(loadFixture('with-type-and-url'));

    expect(jackpostConfig.presets).toEqual({
      requestType: 'graphql',
      requestUrl: 'https://example.com/graphql'
    });
  });

  it('defaults requestType and requestUrl to empty strings (not arrays) when request fields are missing', () => {
    const { jackpostConfig } = parseCollection(loadFixture('empty-request'));

    expect(jackpostConfig.presets).toEqual({
      requestType: '',
      requestUrl: ''
    });
    expect(Array.isArray(jackpostConfig.presets.requestType)).toBe(false);
    expect(Array.isArray(jackpostConfig.presets.requestUrl)).toBe(false);
  });

  it('does not set presets when the extension has no presets block', () => {
    const { jackpostConfig } = parseCollection(loadFixture('no-presets'));

    expect(jackpostConfig.presets).toBeUndefined();
  });

  it('does not set presets when presets exists but request key is absent', () => {
    const { jackpostConfig } = parseCollection(loadFixture('no-request-key'));

    expect(jackpostConfig.presets).toBeUndefined();
  });

  it('parses a realistic collection with only request.type set (no url) — defaults url to empty string', () => {
    const { jackpostConfig } = parseCollection(loadFixture('type-only-realistic'));

    expect(jackpostConfig.presets).toEqual({
      requestType: 'graphql',
      requestUrl: ''
    });
    expect(Array.isArray(jackpostConfig.presets.requestUrl)).toBe(false);
    expect(jackpostConfig.ignore).toEqual(['node_modules', '.git']);
  });

  it('parses a realistic collection with request.type http and request.url set', () => {
    const { jackpostConfig } = parseCollection(loadFixture('url-only-realistic'));

    expect(jackpostConfig.presets).toEqual({
      requestType: 'http',
      requestUrl: 'https://example.com/graphql'
    });
    expect(Array.isArray(jackpostConfig.presets.requestType)).toBe(false);
    expect(Array.isArray(jackpostConfig.presets.requestUrl)).toBe(false);
    expect(jackpostConfig.ignore).toEqual(['node_modules', '.git']);
  });
});
