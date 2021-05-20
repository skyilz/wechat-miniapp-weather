// app.js
const config = require('./config')
App({
  // 天气相关接口的API密钥，此处已全部换为xxxxx，如需运行请自行申请密钥
  tianqiApi: {
    // 百度地图API Key
    baiduMapApiKey: config.baiduMapApiKey,
    // 和风天气接口的ApiKey
    // https://dev.qweather.com/
    heweatherApiKey: config.heweatherApiKey,
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: config.cloudenv,
        traceUser: true,
      })
    }
    console.log('App Launched');
  },
  globalData: {}
})