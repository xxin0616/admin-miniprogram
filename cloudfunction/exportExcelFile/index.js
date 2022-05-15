// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const xlsx = require('node-xlsx');
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  let collection = event.collection
  try {
    // 获得集合中所有数据
    let count = await db.collection(collection).count()
    count = count.total
    let all = []
    for (let i = 0; i < count; i += 100) { 
      let list = await db.collection(collection).skip(i).get()
      all = all.concat(list.data);
    }
    let userdata = all;
    let time = Date.parse(new Date()).toString();
    //1,定义excel表格名
    let dataCVS = collection + time + '.xlsx'
    //获取所有的key
    let keys = Object.keys(userdata[0]);

    //2，定义存储数据的
    let alldata = [];
    let row = keys; //表属性
    alldata.push(row);

    for (let i in userdata) {
      let arr = [];
      for (let j in keys) {
        let tmp = userdata[i][keys[j]]
        // 如果数据不是 string 或者是number类型 将他们string化
        if (typeof(tmp) != 'string' || typeof(tmp) != 'number') {
          tmp = JSON.stringify(tmp)
        }
        arr.push(tmp);
      }
      alldata.push(arr)
    }

    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "sheet1",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里

    let res = await cloud.uploadFile({
      cloudPath: 'excel/'+dataCVS,
      fileContent: buffer, //excel二进制文件
    })
    return res
  } catch (e) {
    console.error(e)
    return e
  }
}