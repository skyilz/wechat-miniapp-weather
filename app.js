// app.js
const config = require('./config')
App({
  tianqiApi: {
    // 百度地图API Key
    baiduMapApiKey: config.baiduMapApiKey,
    // 和风天气接口的ApiKey
    // https://dev.qweather.com/
    heweatherApiKey: config.heweatherApiKey,
  },
  onLaunch() {
    console.log('App Launched');
  },
  globalData: {}
})