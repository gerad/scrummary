module.exports = GitHub;

var on = require('../lib/on');
var async = require('async');

var config = require('../config').github;
GitHub.api = require('./api')(config);
// GitHub.models = require('./models');

function GitHub(callback) {
  if (!(this instanceof GitHub)) { return new GitHub(callback); }
  this.init();
  this.on.done(callback);
  this.load();
};

GitHub.prototype = {
  init: function() {
    this.on = on('done');
    this.issues = [];
    this.bindAll();
  },

  load: function() {
    var _this = this;

    async.series([
      this.loadOpenIssues,
      this.loadClosedIssues,
    ], function(error) {
      _this.on.done.fire({
        issues: _this.issues
      });
    });
  },

  loadOpenIssues: function(done) {
    this.loadIssues(done);
  },

  loadClosedIssues: function(done) {
    this.loadIssues({ state: 'closed' }, done);
  },

  loadIssues: function(opts, done) {
    var _this = this;
    if (!done) { done = opts; opts = {}; }
    GitHub.api.issues(opts, function(err, issues) {
      if (err) { return done(err); }
      _this.addIssues(issues);
      done();
    });    
  },

  addIssues: function(issues) {
    this.issues = this.issues.concat(issues);
  },

  bindAll: function() {
    this.loadOpenIssues = this.loadOpenIssues.bind(this);
    this.loadClosedIssues = this.loadClosedIssues.bind(this);
  }
};
