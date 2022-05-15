// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let res = {}
  const db = cloud.database()
  let countData = {}
  let count = await db.collection('dish_info').count()
  count = count.total
  countData.dish = count
  let all = []
  for (let i = 0; i < count; i += 100) { 
    let list = await db.collection('dish_info').skip(i).get()
    all = all.concat(list.data);
  }
  res.dish = all

  count = await db.collection('type_info').count()
  count = count.total
  countData.type = count
  all = []
  for (let i = 0; i < count; i += 100) { 
    let list = await db.collection('type_info').skip(i).get()
    all = all.concat(list.data);
  }
  res.type = all

  count = await db.collection('user_info').count()
  count = count.total
  countData.user = count
  all = []
  for (let i = 0; i < count; i += 100) { 
    let list = await db.collection('user_info').skip(i).get()
    all = all.concat(list.data);
  }
  res.user = all

  count = await db.collection('order_info').count()
  count = count.total
  countData.order = count
  all = []
  for (let i = 0; i < count; i += 100) { 
    let list = await db.collection('order_info').skip(i).get()
    all = all.concat(list.data);
  }
  res.order = all

  let company = await db.collection('company_info').get();
  let system = await db.collection('system_info').get();

  res.company = company.data[0]
  res.system = system.data[0]
  res.system.count = countData

  console.log(res)
  return res
}