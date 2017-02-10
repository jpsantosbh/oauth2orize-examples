/**
 * Created by jpsantos on 2/8/17.
 */
var util = require('util')
  , _ = require('lodash')
  , queryString = require('query-string')
  , jwt = require('jsonwebtoken')
  , db = require('./db')
  , util = require('./utils');

function getScopeRequestId(request) {

}

function getEmailAttestaion(scopeRequest) {
  return _.find(scopeRequest.attestations, function(attn) { return _.includes(attn.data.label, "email"); });
}

function verifyAttestation(attestation, callback) {

   //TODO verify on blockchain
   if(_.includes(attestation.data.label, "email")) {
     callback(null, {
       user: attestation.data.value,
     })
   } else {
     callback("No email attestation");
   }

}

function CivicStrategy(options) {
  options = options || {};
  Strategy.call(this);
  this.name = 'civic';
}



exports.scopeRequestCallback = function (req, res) {

  var srid = req.params.requestId;

  if(req.method == "POST") {
    var attestation = req.body;

    db.scoperequests.find(srid, function (err, scopeRequest) {
      if(!scopeRequest.attestations){
        scopeRequest.attestations = [];
      }

      scopeRequest.attestations.push(attestation);
      
      db.scoperequests.save(srid, scopeRequest, function (err) {
        res.send("OK");
      });
    
    });
    
    
  }
}

exports.LoginForm = function (req, res) {
  var requestId = util.uid(8);
  var requestData = "http://api.civic.com/request?clientId=123456&callbackUrl=http://localhost:3000/scoperequest/"+requestId+"&expires=1400000&signature=HEXHASH"
  var API_ENDPOINT = 'https://api.scanova.io/v2/qrcode/text';
  var API_KEY = 'c87a386cddebd7b3703aa1b392c09dfd8f9d1002';
  var API_PAREMETERS = {
    size: 'm',
    error_correction: 'H',
    data_pattern: 'ROUND',
    eye_pattern: 'CIRC_CIRC',
    data_gradient_style: 'Diagonal',
    data_gradient_start_color: '#3AB03E',
    data_gradient_end_color: '#439CE6',
    eye_color_inner:'#3AB03E',
    eye_color_outer: '#3AB03E',
    background_color: '#FFFFFF',
    'logo.url': 'https://s3.amazonaws.com/deskeee.files/civic-mark.svg',
    'logo.size': 14,
    'logo.excavated': true,
    apikey: API_KEY,
    data: requestData
  }

  db.scoperequests.save(requestId, {requestData: requestData}, function (err) {
    var qrcode = API_ENDPOINT+"?"+queryString.stringify(API_PAREMETERS);
    res.render('civic', { qrcode: qrcode, requestId: requestId});
  });

}

exports.jwt = function(req, res) {

  var self = this;
  var srid = req.query.requestId;

  db.scoperequests.find(srid, function (err, scopeRequest) {

    var emailAttn = getEmailAttestaion(scopeRequest);
    
    if(!emailAttn) {
      res.status(404).send("Not Found");
      return
    }

    verifyAttestation(emailAttn, function (err, result) {

      if(err) {
        //todo
      }

      jwt.sign({username: result.user}, ';-)secret', {expiresIn: "7d", issuer: "civic.com", subject: result.user}, function (err, token) {
        if(err) {
          //todo
        } else {
          res.send(token);
        }
      });

    });

  });

}

