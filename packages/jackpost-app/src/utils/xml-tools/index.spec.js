import { validateXml, repairXml, formatXml } from './index';

describe('xml-tools', () => {
  it('validates', () => {
    expect(validateXml('<a><b/></a>').valid).toBe(true);
    expect(validateXml('<a><b></a>').valid).toBe(false);
    expect(validateXml('').valid).toBe(true);
  });

  it('repairs unclosed tags', () => {
    const r = repairXml('<a><b>1</b><c>2');
    expect(r.changed).toBe(true);
    expect(validateXml(r.xml).valid).toBe(true);
    expect(r.xml).toBe('<a><b>1</b><c>2</c></a>');
  });

  it('repairs mismatched and stray closing tags, stray ampersand, bare attributes', () => {
    expect(repairXml('<a><b>x</c></b></a>').xml).toBe('<a><b>x</b></a>');
    expect(repairXml('<a>Tom & Jerry</a>').xml).toBe('<a>Tom &amp; Jerry</a>');
    expect(repairXml('<a id=5/>').xml).toBe('<a id="5"/>');
    expect(repairXml('junk <a/>').xml).toBe('<a/>');
  });

  it('leaves valid xml alone', () => {
    expect(repairXml('<a><b>1</b></a>')).toEqual({ xml: '<a><b>1</b></a>', changed: false });
  });

  it('keeps {{variables}} intact', () => {
    expect(repairXml('<a><t>{{token}}</t>').xml).toBe('<a><t>{{token}}</t></a>');
  });

  it('formats', () => {
    expect(formatXml('<a><b>1</b><c/></a>')).toBe('<a>\n  <b>1</b>\n  <c/>\n</a>');
    expect(formatXml('<a><b></a>')).toBe('<a><b></a>');
  });
});
