module.exports = GitHub;

var async = require('async');

var config = require('../config').github;
GitHub.api = require('./api')(config);
GitHub.Summarizer = require('./summarizer');

function GitHub(opts, callback) {
  if (!(this instanceof GitHub)) { return new GitHub(opts, callback); }
  this.init(opts, callback);
};

GitHub.prototype = {
  init: function(opts, callback) {
    if (!callback) { callback = opts; opts = {}; }

    this.since = opts.since;

    this.summary = new GitHub.Summarizer(opts);
    this.bindAll();

    this.load(callback);
  },

  load: function(done) {
    var _this = this;
    async.series([
      this.loadOpenIssues,
      this.loadClosedIssues,
    ], function(err) {
      if (err) { return done(err); }
      done(null, _this);
    });
  },

  loadOpenIssues: function(done) {
    this.getIssues({}, done);
  },

  loadClosedIssues: function(done) {
    this.getIssues({ state: 'closed', since: this.since.toJSON() }, done);
  },

  getIssues: function(opts, done) {
    var _this = this;
    GitHub.api.issues(opts, function(err, issues) {
      if (err) { return done(err); }
      _this.addIssues(issues);
      done();
    });    
  },

  addIssues: function(issues) {
    this.summary.addIssues(issues);
  },

  bindAll: function() {
    this.loadOpenIssues = this.loadOpenIssues.bind(this);
    this.loadClosedIssues = this.loadClosedIssues.bind(this);
  }
};
