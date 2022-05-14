// pages/company/index.js
const app = getApp()
const db = app.globalData.db
const config = require('../../static/configs/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {},
    codeimg: config.configData.cloudStoreAdress + '/company/code.png'
  },

  DelImg(){
    this.setData({
      codeimg: ''
    })
  },
  submitForm(e){
    let form = e.detail.value
    if( !(/^1[3|4|5|7|8]\d{9}$/.test(form.phone)) || !/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(form.phone)){
      wx.showToast({
        title: '手机号码有误',
        icon:'error',
        duration:1000
      })
      return
    }
    this.data.form = form
    if (this.data.codeimg.includes('http')) {
      this.uploadImage()
    }
    let tmp = wx.getStorageSync('companyData')
    tmp = JSON.parse(tmp)
    let id = tmp._id
    form.label = form.label.trim().split(/\s+/)
    let _this = this
    db.collection("company_info").doc(id).update({
      data: {
        addr: form.addr,
        name:form.name,
        phone: form.phone,
        wx: form.wx,
        desc: form.desc,
        time: form.time,
        label: form.label
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })

        wx.setStorageSync('campanyData', JSON.stringify(form))
        _this.setData({
          form : _this.process(form)
        })
      },
      fall:res=>{
        wx.showToast({
          title: '修改失败',
          icon: 'error',
          duration: 2000
        })
      },
    })
  },

  process(data){
    let tmp = data.label
    let str = ""
    for (let i = 0; i< tmp.length; i++) {
      str = str + tmp[i] + ' '
    }
    str = str.substr(0, str.length - 1);
    data.label = str
    return data
  },
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          codeimg: res.tempFilePaths[0]
        })
      }
    });
  },

  uploadImage(){
    let path = this.data.codeimg
    wx.cloud.uploadFile({//上传至微信云存储
      cloudPath:'company/code.png',//使用dish 的 _id命名
      filePath:path,// 暂时存放的文件路径
      success: res => {
        // 返回文件 ID
        console.log("上传成功",res.fileID)
      },
      fail: err =>{
        console.log("上传失败", err)
      }
    })
  },
  reset(){
    this.initPage()
  },

  async initPage(){
    let system = wx.getStorageSync('companyData')
    if (system ==undefined) {
      system = await db.collection("company_info").get()
      wx.setStorageSync('companyData', JSON.stringify(system.data[0]))
      let tmp = system.data[0]
    }
    this.setData({
      form: tmp
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // if (app.globalData.initCloud) { // 云初始化已完成
    //   this.initPage() // do something
    // } else {
    //   app.watch(() => this.initPage())
    // }
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