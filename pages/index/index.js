// index.js
import {
  gettoday
} from '../../utils/util.js'

var pageData = {
  // 页面数据部分
  data: {
    navHeight: 40, // 默认导航栏高度
    // 默认字符串
    city: '加载中...', // 默认标题城市
    hitokoto: '', //一言
    hitokotoShow: true, //一言显示
    temp: '5', // 默认温度
    statusBarHeight: 20, // 默认状态栏高度
    icon: "", // 主天气图标
    DayWeather: [], // 主显示天气信息
    sevenDayWeather: [], // 七日天气信息
    threeDayWeather: [], // 三日天气信息
    hoursweather: [], //小时预报
    sevenhoursweather: [], //小时预报、
    hoursweatherShow: true, //小时预报显隐
    air: { // 空气信息
      aqi: '',
      level: '',
      desp: ''
    },
    navbarItem: [{ // 底部导航栏
      index: 1,
      icon: 'cloud',
      text: '天气',
      active: 'active',
      animation: ''
    }, {
      index: 2,
      icon: 'apartment',
      text: '位置',
      active: '',
      animation: ''
    }],

    cards: [], // 天气指数卡片信息
    //天气指数显示与否
    switch1Show: true,
    switch2Show: true,
    switch3Show: true,
    switch4Show: true,
    switch5Show: true,
    switch6Show: true,
    currentPage: 0, // 目前所在的页面
    location: { // 位置信息
      latitude: '',
      longitude: '',
      country: '',
      province: '',
      city: '',
      district: '',
      details: ''
    },
    updateDay: '', //天气更新时为昨天还是今天
    updateTime: '', // 天气更新时间
    initTime: 0, // 进入小程序时的时间
    refreshTriggered: false, // 是否正在刷新
    hasRefreshed: false, // 15秒内是否已经刷新过
    hideAndShow: '查看' // 查看七日天气按钮按钮文字
  },
  // 刷新天气函数
  refresh: function () {
    var _this = this
    // 判断15秒内是否刷新过，防止用户频繁刷新
    if (this.data.hasRefreshed) {
      wx.showToast({
        title: '刚刚已经刷新过啦～',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        refreshTriggered: false
      })
    } else {
      // 刷新天气
      this.setData({
        hasRefreshed: true,
        refreshTriggered: true
      })
      // 指定调用的动作为刷新
      this.getLocation('REFRESH')
      // 倒计时15秒
      setTimeout(function () {
        _this.setData({
          hasRefreshed: false
        })
      }, 15000)
    }
  },
  //云函数查找是否保存过信息

  // 设置导航栏和状态栏高度
  setUpDimens: function () {
    let menuBtn = wx.getMenuButtonBoundingClientRect()
    // 获取状态栏高度
    var statusHeight = wx.getSystemInfoSync().statusBarHeight
    // 获取导航栏高度
    var navHeight = (menuBtn.top - statusHeight) * 2 + menuBtn.height
    this.setData({
      statusBarHeight: statusHeight,
      navHeight: navHeight
    })
  },
  // 加载页面
  onLoad() {
    this.setUpDimens()
    // 显示加载中弹窗
    wx.showLoading({
      title: '(ﾉ*･ω･)ﾉ',
      mask: true
    })
    // 获取当前毫秒级时间
    this.setData({
      initTime: Date.now()
    })
    // 数据库获取
    // 获取并显示天气信息
    // 指定调用的动作为初次加载
    this.getLocation('INIT')
  },

  baidumap: function (lat, lng, action) {
    var _this = this
    wx.request({
      url: 'https://api.map.baidu.com/reverse_geocoding/v3/',
      data: {
        ak: getApp().tianqiApi.baiduMapApiKey,
        output: 'json',
        coordtype: 'wgs84ll',
        location: lat + ',' + lng
      },
      success(res) {
        console.log('位置信息:')
        // console.log(res.data)
        console.log(res.data.result)
        var address = res.data.result.addressComponent
        // 显示位置信息
        _this.setData({
          location: {
            latitude: lat,
            longitude: lng,
            country: address.country,
            province: address.province,
            city: address.city,
            district: address.district,
            details: res.data.result.formatted_address
          },
          city: address.city + ' ' + address.district
        })
        // 调用获取天气函数
        _this.getWeather(address.city, lat, lng, action)
        _this.getHitkoto()
      }
    })
  },
  // 微信获取位置信息函数
  getLocation: function (action) {
    var _this = this
    // 调用微信接口获取经纬度
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log('经纬度信息:')
        console.log(res)
        var lat = res.latitude
        var lng = res.longitude
        // 发起网络请求，通过经纬度获取位置信息
        _this.baidumap(lat, lng, action)
      }
    })
  },
  //一言
  getHitkoto: function () {
    var _this = this
    wx.request({
      url: 'https://v1.hitokoto.cn',
      success(res) {
        console.log('一言API')
        console.log(res.data)
        _this.setData({
          hitokoto: res.data.hitokoto
        })
      },
      fail(res) {
        console.log('一言API调用失败')
        console.log(res.data)
      }
    })
  },
  // 地图定位
  choosemapads: function () {
    wx.chooseLocation({
      success: (res) => {
        console.log(res)
        var _this = this
        var lat = res.latitude
        var lng = res.longitude
        _this.baidumap(lat, lng, 'INIT')
      },
    })
  },
  // 重新定位
  getlocationagin: function () {
    var _this = this
    _this.getLocation('INIT')
  },
  // 获取天气函数
  getWeather: function (city, lat, lng, action) {
    // 因为接口限制，这里要裁切城市名
    city = city.substring(0, city.length - 1)
    var _this = this
    // 发起网络请求，获取当前天气
    wx.request({
      url: 'https://devapi.qweather.com/v7/weather/now',
      data: {
        location: lng + ',' + lat,
        key: getApp().tianqiApi.heweatherApiKey
      },
      success(weather) {
        console.log('和风天气API-当前天气:')
        console.log(weather.data)
        //判断更新时间是昨天还是今天
        var today = gettoday(new Date())
        var updataday = weather.data.updateTime.substring(weather.data.updateTime.indexOf('2021-') + 8, weather.data.updateTime.indexOf('2021-') + 10)
        console.log(weather.data.updateTime.substring(weather.data.updateTime.indexOf('2021-') + 11, weather.data.updateTime.indexOf('2021-') + 16))
        if (today == updataday) {
          updataday = '今天'
        } else {
          updataday = '昨天'
        }
        // 展示当前天气温度和天气更新时间
        _this.setData({
          temp: weather.data.now.temp,
          updateDay: updataday,
          updateTime: weather.data.updateTime.substring(weather.data.updateTime.indexOf('2021-') + 11, weather.data.updateTime.indexOf('2021-') + 16)
        })
      },
      fail(res) {
        console.log('调用天气接口失败')
        console.log(res.data)
      }
    })
    // 发起网络请求，获取七日内天气
    wx.request({
      url: 'https://devapi.qweather.com/v7/weather/7d',
      data: {
        location: lng + ',' + lat,
        key: getApp().tianqiApi.heweatherApiKey
      },
      success(res) {
        var weathers = res.data.daily
        console.log('和风天气API-七日天气:')
        console.log(res.data.daily)
        var localWeathers = []
        // 使用循环将返回的数据进行转换
        for (let w of weathers) {
          localWeathers.push({
            // 获取天气对应图标
            iconday: w.iconDay,
            iconnight: w.iconNight,
            // 这一句是获取天气具体对应的哪一天，接口返回的结果太长了，我裁切了一下
            day: w.fxDate.substring(w.fxDate.indexOf('2021-') + 5, w.fxDate.index),
            textday: w.textDay,
            textnight:w.textNight,
            max_temp: w.tempMax,
            min_temp: w.tempMin
          })
        }
        // 保存获取的七日内天气
        _this.setData({
          sevenDayWeather: localWeathers
        })
        var threeDayWeather = []
        for (var i = 0; i <= 2; i++) {
          threeDayWeather.push(localWeathers[i])
        }
        // 默认显示三日内天气
        _this.setData({
          threeDayWeather: threeDayWeather
        })
        // console.log(threeDayWeather)
        // console.log(_this.data.weather)

        //小时预报
        wx.request({
          url: 'https://devapi.qweather.com/v7/weather/24h?',
          data:{
            location: lng + ',' + lat,
            key: getApp().tianqiApi.heweatherApiKey
          },success(res){
            console.log(res.data.hourly)
            var hoursweathers = []
            for (let h of res.data.hourly) {
              hoursweathers.push({
                icon: h.icon,
                text: h.text,
                temp: h.temp,
                hours: h.fxTime.substring(h.fxTime.indexOf('2021-') + 11, h.fxTime.indexOf('2021-') + 13),
                win: h.windDir
              })
            }
            console.log(hoursweathers)
            _this.setData({
              hoursweather: hoursweathers
            })
            var sevenhoursweather = []
            for (var i = 0; i <= 23; i++) {
              sevenhoursweather.push(hoursweathers[i])
            }
            _this.setData({
              sevenhoursweather: sevenhoursweather
            })
            // console.log(sevenhoursweather)
          }
        })
        _this.pushweather(action)
      },
      fail(res) {
        console.log('调用天气接口失败')
        console.log(res.data)
      }
    })
    // 发起网络请求，获取各种生活指数
    wx.request({
      url: 'https://devapi.qweather.com/v7/indices/1d',
      data: {
        type: '1,2,3,8,9,10',
        location: lng + ',' + lat,
        key: getApp().tianqiApi.heweatherApiKey
      },
      success(res) {
        var weather = res.data.daily
        console.log('和风天气API:')
        console.log(weather)
        // 保存空气信息
        var air = {
          aqi: weather[1].category,
          level: weather[1].level,
          desp: weather[1].text
        }
        // 显示空气质量信息
        _this.setData({
          air: air
        })
        _this.data.switch1Show
        // 显示各种生活指数
        var cards = [{
            title: '空气质量',
            show: _this.data.switch1Show,
            content: weather[1].category,
            description: weather[1].text
          }, {
            title: '舒适指数',
            show: _this.data.switch2Show,
            content: weather[0].category,
            description: weather[0].text
          },
          {
            title: '洗车指数',
            show: _this.data.switch3Show,
            content: weather[2].category,
            description: weather[2].text
          },
          {
            title: '穿衣指数',
            show: _this.data.switch4Show,
            content: weather[4].category,
            description: weather[4].text
          }, {
            title: '流感指数',
            show: _this.data.switch5Show,
            content: weather[5].category,
            description: weather[5].text
          }, {
            title: '运动指数',
            show: _this.data.switch6Show,
            content: weather[3].category,
            description: weather[3].text
          }
        ]
        _this.setData({
          cards: cards
        })
      },
      fail(res) {
        console.log('调用和风天气接口失败')
        console.log(res)
      }
    })
  },
  pushweather:function(action){
    var _this = this
    // 至此，所有接口已经调用完成
    var title = ''
    // 判断调用的动作是刷新还是初次加载
    switch (action) {
      case 'INIT':
        wx.hideLoading()
        // 计算加载耗时并显示
        title = '加载完毕，耗时' + (Date.now() - _this.data.initTime) + '毫秒'
        var newNavBarItem = _this.data.navbarItem
        newNavBarItem[0].animation = 'fade-in'
        console.log(_this.data.threeDayWeather)
        _this.setData({
          DayWeather: _this.data.threeDayWeather,
          // 加载动画
          navbarItem: newNavBarItem
        })
        console.log(_this.data.DayWeather)
        // 切换到默认页面
        setTimeout(function () {
          _this.setData({
            currentPage: 1
          })
        }, 200)
        break
      case 'REFRESH':
        // 将状态设置为停止刷新
        _this.setData({
          refreshTriggered: false
        })
        // 判断当前显示的是几日天气
        if (_this.data.DayWeather.length == 3) {
          _this.setData({
            DayWeather: _this.data.threeDayWeather
          })
        } else {
          _this.setData({
            DayWeather: _this.data.sevenDayWeather
          })
        }
        title = '天气与位置信息已刷新～'
        break
    }
    // 显示加载完毕的提示
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })
  },
  
  // 切换底部tab和页面
  switchTab: function (event) {
    var _this = this
    // 获取被点击的tab的ID
    var id = Number.parseInt(event.currentTarget.id.split('-')[1])
    var newNavBarItem = this.data.navbarItem
    // 取消激活所有的tab
    for (var i = 0; i < newNavBarItem.length; i++) {
      newNavBarItem[i].active = ''
    }
    // 更新页面淡出与淡入的动画
    newNavBarItem[this.data.currentPage - 1].animation = 'fade-out'
    newNavBarItem[id].animation = 'fade-in'
    // 激活被点击的tab
    newNavBarItem[id].active = 'active'
    this.setData({
      navbarItem: newNavBarItem
    })
    // 动画加载完毕后切换到对应的页面
    setTimeout(function () {
      _this.setData({
        currentPage: id + 1
      })
    }, 200)
  },
  // 显示或隐藏七日内天气
  showAndHide: function () {
    // 改变按钮文字
    if (this.data.hideAndShow == '查看') {
      this.setData({
        hideAndShow: '隐藏',
        DayWeather: this.data.sevenDayWeather
      })
    } else {
      this.setData({
        hideAndShow: '查看',
        DayWeather: this.data.threeDayWeather
      })
    }
  },
}
//生活指数隐藏与显示
for (let i = 1; i <= 6; i++) {
  (function (index) {
    pageData[`switch${index}Change`] = function (e) {
      var obj = {}
      obj[`switch${index}Show`] = e.detail.value
      this.setData(obj)
      var _this = this
      _this.setData({
        switchindexShow: e.detail.value
      })
      console.log(_this.data.switch1Show)
    }
  })(i)
}
//七小时预报显隐
pageData[`hourChange`] = function (evl) {
  var obj = {}
  obj[`hoursweatherShow`] = evl.detail.value
  this.setData(obj)
  var _this = this
  _this.setData({
    hoursweatherShow: evl.detail.value
  })
  console.log(_this.data.hoursweatherShow)
}
//一言显隐
pageData[`hitokotoChange`] = function (e) {
  var obj = {}
  obj[`hitokotoShow`] = e.detail.value
  this.setData(obj)
  var _this = this
  _this.setData({
    hitokotoShow: e.detail.value
  })
  console.log(_this.data.hitokotoShow)
}

Page(pageData)
// Code by Revincx
// Increase by Skyil