//index.js
const app = getApp()
const db = app.globalData.db
import * as echarts from '../../ec-canvas/echarts';
let chart;

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  chart.setOption(option);
  return chart;
}
var option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ],
  grid: {
    // 绘图网格与底部的距离
    y2: 80,
    // 绘图网格与顶部的距离
    y:20,
    // 绘图网格与左侧的距离
    x: 30,
    x2:30
  }

};

Page({
  data: {
    ec: {
      onInit: initChart
    },
    showDialog: false,
    form: {title:"",content:""},
    status: '0'
  },

  closeDialog(){
    this.setData({
      showDialog: false
    })
  },

  handleChangeStatus(e) {
    let data = e.currentTarget.dataset.status
    if (data == this.data.status) {
      return
    }
    let tmp = wx.getStorageSync('systemData')
    tmp = JSON.parse(tmp)
    let id = tmp._id
    tmp = this.data.form
    let _this = this
    db.collection("system_info").doc(id).update({
      data: {
        status: data
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
        let storage = wx.getStorageSync('systemData')
        storage = JSON.parse(storage)
        storage.status = data
        wx.setStorageSync('systemData', JSON.stringify(storage))
        _this.setData({
          status: data
        })
      },
      fall:res=>{
        wx.showToast({
          title: '修改状态失败',
          icon: 'error',
          duration: 2000
        })
      },
    })
  },

  handleSubmitDialog(){
    console.log(this.data.form)
    let tmp = wx.getStorageSync('systemData')
    tmp = JSON.parse(tmp)
    let id = tmp._id
    tmp = this.data.form
    let _this = this
    db.collection("system_info").doc(id).update({
      data: {
        message: _this.data.form
      },
      success: function(res) {
        wx.showToast({
          title: '发送消息成功',
          icon: 'success',
          duration: 2000
        })
        let data = wx.getStorageSync('systemData')
        data = JSON.parse(data)
        data.message = _this.data.form
        wx.setStorageSync('systemData', JSON.stringify(data))
        _this.closeDialog()
      },
      fall:res=>{
        wx.showToast({
          title: '发送消息失败',
          icon: 'error',
          duration: 2000
        })
      },
    })
  },

  onInput(e){
    this.data.form[e.currentTarget.id] = e.detail.value
  },

  stopMaking(){

  },

  stopGettingOrders(){

  },
  
  async initpage(){
    let system = await db.collection("system_info").get()
    wx.setStorageSync('systemData', JSON.stringify(system.data[0]))
    let tmp = system.data[0]
    this.setData({
      status: tmp.status,
      form: tmp.message
    })
  },

  sendNewMessage(){
    this.setData({
      showDialog: true
    })
  },

  onLoad: function () {
    if (app.globalData.initCloud) { // 云初始化已完成
      this.initpage() // do something
    } else {
      app.watch(() => this.initpage())
    }
  },
  
})
