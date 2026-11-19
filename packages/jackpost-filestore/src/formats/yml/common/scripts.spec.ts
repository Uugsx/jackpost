import { toOpenCollectionScripts, toJackpostScripts } from './scripts';
import { HTTP_SCRIPT_KEYS, GRPC_SCRIPT_KEYS } from '@jackpost/common';

describe('toOpenCollectionScripts', () => {
  it('returns undefined when there is nothing to write', () => {
    expect(toOpenCollectionScripts(null, HTTP_SCRIPT_KEYS)).toBeUndefined();
    expect(toOpenCollectionScripts(undefined, HTTP_SCRIPT_KEYS)).toBeUndefined();
    expect(toOpenCollectionScripts({} as any, HTTP_SCRIPT_KEYS)).toBeUndefined();
    expect(toOpenCollectionScripts({ script: { req: null, res: null }, tests: null } as any, HTTP_SCRIPT_KEYS)).toBeUndefined();
  });

  it('writes req/res as before-request/after-response for the http keys', () => {
    const out = toOpenCollectionScripts(
      { script: { req: 'pre()', res: 'post()' } } as any,
      HTTP_SCRIPT_KEYS
    );

    expect(out).toEqual([
      { type: 'before-request', code: 'pre()' },
      { type: 'after-response', code: 'post()' }
    ]);
  });

  it('writes the grpc lifecycle hooks for the grpc keys', () => {
    const out = toOpenCollectionScripts(
      {
        script: {
          beforeCallStart: 'before()',
          beforeMessageSend: 'beforeSend()',
          afterMessageReceive: 'afterReceive()',
          afterCallEnd: 'after()'
        }
      } as any,
      GRPC_SCRIPT_KEYS
    );

    expect(out).toEqual([
      { type: 'grpc:before-call-start', code: 'before()' },
      { type: 'grpc:before-message-send', code: 'beforeSend()' },
      { type: 'grpc:after-message-receive', code: 'afterReceive()' },
      { type: 'grpc:after-call-end', code: 'after()' }
    ]);
  });

  it('drops script slots outside the allowed keys', () => {
    const script = {
      req: 'pre()',
      res: 'post()',
      beforeCallStart: 'before()',
      beforeMessageSend: 'beforeSend()',
      afterMessageReceive: 'afterReceive()',
      afterCallEnd: 'after()'
    };

    expect(toOpenCollectionScripts({ script } as any, HTTP_SCRIPT_KEYS)).toEqual([
      { type: 'before-request', code: 'pre()' },
      { type: 'after-response', code: 'post()' }
    ]);
    expect(toOpenCollectionScripts({ script } as any, GRPC_SCRIPT_KEYS)).toEqual([
      { type: 'grpc:before-call-start', code: 'before()' },
      { type: 'grpc:before-message-send', code: 'beforeSend()' },
      { type: 'grpc:after-message-receive', code: 'afterReceive()' },
      { type: 'grpc:after-call-end', code: 'after()' }
    ]);
  });

  it('returns undefined when every populated slot is gated out', () => {
    expect(toOpenCollectionScripts({ script: { beforeCallStart: 'before()' } } as any, HTTP_SCRIPT_KEYS)).toBeUndefined();
    expect(toOpenCollectionScripts({ script: { beforeMessageSend: 'beforeSend()' } } as any, HTTP_SCRIPT_KEYS)).toBeUndefined();
    expect(toOpenCollectionScripts({ script: { req: 'pre()' } } as any, GRPC_SCRIPT_KEYS)).toBeUndefined();
  });

  it('preserves surrounding whitespace and skips whitespace-only scripts', () => {
    const out = toOpenCollectionScripts(
      { script: { req: '\npre()\n\n', res: '   \n  ' }, tests: 'test()\n' } as any,
      HTTP_SCRIPT_KEYS
    );

    expect(out).toEqual([
      { type: 'before-request', code: '\npre()\n\n' },
      { type: 'tests', code: 'test()\n' }
    ]);
  });

  it('writes tests regardless of the allowed keys', () => {
    expect(toOpenCollectionScripts({ tests: 'test()' } as any, HTTP_SCRIPT_KEYS)).toEqual([
      { type: 'tests', code: 'test()' }
    ]);
    expect(toOpenCollectionScripts({ tests: 'test()' } as any, GRPC_SCRIPT_KEYS)).toEqual([
      { type: 'tests', code: 'test()' }
    ]);
  });
});

describe('toJackpostScripts', () => {
  it('returns undefined for null / empty input', () => {
    expect(toJackpostScripts(null)).toBeUndefined();
    expect(toJackpostScripts(undefined)).toBeUndefined();
    expect(toJackpostScripts([])).toBeUndefined();
  });

  it('maps every known script type to its jackpost script slot', () => {
    expect(
      toJackpostScripts([
        { type: 'before-request', code: 'pre()' },
        { type: 'after-response', code: 'post()' },
        { type: 'grpc:before-call-start', code: 'before()' },
        { type: 'grpc:after-call-end', code: 'after()' },
        { type: 'grpc:before-message-send', code: 'beforeSend()' },
        { type: 'grpc:after-message-receive', code: 'afterReceive()' },
        { type: 'tests', code: 'test()' }
      ])
    ).toEqual({
      script: {
        req: 'pre()',
        res: 'post()',
        beforeCallStart: 'before()',
        afterCallEnd: 'after()',
        beforeMessageSend: 'beforeSend()',
        afterMessageReceive: 'afterReceive()'
      },
      tests: 'test()'
    });
  });

  it('skips entries with no code and returns undefined when none remain', () => {
    expect(
      toJackpostScripts([
        { type: 'before-request', code: '' },
        { type: 'grpc:before-call-start', code: 'before()' }
      ])
    ).toEqual({ script: { beforeCallStart: 'before()' } });

    expect(toJackpostScripts([{ type: 'before-request', code: '' }])).toBeUndefined();
  });

  it('ignores unrecognized script types', () => {
    expect(toJackpostScripts([{ type: 'grpc:on-message', code: 'nope()' } as any])).toBeUndefined();
    expect(
      toJackpostScripts([
        { type: 'grpc:on-message', code: 'nope()' } as any,
        { type: 'before-request', code: 'pre()' }
      ])
    ).toEqual({ script: { req: 'pre()' } });
  });

  it('keeps the last script when a type repeats', () => {
    expect(
      toJackpostScripts([
        { type: 'grpc:before-call-start', code: 'first()' },
        { type: 'grpc:before-call-start', code: 'second()' }
      ])
    ).toEqual({ script: { beforeCallStart: 'second()' } });
  });
});
