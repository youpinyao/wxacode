const express = require('express');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
// const http2 = require('spdy');
const http2 = require('http2');
const logger = require('morgan');
const app = express();

const wxacode = require('./src/wxacode');
const wxaqrcode = require('./src/wxaqrcode');

app.use(logger('dev'));

app.get('/*.jpg', function (req, res) {
  res.status(200).sendFile(path.resolve('./page/img-mini.jpg'));
});

app.get('/index.js', (req, res) => {
  res.status(200).end(fs.readFileSync('./page/index.js'));
});

app.get('/', function (req, res) {
  // var stream = res.push('/index.js', {
  //   status: 200, // optional
  //   method: 'GET', // optional
  //   request: {
  //     accept: '*/*'
  //   },
  //   response: {
  //     'content-type': 'application/javascript'
  //   }
  // });
  // stream.on('error', function () {
  //   console.error('stream error');
  // });
  // stream.write('console.log(\'server push index.js\');');
  // stream.end(fs.readFileSync('./page/index.js'));

  res.status(200).end(fs.readFileSync('./page/index.html'));
});

app.get('/wxacode', function (req, res) {
  wxacode(req, res);
});

app.get('/wxaqrcode', function (req, res) {
  wxaqrcode(req, res);
});

const server1 = app.listen(3001, function () {
  const host = server1.address().address;
  const port = server1.address().port;

  console.log(`wxacode app listening at http://${host}:${port}`);
});

const server2 = http2
  .createSecureServer({
    allowHTTP1: true,
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
  }, (req, res) => {
    // app(req, res);
  });
server2.listen(3000, () => {
  const host = server2.address().address;
  const port = server2.address().port;

  console.log(`wxacode app listening at http://${host}:${port}`);
})

server2.on('stream', (stream, headers) => {
  const reqPath = headers[':path'].split('?')[0];
  console.log('path:', reqPath);
  if (reqPath === '/') {
    for (let i = 0; i < 100; i++) {
      stream.pushStream({
        ':path': `/index.js?v=${i}`,
      }, (pushStream) => {
        pushStream.respond({
          ':status': 200,
          'content-type': mime.lookup('js'),
        });
        pushStream.write('console.log(\'node http2 server push index.js\');');
        pushStream.end(fs.readFileSync('./page/index.js'));
      });
    }
    stream.respond({
      'content-type': mime.lookup('html'),
      ':status': 200
    });
    stream.end(fs.readFileSync('./page/index.html'));
  } else if (fs.existsSync(path.join(process.cwd(), 'page', reqPath))) {
    stream.respond({
      'content-type': mime.lookup(reqPath),
      ':status': 200
    });
    stream.end(fs.readFileSync(path.join(process.cwd(), 'page', reqPath)));
  } else if (/png|jpg/g.test(reqPath)) {
    stream.respond({
      'content-type': mime.lookup(reqPath),
      ':status': 200
    });
    stream.end(fs.readFileSync('./page/img-mini.jpg'));
  } else {
    stream.respond({
      'content-type': 'text/html',
      ':status': 404
    });
    stream.end();
  }
});
