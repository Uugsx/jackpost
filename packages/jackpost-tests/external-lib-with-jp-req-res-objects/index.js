/**
 * External library that accesses jp, req, res objects from the VM context.
 * These are available as globals inside the Node VM sandbox.
 *
 * Used to test that npm modules can access jp, req, res context objects.
 */

module.exports = {
  // jp accessors
  getVar: function (name) { return jp.getVar(name); },
  setVar: function (name, value) { jp.setVar(name, value); },
  getEnvVar: function (name) { return jp.getEnvVar(name); },

  // req accessors
  getReqBody: function (options) { return req.getBody(options); },
  getReqHeaders: function () { return req.getHeaders(); },
  getReqMethod: function () { return req.getMethod(); },

  // res accessors
  getResBody: function () { return res.getBody(); },
  getResHeaders: function () { return res.getHeaders(); },
  getResStatus: function () { return res.getStatus(); }
};
