import fs from 'fs';
import path from 'path';
import { soapuiToJackpost, isSoapUIProject } from '../../src/soapui/soapui-to-jackpost';

const xml = fs.readFileSync(path.join(__dirname, 'geo.fixture.xml'), 'utf8');

const flatten = (items) => items.flatMap((item) => (item.items ? flatten(item.items) : [item]));

describe('soapuiToJackpost', () => {
  it('detects a SoapUI project', () => {
    expect(isSoapUIProject(xml)).toBe(true);
    expect(isSoapUIProject('<definitions/>')).toBe(false);
  });

  it('converts interface calls into SOAP requests', async () => {
    const collection = await soapuiToJackpost(xml);
    expect(collection.name).toBe('ГЕО');
    const requests = flatten(collection.items);
    expect(requests.length).toBeGreaterThan(0);
    const first = requests[0];
    expect(first.request.method).toBe('POST');
    expect(first.request.url).toContain('geography2');
    expect(first.request.body.mode).toBe('xml');
    expect(first.request.body.xml).toContain('soapenv:Envelope');
    expect(first.request.headers.map((h) => h.name)).toEqual(expect.arrayContaining(['Content-Type', 'SOAPAction']));
  });

  it('rejects input that is not a SoapUI project', async () => {
    await expect(soapuiToJackpost('<a/>')).rejects.toThrow('not a SoapUI project');
  });
});
