const request = require('./request');
const config = require('./config');

function jscode2session(req, res) {
  request.get({
    url: config.jscode2session('wx51f638f04dc47f60', 'bf068facc07fff3f8cab188c539c8a9b', req.body.code),
  }).then(data => {
    request.success(res, data);
  }, data => {
    request.error(res, data);
  })
}

module.exports = jscode2session;
