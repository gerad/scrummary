module.exports = Scrummarizer;

var github = require('./github');
var trello = require('./trello');
var moment = require('moment');
var async = require('async');
var log = console.log.bind(console);

function Scrummarizer(opts, callback) {
  if (!(this instanceof Scrummarizer)) { return new Scrummarizer(opts, callback); }
  this.init(opts, callback);
}

Scrummarizer.prototype = {
  init: function(opts, callback) {
    if (!callback) { callback = opts; opts = {}; }

    this.since = opts.since || Scrummarizer.since();
    this.bindAll();
    this.load(callback);
  },

  load: function(done) {
    var _this = this;
    async.parallel([
      this.loadGitHub,
      this.loadTrello,
    ], function(err) {
      if (err) { return done(err); }
      done(null, _this);
    });
  },

  loadGitHub: function(done) {
    var _this = this;
    github({ since: this.since }, function(err, res) {
      if (err) { return done(err); }
      _this.github = res;
      done();
    });
  },

  loadTrello: function(done) {
    var _this = this;
    trello({ since: this.since }, function(err, res) {
      if (err) { return done(err); }
      _this.trello = res;
      done();
    });
  },

  bindAll: function() {
    this.loadGitHub = this.loadGitHub.bind(this);
    this.loadTrello = this.loadTrello.bind(this);
  }
};

function printIssues(issues) {
  for (var i = 0, l = issues.length, issue; i < l; i++) {
    var issue = issues[i];
    var user = issue.user;
    var assignee = issue.assignee;
    var updated = issue.updated;
    var created = issue.created;
    var closed = issue.isClosed;
    var updated_today = issue.wasUpdatedAfter(Scrummarizer.since());
    var created_today = issue.wasCreatedAfter(Scrummarizer.since());

    if (closed && updated_today && assignee === 'gerad') {
      log('• fixed', issue.number, issue.title);
    } else if (created_today && user === 'gerad') {
      log('• opened', issue.number, issue.title);
    } else if (!closed && assignee === 'gerad') {
      log('• planned', issue.number, issue.title);
    } else if (closed && updated_today && !assignee) {
      log('• fixed?', issue.number, issue.title);
    } else if (updated_today && (user === 'gerad' || assignee === 'gerad' || assignee == null)) {
      log('• ???', issue.state, issue.number, issue.title, user, assignee)
    }
  }
}

function printCards(cards) {
  for (var i = 0, l = cards.length, card; i < l; i++) {
    card = cards[i];
    if (card.idMembers.indexOf('506438986b047e4710572aff') >= 0 && // gerad
        card.idList !== '52ddde3a2bab066309cf15a0' && // onhold
        card.idList !== '52b20d11be4835d622002888') { // accepted
      log(card.shortLink, card.name);
    }
  }
}

Scrummarizer.since = function since() {
  var since = moment().startOf('day');
  if (since.day() === 1) { // monday
    since.day(-2); // last friday
  } else {
    since.subtract(1, 'day');
  }
  return since.toDate();
}

Scrummarizer(function(err, res) {
  if (err) { throw err; }

  printIssues(res.github.summary.issues);
  printCards(res.trello.cards);

  // log(res.github.summary.for('gerad'));
});
