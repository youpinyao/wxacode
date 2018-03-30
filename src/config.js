module.exports = {
  getToken: 'https://api.weixin.qq.com/cgi-bin/token',
  getWxaCode: 'https://api.weixin.qq.com/wxa/getwxacode',
  getWxaQrcode: 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode',
  jscode2session(appId, appSecret, jsCode) {
    return `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${jsCode}&grant_type=authorization_code`;
  },
  charset: 'utf-8',
}
