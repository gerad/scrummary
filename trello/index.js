module.exports = Trello;

var on = require('../lib/on');
var async = require('async');

var config = require('../config').trello;
Trello.api = require('./api')(config);
// Trello.models = require('./models');

function Trello(callback) {
  if (!(this instanceof Trello)) { return new Trello(callback); }

  this.init();
  this.on.done(callback);
  this.load();
};

Trello.prototype = {
  init: function() {
    this.on = on('done');
    this.cards = [];
    this.bindAll();
  },

  load: function() {
    var _this = this;

    async.series([
      this.loadCards,
    ], function(error) {
      _this.on.done.fire({
        cards: _this.cards
      });
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
