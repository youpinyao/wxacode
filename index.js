const express = require('express');
const app = express();

const wxacode = require('./src/wxacode');
const wxaqrcode = require('./src/wxaqrcode');

app.get('/wxacode', function (req, res) {
  wxacode(req, res);
});
app.get('/wxaqrcode', function (req, res) {
  wxaqrcode(req, res);
});

const server = app.listen(7001, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`wxacode app listening at http://${host}:${port}`);
});
