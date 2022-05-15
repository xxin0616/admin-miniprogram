// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let count = await db.collection('order_info').count()
  count = count.total
  let all = []
  for (let i = 0; i < count; i += 100) { 
    let list = await db.collection('order_info').skip(i).get()
    all = all.concat(list.data);
  }

  return all
}