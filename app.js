var express = require('express');
var app = express();

app.use(express.static('build'));

app.use(function(req, res, next) {
  res.status(404).sendFile('404.html', {root: 'build'});
});

app.listen(3000);

console.log('listening on port 3000');
