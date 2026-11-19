const addJackpostGrpcRequestShimToContext = require('./grpc/jackpost-grpc-request');
const addJackpostGrpcResponseShimToContext = require('./grpc/jackpost-grpc-response');

/**
 * Installs `jp.grpc` onto the `jp` object the jp shim has already put on the global, so it has
 * to run after it.
 */
const addJackpostGrpcShimToContext = (vm, grpc) => {
  const jpObject = vm.getProp(vm.global, 'jp');
  const grpcObject = vm.newObject();

  const { evalCode: requestEvalCode } = addJackpostGrpcRequestShimToContext(vm, grpc.request, grpcObject);
  // `response` is absent in `beforeCallStart`, which has no response yet.
  const { evalCode: responseEvalCode } = grpc.response
    ? addJackpostGrpcResponseShimToContext(vm, grpc.response, grpcObject)
    : { evalCode: [] };

  vm.setProp(jpObject, 'grpc', grpcObject);
  grpcObject.dispose();
  jpObject.dispose();

  // The list code reaches its target through `globalThis.jp.grpc`, so it can only run now that
  // `grpc` is on `jp`. Each block is braced on its own — every bridge declares the same consts.
  for (const code of [...requestEvalCode, ...responseEvalCode].filter(Boolean)) {
    vm.evalCode(`{ ${code} }`);
  }
};

module.exports = addJackpostGrpcShimToContext;
