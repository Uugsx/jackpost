import type { GrpcRequest as JackpostGrpcRequest } from '@jackpost/schema-types/requests/grpc';
import stringifyItem from './stringifyItem';
import parseItem from './parseItem';

const parseGrpcItem = (yml: string) => parseItem(yml).request as JackpostGrpcRequest;

const grpcItem = (script: Record<string, string | null>, tests: string | null = null) => ({
  uid: 'i1',
  type: 'grpc-request',
  name: 'say hello',
  seq: 1,
  request: {
    url: 'grpc://localhost:50051',
    method: '/hello.Greeter/SayHello',
    methodType: 'unary',
    headers: [],
    auth: { mode: 'none' },
    body: { mode: 'grpc', grpc: [{ name: 'message 1', content: '{}' }] },
    script,
    tests,
    vars: { req: [], res: [] },
    assertions: []
  }
}) as any;

describe('grpc lifecycle hooks — stringify/parse round trip', () => {
  it('writes every hook as a grpc-prefixed script type and reads them back', () => {
    const yml = stringifyItem(grpcItem({
      beforeCallStart: 'jp.setVar("a", 1);',
      afterCallEnd: 'jp.setVar("b", 2);',
      beforeMessageSend: 'jp.setVar("c", 3);',
      afterMessageReceive: 'jp.setVar("d", 4);'
    }));

    expect(yml).toContain('grpc:before-call-start');
    expect(yml).toContain('grpc:after-call-end');
    expect(yml).toContain('grpc:before-message-send');
    expect(yml).toContain('grpc:after-message-receive');

    const { script } = parseGrpcItem(yml);
    expect(script!.beforeCallStart).toBe('jp.setVar("a", 1);');
    expect(script!.afterCallEnd).toBe('jp.setVar("b", 2);');
    expect(script!.beforeMessageSend).toBe('jp.setVar("c", 3);');
    expect(script!.afterMessageReceive).toBe('jp.setVar("d", 4);');
  });

  it('preserves a multiline hook verbatim', () => {
    const beforeCallStart = ['const now = 1;', 'if (now) {', '  jp.setVar("startedAt", now);', '}'].join('\n');

    const yml = stringifyItem(grpcItem({ beforeCallStart, afterCallEnd: null }));
    const { script } = parseGrpcItem(yml);

    expect(script!.beforeCallStart).toBe(beforeCallStart);
  });

  it('round-trips one hook without inventing the others', () => {
    const yml = stringifyItem(grpcItem({ beforeCallStart: null, afterCallEnd: 'jp.setVar("b", 2);' }));

    expect(yml).not.toContain('grpc:before-call-start');
    expect(yml).not.toContain('grpc:before-message-send');
    expect(yml).not.toContain('grpc:after-message-receive');

    const { script } = parseGrpcItem(yml);
    expect(script!.beforeCallStart).toBeNull();
    expect(script!.afterCallEnd).toBe('jp.setVar("b", 2);');
    expect(script!.beforeMessageSend).toBeNull();
    expect(script!.afterMessageReceive).toBeNull();
  });

  it('writes no scripts block when every hook is empty', () => {
    const yml = stringifyItem(grpcItem({
      beforeCallStart: null,
      afterCallEnd: '   ',
      beforeMessageSend: null,
      afterMessageReceive: '   '
    }));

    expect(yml).not.toContain('scripts:');

    const { script } = parseGrpcItem(yml);
    expect(script!.beforeCallStart).toBeNull();
    expect(script!.afterCallEnd).toBeNull();
    expect(script!.beforeMessageSend).toBeNull();
    expect(script!.afterMessageReceive).toBeNull();
  });

  it('keeps tests alongside the hooks', () => {
    const yml = stringifyItem(
      grpcItem({ beforeCallStart: 'jp.setVar("a", 1);', afterCallEnd: null }, 'test("ok", () => {});')
    );

    const request = parseGrpcItem(yml);
    expect(request.script!.beforeCallStart).toBe('jp.setVar("a", 1);');
    expect(request.tests).toBe('test("ok", () => {});');
  });

  it('survives a second round trip unchanged', () => {
    const item = grpcItem({
      beforeCallStart: 'jp.setVar("a", 1);',
      afterCallEnd: 'jp.setVar("b", 2);',
      beforeMessageSend: 'jp.setVar("c", 3);',
      afterMessageReceive: 'jp.setVar("d", 4);'
    });

    const firstPass = stringifyItem(item);
    const secondPass = stringifyItem(parseItem(firstPass));

    expect(secondPass).toBe(firstPass);
  });
});
