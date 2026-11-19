// Forwards the caller's jp as a second arg so the host can attribute the call.
const bindRunRequest = (jp, runRequestByItemPathname) => {
  if (!runRequestByItemPathname) return;
  jp.runRequest = (relativePathname) =>
    runRequestByItemPathname(relativePathname, jp);
};

// Kept off jp to stay out of user-facing autocomplete.
const createScopeSetter = (jp) => (scope) => {
  jp._currentScope = scope || null;
};

module.exports = {
  bindRunRequest,
  createScopeSetter
};
