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

  handleExport(){

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