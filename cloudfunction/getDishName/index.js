// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    let res = await db.collection('dish_info').get();
    let tmp = []
    for (let i = 0; i < res.data.length; i++) {
      let item = {
        _id : res.data[i]._id,
        name : res.data[i].name
      }
      tmp.push(item)
    }
    return tmp
}
