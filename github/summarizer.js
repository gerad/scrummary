module.exports = GitHubSummarizer;

function GitHubSummarizer(opts) {
  if (!(this instanceof GitHubSummarizer)) { return new GitHubSummarizer(opts); }
  this.init(opts);
}

GitHubSummarizer.prototype = {
  init: function(opts) {
    this.since = opts.since;
    this.issues = [];
  },

  addIssues: function(issues) {
    for (var i = 0, l = issues.length; i < l; i++) {
      var issue = issues[i];
      this.issues.push(new Issue(issue));
    }
  },

  for: function(user) {
    return {
      activities: this.activitiesFor(user),
      assignments: this.assignmentsFor(user)
    };
  },

  activitiesFor: function(user) {
    var ret = [];

    for (var i = 0, l = this.issues.length; i < l; i++) {
      var issue = this.issues[i];

      if (issue.wasFixed({ by: user, since: this.since })) {
        ret.push({ action: 'fixed', issue: issue });
      } else if (issue.wasOpened({ by: user, since: this.since })) {
        ret.push({ action: 'opened', issue: issue });
      }
    }

    return ret;
  },

  assignmentsFor: function(user) {
    var ret = [];
    for (var i = 0, l = this.issues.length; i < l; i++) {
      var issue = this.issues[i];

      if (issue.isAssigned({ to: user, before: this.since })) {
        ret.push(issue);
      }
    }

    return ret;
  },
};

function Issue(issue) {
  this.user = issue.user && issue.user.login;
  this.assignee = issue.assignee && issue.assignee.login;
  this.updated = new Date(Date.parse(issue.updated_at));
  this.created = new Date(Date.parse(issue.created_at));
  this.isClosed = (issue.state === 'closed');
  this.isOpen = !this.isClosed;
  this.number = issue.number;
  this.title = issue.title;
}

Issue.prototype = {
  wasUpdatedAfter: function(date) { return this.updated >= date; },
  wasCreatedAfter: function(date) { return this.created >= date; },
  wasCreatedBefore: function(date) { return !this.wasCreatedAfter(date); },

  wasOpened: function(opts) {
    return opts.by === this.user && this.wasCreatedAfter(opts.since);
  },

  wasFixed: function(opts) {
    return opts.by === this.assignee && this.wasUpdatedAfter(opts.since) && this.isClosed;
  },

  isAssigned: function(opts) {
    return opts.to === this.assignee && this.isOpen && this.wasCreatedBefore(opts.before);
  }

};
