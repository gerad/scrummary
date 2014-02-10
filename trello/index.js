module.exports = Trello;

var on = require('../lib/on');
var async = require('async');

var config = require('../config').trello;
Trello.api = require('./api')(config);
// Trello.models = require('./models');

function Trello(opts, callback) {
  if (!(this instanceof Trello)) { return new Trello(callback); }
  this.init(opts, callback);
};

Trello.prototype = {
  init: function(opts, callback) {
    if (!callback) { callback = opts; opts = {}; }

    this.since = opts.since
    this.cards = [];
    this.bindAll();
    this.load(callback);
  },

  load: function(done) {
    var _this = this;

    async.series([
      this.loadCards,
    ], function(err) {
      if (err) { return done(err); }
      done(null, _this);
    });
  },

  loadCards: function(done) {
    var _this = this;
    Trello.api.cards(function(err, cards) {
      if (err) { return done(err); }
      _this.addCards(cards);
      done();
    });
  },

  addCards: function(cards) {
    this.cards = cards;
  },

  bindAll: function() {
    this.loadCards = this.loadCards.bind(this);
  }
};
