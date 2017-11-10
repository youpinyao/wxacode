const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const appConfigPath = path.join(process.cwd(), './appConfig.json');
const accessTokenPath = path.join(process.cwd(), './accessToken.json');

const request = require('./request');
const config = require('./config');

function getToken() {
  let appConfig = null;
  let accessToken = null;

  if (fs.existsSync(appConfigPath)) {
    appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf-8'));
  }
  if (fs.existsSync(accessTokenPath)) {
    accessToken = JSON.parse(fs.readFileSync(accessTokenPath, 'utf-8'));
  }

  if (!appConfig) {
    cosnole.log(chalk.red(`
      请在项目项目根目录下创建appConfig.json文件
      {
        "appid": "",
        "secret": ""
      }
    `));
    return new Promise((resolve, reject) => {
      reject();
    });
  };

  if (accessToken) {
    // 毫秒
    const expires = accessToken.expires_in * 1000;
    const time = accessToken.time;
    const currentTime = +new Date();
    const offsetTime = 10 * 60 * 1000;

    // 判断过期
    if (currentTime - time > expires - offsetTime) {
      accessToken = null;
    }
  }

  if (accessToken) {
    return new Promise((resolve, reject) => {
      resolve(accessToken);
    });
  }

  return new Promise((resolve, reject) => {
    request.get({
      url: config.getToken,
      data: Object.assign({
        grant_type: 'client_credential',
      }, appConfig),
    }).then(data => {
      // {
      //   "access_token": "NrOa0moDhf8Tl-fsH-Quks9-fQV-qfg_lXJ1RMuxeCx-j37PJOvbitOAbYeoVvHtX74EBHpCY0d-W4R68Yp7ekDgqV5rGDGLZMAWabEzs73o-LYkFSWcE8I9DIarlbGmFMYgAHAYFR",
      //   "expires_in": 7200
      // }

      if (data && data.access_token) {
        data.time = +new Date();
        fs.writeFileSync(accessTokenPath, `${JSON.stringify(data)}`, {
          encoding: 'utf-8'
        });
      }

      resolve(data);
    }, data => {
      reject(data);
    });
  });
}

module.exports = getToken;
