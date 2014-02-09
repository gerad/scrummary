module.exports = TrelloAPI;

var request = require('request');
var async = require('async');

function TrelloAPI(opts) {
  if (!(this instanceof TrelloAPI)) { return new TrelloAPI(opts); }

  this.auth = opts.auth;
  this.board = opts.board;
};

TrelloAPI.prototype = {
  baseurl: 'https://api.trello.com/1/',

  cards: function(opts, done) {
    if (!done) { done = opts; opts = {}; }
    opts.path = 'boards/' + this.board +  '/cards';

    this.get(opts, function(err, res, body) {
      if (err) { return done(err); }
      done(null, body);
    });
  },

  get: function(opts, done) {
    if (!opts.qs) { opts.qs = {}; }
    opts.qs.key = this.auth.key;
    opts.qs.token = this.auth.token;
    opts.url = this.baseurl + opts.path;
    opts.json = {};
    request.get(opts, done)
  }
};
