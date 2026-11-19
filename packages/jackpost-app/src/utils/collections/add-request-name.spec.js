import { getAddRequestName, isWsdlOperationFolder } from './index';

describe('getAddRequestName', () => {
  const op = {
    uid: 'op',
    type: 'folder',
    name: 'getParcelShops',
    items: [
      { uid: 'a', type: 'http-request', name: 'Request 1' },
      { uid: 'b', type: 'http-request', name: 'Request 2' }
    ]
  };
  const collection = { items: [op] };

  it('picks next free number inside an operation folder', () => {
    expect(getAddRequestName(collection, op.items[0])).toBe('Request 3');
  });

  it('detects an operation folder', () => {
    expect(isWsdlOperationFolder(op)).toBe(true);
    expect(isWsdlOperationFolder({ type: 'folder', items: [{ type: 'folder', name: 'x', items: [] }] })).toBe(false);
  });
});
