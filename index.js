var github = require('./github');
var trello = require('./trello');
var log = console.log.bind(console);

github(function(res) {
  printIssues(res.issues);
});

trello(function(res) {
  printCards(res.cards);
});

function printIssues(issues) {
  for (var i = 0, l = issues.length, issue; i < l; i++) {
    issue = issues[i];
    var user = issue.user && issue.user.login;
    var assignee = issue.assignee && issue.assignee.login;
    var updated = new Date(Date.parse(issue.updated_at));
    var created = new Date(Date.parse(issue.created_at));
    var closed = (issue.state === 'closed');
    var updated_today = updated > yesterday();
    var created_today = created > yesterday();

    if (closed && updated_today && assignee === 'gerad') {
      log('• fixed', issue.number, issue.title);
    } else if (created_today && user === 'gerad') {
      log('• created', issue.number, issue.title);
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

function yesterday() {
  var yesterday = new Date(+today());
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function today() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
