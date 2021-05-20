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
    return 'no'
  }else{
    return result.data
  }
}