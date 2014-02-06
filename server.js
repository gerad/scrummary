var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var port = (process.env.NODE_ENV === 'production' ? 80 : 8000);

app.use(express.json());
app.use(express.urlencoded());
app.use(express.logger());

app.get('/ok', function(req, res, next) {
  res.send(200);
});

app.post('/hooks/github', function(req, res, next) {
  save(req.body, function() {
    res.send(202);
  });
});

http.createServer(app).listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }

  console.log('Server running at http://0.0.0.0:' + port + '/');
});

function save(data, next) {
  var day = new Date().toJSON().slice(0, 10);
  var dir = path.join(__dirname, 'data', day);
  mkdirp(dir, function(error) {
    if (error) { return next(error); }
    var file = path.join(dir, +new Date() + '');
    fs.writeFile(file, JSON.stringify(data), next);
  });
}
