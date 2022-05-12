//index.js
const app = getApp()

Page({
  data: {
  },
  
  initPage(){

  },

  onLoad: function () {
    if (app.globalData.initCloud) { // 云初始化已完成
      this.initpage() // do something
    } else {
      app.watch(() => this.initpage())
    }
  },
  
})
