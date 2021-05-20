// 云函数入口文件
const cloud = require('wx-server-sdk')

// cloud.init()
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const userinfo = db.collection('userinfo_weather')

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const {
    OPENID
  } = cloud.getWXContext()
  const result = await userinfo.where({
    openid: OPENID
  }).get()
  // return result
  if(result.data.length === 0){
    await userinfo.add({
      data: {
        info: event.userinfo,
        settings:{
          switch1Show: event.switch1Show,
          switch2Show: event.switch2Show,
          switch3Show: event.switch3Show,
          switch4Show: event.switch4Show,
          switch5Show: event.switch5Show,
          switch6Show: event.switch6Show,
          hitokotoShow: event.hitokotoShow,
          hoursweatherShow: event.hoursweatherShow,
        },
        location: event.location,
        city: event.city,
        openid: OPENID
      }
    })
    return 'new'
  }else{
    await userinfo.where({
      openid: OPENID
    }).update({
      data: {
        info: event.userinfo,
        settings:{
          switch1Show: event.switch1Show,
          switch2Show: event.switch2Show,
          switch3Show: event.switch3Show,
          switch4Show: event.switch4Show,
          switch5Show: event.switch5Show,
          switch6Show: event.switch6Show,
          hitokotoShow: event.hitokotoShow,
          hoursweatherShow: event.hoursweatherShow,
        },
        location: event.location,
        city: event.city
      }
    })
    return 'update'
  }
}