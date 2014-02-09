module.exports = GitHubAPI;

var request = require('request');
var async = require('async');

function GitHubAPI(opts) {
  if (!(this instanceof GitHubAPI)) { return new GitHubAPI(opts); }

  this.auth = opts.auth;
  this.repo = opts.repo;
};

GitHubAPI.prototype = {
  baseurl:  'https://api.github.com/',
  headers: { 'User-Agent': 'scrummary-github-client' },

  issues: function(opts, done) {
    if (!done) { done = opts; opts = {}; }

    opts.path = "repos/" + this.repo + "/issues";
    opts.paged = true;

    this.get(opts, done);
  },

  get: function(opts, done) {
    opts.auth = this.auth;
    opts.headers = this.headers;
    opts.url = this.baseurl + opts.path;
    opts.json = {};

    if (opts.paged) {
      this.paged(opts, done);
    } else {
      request.get(opts, done)
    }
  },

  paged: function(opts, done) {
    var ret = [];
    if (!opts.qs) { opts.qs = {}; }

    function page(pageNum) {
      opts.qs.page = pageNum;

      request.get(opts, function(err, resp, body) {
        if (err) { return done(err); }
        if (body.length) {
          ret = ret.concat(body);
          page(pageNum + 1);
        } else {
          done(null, ret);
        }
      });
    }

    page(1);
  }
};
