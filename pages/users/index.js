// pages/users/index.js
const app = getApp()
const db = app.globalData.db
const util = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // true表示显示数据 false 表示查找
    tableMode:true,
    allData: [],
    searchData: [],
    searchText:"",
    active:null
  },
  handleExport() {
    let that = this;
    wx.showLoading({
      title: '正在生成，请稍等',
    })
    wx.cloud.callFunction({
      name: "exportExcelFile",
      data:{
        collection: 'user_info'
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
      return item.nickName == data || item.nickName.includes(data)
    })
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
  handleDelete(e){
    let id = e.currentTarget.dataset.id
    db.collection("user_info").doc(id).remove({
      success: res => {
        wx.showToast({
          title: '删除成功',
        })

        let orderList = _this.data.allData
        let index = orderList.findIndex((item)=>{
          return item._id == id
        })
        orderList.splice(index, 1)

        let searchList = _this.data.searchData
        index = searchList.findIndex((item)=>{
          return item._id == id
        })
        searchList.splice(index, 1)

        _this.setData({
          allData: orderList,
          searchData: searchList
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除失败',
        })
      }
    })
  },
  handleCloseSeach(){
    this.setData({
      tableMode: true,
      searchText: ""
    })
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
    db.collection("user_info").get({
      complete:(res) => {
        this.setData({
          totalNum: res.data.length,
          allData: res.data,
          tableMode: true,
          searchText:""
        })
      }
    })
    wx.hideLoading({
      title: '正在加载数据中',
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