// pages/order/index.js
const app = getApp()
const db = app.globalData.db
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // true表示显示的是未完成的 false表示显示所有的
    panel: true,
    // true表示显示数据 false 表示查找
    tableMode:true,
    allData: [],
    searchData: [],
    searchText:"",
    active:null,
    fileUrl: '',
    showDialog: false,
    currentID:""
  },

  handleExport() {
    let that = this;
    wx.showLoading({
      title: '正在生成，请稍等',
    })
    wx.cloud.callFunction({
      name: "exportExcelFile",
      data:{
        collection: 'order_info'
      },  
      success(res) {
        console.log("生成excel文件成功", res.result.fileID)
        that.getFileUrl(res.result.fileID);
      },
      fail(res) {
        console.log("生成excel文件失败", res)
        wx.hideLoading()
        wx.showToast({
          title: '生成excel文件失败',
          icon:'error',
          duration: 2000
        })
      }
    })
  },

 //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        that.setData({
          fileUrl: res.fileList[0].tempFileURL
        })
        that.copyFileUrl()
      },
      fail: err => {
        console.log("云文件下载失败")
        wx.hideLoading()
        wx.showToast({
          title: '生成excel文件失败',
          icon:'error',
          duration: 2000
        })
      }
    })
  },
 //复制excel文件下载链接
  copyFileUrl() {
    let that = this
    wx.setClipboardData({
      data: that.data.fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功", res.data) // data
            wx.hideLoading()
            wx.showToast({
              title: '下载链接已复制',
              icon:'success',
              duration: 4000
            })
          },
          fail(res){
            console.log("出错了",res)
            wx.hideLoading()
            wx.showToast({
              title: '生成excel文件失败',
              icon:'error',
              duration: 2000
            })
          }
        })
      }
    })
  },

  changePanel(){
    this.setData({
      panel: !this.data.panel
    })
  },

  handleSeach(e) {
    let data = e.detail.value
    if (data == "") {
      this.setData({
        tableMode: true,
        searchText: ""
      })
      return
    }
    this.data.searchText = data
    this.search()
  },

  search(){
    let data = this.data.searchText
    let orderData = this.data.allData
    let seach = orderData.filter((item) => {
      return item.orderData.addr.name == data || item.orderData.addr.phone == data || item.orderData.addr.addr == data || item._id == data
    })
    console.log("查找到的数据",seach)
    if (seach.length == 0) {
      wx.showToast({
        title: '没有查找到数据',
        duration: 1000
      })
      return
    }
    this.setData({
      searchData: seach,
      tableMode: false,
      panel: false,
    })
  },

  handleCloseSeach(){
    this.setData({
      tableMode: true,
      searchText: ""
    })
  },

  process(data) {
    data.forEach((item)=>{
      let timeString = {
        deliver:"",
        ending:"",
        making:"",
        overbooking:""
      }
      let time = item.time
      if (time.overbooking != '') {
        timeString.overbooking = util.dateFormat(time.overbooking)
      }
      if (time.deliver != '') {
        timeString.deliver = util.dateFormat(time.deliver)
      }
      if (time.ending != '') {
        timeString.ending = util.dateFormat(time.ending)
      }
      if (time.making != '') {
        timeString.making = util.dateFormat(time.making)
      }
      item.timeString = timeString
    })
    return data
  },

  changeActive(e){
    let active = e.currentTarget.dataset.active
    if(this.data.active == active) {
      active = null
    }
    this.setData({
      active: active
    })
  },

  getOrderData(){
    wx.showLoading({
      title: '正在加载数据中',
    })
    db.collection("order_info").get({
      complete:(res) => {
        let tmp = this.process(res.data)
        console.log(tmp)
        this.setData({
          totalNum: res.data.length,
          allData: tmp,
          tableMode: true,
          searchText:""
        })
      }
    })
    wx.hideLoading({
      title: '正在加载数据中',
    })
  },
  handleSubmitDialog(){
    let id = this.data.currentID
    let cooker = this.data.cooker
    let _this = this
    db.collection('order_info').doc(id).update({
      data: {
        status: '2',
        cooker: cooker
      },
      success: function(res) {
        console.log("成功了嘛",res)
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
        let orderList = _this.data.allData
        let index = orderList.findIndex((item)=>{
          return item._id == id
        })
        orderList[index].status = '2'
        orderList[index].cooker = cooker

        let searchList = _this.data.searchData
        index = searchList.findIndex((item)=>{
          return item._id == id
        })
        searchList[index].status = '2'
        searchList[index].cooker = cooker
        _this.setData({
          allData: orderList,
          searchData: searchList
        })
      },
      fall:res=>{
        wx.showToast({
          title: '修改失败',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },
  onInput(e){
    this.data.cooker = e.detail.value
  },
  closeDialog(){
    this.setData({
      showDialog: false
    })
  },

  changStatus(e){
    let id = e.currentTarget.dataset.id
    let status = e.currentTarget.dataset.status

    if (status == '2') {
      this.data.currentID = id
      this.setData({
        showDialog: true
      })
      return
    }
    let _this = this
    db.collection('order_info').doc(id).update({
      data: {
        status: status,
      },
      success: function(res) {
        console.log("成功了嘛",res)
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
        let orderList = _this.data.allData
        let index = orderList.findIndex((item)=>{
          return item._id == id
        })
        orderList[index].status = status

        let searchList = _this.data.searchData
        index = searchList.findIndex((item)=>{
          return item._id == id
        })
        searchList[index].status = status
        _this.setData({
          allData: orderList,
          searchData: searchList
        })

      },
      fall:res=>{

        wx.showToast({
          title: '修改失败',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },
  initPage(){
    this.getOrderData()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.globalData.initCloud) { // 云初始化已完成
      this.initPage() // do something
    } else {
      app.watch(() => this.initPage())
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})