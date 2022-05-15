//app.js
let configData = require('./static/configs/config')

App({
  onLaunch: function() {
    let _this = this
    if(!wx.cloud) {
      console.error("初始化云能力失败");
    }else {
      wx.cloud.init({
        env: configData.configData.envID
      })
      console.log("已经初始化云能力")
      this.globalData.db = wx.cloud.database()
      wx.cloud.callFunction({
        name:"adminEndGetData",
        data:{},
        complete:res=>{
          console.log("调用云函数的结果",res)
          wx.setStorageSync('dishData', JSON.stringify(res.result.dish))
          wx.setStorageSync('typeData', JSON.stringify(res.result.type))
          wx.setStorageSync('userData', JSON.stringify(res.result.user))
          wx.setStorageSync('orderData', JSON.stringify(res.result.order))
          wx.setStorageSync('companyData', JSON.stringify(res.result.company))
          wx.setStorageSync('systemData', JSON.stringify(res.result.system))
          
          console.log("客户端存储中的 openId",wx.getStorageSync('openId'))
          console.log("客户端存储中的 dishData",wx.getStorageSync('dishData'))
          console.log("客户端存储中的 typeData",wx.getStorageSync('typeData'))
          console.log("客户端存储中的 companyData",wx.getStorageSync('companyData'))
          console.log("客户端存储中的 systemData",wx.getStorageSync('systemData'))
          
          _this.globalData.initCloud = true
        }
      })
    }
  },

  watch(method){
    var obj = this.globalData;
    Object.defineProperty(obj,"initCloud", {
      configurable: true,//描述属性是否配置，以及可否删除 false 时，不能删除当前属性，且不能重新配置当前属性的描述符(有一个小小的意外：true时，可以删除当前属性，可以配置当前属性所有描述符。
      enumerable: true,//描述属性是否会出现在for in 或者 Object.keys()的遍历中
      set: function (value) {
        this._initCloud = value;
        method(value);
      },
      get:function(){
      // 可以在这里打印一些东西，然后在其他界面调用getApp().globalData.chatList的时候，这里就会执行。
        return this._initCloud
      }
    })
  },

  globalData: {
    _initCloud: null
  }
})