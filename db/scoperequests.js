/**
 * Created by jpsantos on 2/7/17.
 */
var scopeRequests = {};


exports.find = function(key, done) {
  var code = scopeRequests[key];
  return done(null, code);
};

exports.save = function(code, scopeRequest, done) {
  scopeRequests[code] = scopeRequest;
  return done(null);
};