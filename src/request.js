const request = require('request');
const chalk = require('chalk');
const moment = require('moment');
const Promise = require('promise');
const BufferHelper = require('bufferhelper');
const iconv = require('iconv-lite');

const config = require('./config');

module.exports = {
  post,
  get,
  send,
  success,
  error,
}

// 重写console.log
const log = console.log;
console.log = function (...args) {
  args.unshift(chalk.yellow(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`));
  log.apply(this, args);
  log('------------------------------------------------------------------------------');
}

function success(response, data) {
  const defaultData = {
    success: true,
    content: data || '',
  }

  send(response, 200, defaultData);
}

function error(response, data) {
  const defaultData = {
    success: false,
  }

  if (typeof data !== 'object') {
    defaultData.message = data;
  } else {
    Object.assign(defaultData, data);
  }

  send(response, 400, defaultData);
}

function send(response, status, data) {
  response.append('Content-Type', `application/json; charset=${config.charset}`);
  response.status(status).send(JSON.stringify(data));
}

function get(options) {
  if (typeof options === 'string') {
    const uri = options;

    options = {
      uri,
    }
  }
  if (options.url) {
    options.uri = options.url;
    delete options.url;
  }

  const data = options.data || options.body || option.form;
  const dataArr = [];

  data._ = +new Date();

  Object.keys(data).forEach(d => {
    dataArr.push(`${d}=${data[d]}`);
  });

  options.uri = `${options.uri}?${dataArr.join('&')}`;
  options.method = 'GET';

  delete options.body;
  delete options.data;
  delete options.form;

  return http(options);
}

function post(options) {
  if (typeof options === 'string') {
    const uri = options;

    options = {
      uri,
    }
  }

  if (options.url) {
    options.uri = options.url;
    delete options.url;
  }

  options.method = 'POST';

  return http(options);
}

function http(options) {
  options.rejectUnauthorized = false;
  options.resolveWithFullResponse = true;

  console.log();
  console.log(`${options.method}: `, chalk.yellow(JSON.stringify(options)));
  console.log();

  const promise = new Promise((resolve, reject) => {
    request(options).on('response', function (res) {

      let bufferHelper = new BufferHelper();
      const contentType = res.headers['content-type'];

      console.log('content-type: ', contentType);

      res.on('data', function (chunk) {
        bufferHelper.concat(chunk);
      });
      res.on('end', function () {
        let result = '';

        if (/image/g.test(contentType)) {
          result = iconv.decode(bufferHelper.toBuffer(), 'base64');
          result = `data:${contentType};base64,${result}`;
          console.log('RESPONSE: image');
        } else {
          result = iconv.decode(bufferHelper.toBuffer(), config.charset);
          console.log('RESPONSE: ', result);
        }

        try {
          resolve(JSON.parse(result));
        } catch (e) {
          resolve(result);
        }
      });
    });
  });
  return promise;
}
