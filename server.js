var http = require('http');
var express = require('express');
var app = express();

var port = (process.env.NODE_ENV === 'production' ? 80 : 8000);

app.use(express.json());

app.post('/hooks/github', function(req, res, next) {
  console.log(req.body);
  res.send(202);
});

http.createServer(app).listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
      process.setgid(stats.uid);
    });
  }

  console.log('Server running at http://0.0.0.0:' + port + '/');
});
