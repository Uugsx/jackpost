const { bindRunRequest, createScopeSetter } = require('../src/runtime/scripted-entries');

describe('bindRunRequest', () => {
  test('does nothing when no host function is provided', () => {
    const jp = {};
    bindRunRequest(jp, undefined);
    expect(jp.runRequest).toBeUndefined();
  });

  test('exposes jp.runRequest that forwards (pathname, callerJp) to the host', async () => {
    const host = jest.fn().mockResolvedValue('done');
    const jp = {};

    bindRunRequest(jp, host);
    const result = await jp.runRequest('relative/path.jp');

    expect(result).toBe('done');
    expect(host).toHaveBeenCalledTimes(1);
    expect(host).toHaveBeenCalledWith('relative/path.jp', jp);
  });

  test('each jp gets bound with its own callerJp so entries can be attributed', async () => {
    const host = jest.fn().mockResolvedValue(null);
    const jpA = { name: 'A' };
    const jpB = { name: 'B' };

    bindRunRequest(jpA, host);
    bindRunRequest(jpB, host);

    await jpA.runRequest('a.jp');
    await jpB.runRequest('b.jp');

    expect(host).toHaveBeenNthCalledWith(1, 'a.jp', jpA);
    expect(host).toHaveBeenNthCalledWith(2, 'b.jp', jpB);
  });
});

describe('createScopeSetter', () => {
  test('mutates jp._currentScope with the scope object', () => {
    const jp = {};
    const setScope = createScopeSetter(jp);

    setScope({ type: 'collection', sourceFile: 'collection.jp' });
    expect(jp._currentScope).toEqual({ type: 'collection', sourceFile: 'collection.jp' });

    setScope({ type: 'request', sourceFile: 'auth/login.jp' });
    expect(jp._currentScope).toEqual({ type: 'request', sourceFile: 'auth/login.jp' });
  });

  test('clears _currentScope when called with a falsy value', () => {
    const jp = { _currentScope: { type: 'folder', sourceFile: 'auth/folder.jp' } };
    const setScope = createScopeSetter(jp);

    setScope(null);
    expect(jp._currentScope).toBeNull();

    setScope({ type: 'request', sourceFile: 'x.jp' });
    setScope(undefined);
    expect(jp._currentScope).toBeNull();
  });
});
