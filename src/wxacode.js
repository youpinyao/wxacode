const request = require('./request');
const config = require('./config');
const token = require('./token');

function wxacode(req, res) {
  token().then(data => {
    request.post({
      url: `${config.getWxaCode}?access_token=${data.access_token}`,
      form: JSON.stringify(Object.assign({}, req.query)),
    }).then(data => {
      request.success(res, data);
    }, data => {
      request.error(res, data);
    })
  }, data => {
    request.error(res, data);
  });
}

module.exports = wxacode;
