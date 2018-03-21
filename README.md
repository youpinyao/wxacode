# wxacode

## 启动

````node

npm run server

````

## 配置

````node
根目录创建appConfig.json
{
  "appid": "",
  "secret": ""
}

````

## 接口

````node
生成小程序码
http://localhost:3000/wxacode?path=/pages/home&width=430

生成二维码小程序码
http://localhost:3000/wxaqrcode?path=/pages/home&width=430

````