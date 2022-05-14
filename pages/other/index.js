// pages/other/index.js
const app = getApp()
const db = app.globalData.db
const config = require('../../static/configs/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dishSwiper:[],
    frontSwiper:[]
  },

  addImage(e){
    let type = e.currentTarget.dataset.type
    if (type == "dish") {
      let dish = this.data.dishSwiper
      dish.push("")
      this.setData({
        dishSwiper: dish
      })
    } else{
      let dish = this.data.frontSwiper
      dish.push("")
      this.setData({
        frontSwiper: dish
      })
    }
  },

  saveList(e){
    let type = e.currentTarget.dataset.type
    if (type == "dish") {
      let dish = this.data.dishSwiper
      let flag = true
      for (let i = 0; i < dish.length; i++){
        if (dish[i].includes('http')) {
          let time = Math.random().toString(36).slice(-8);
          if (!this.uploadImage('dish', dish[i], time)) {
            wx.showToast({
              title: '图片上传失败',
              icon:'error',
              duration: 1000
            })
            return
          }
          dish[i] = config.configData.cloudStoreAdress + '/swiper/dish/'+ time + '.jpg'
        }
      }
      for (let i = 0; i < dish.length; i++) {
        if (dish[i] == '') {
          dish.splice(i,1);
          i--
          continue;
        }
      }
      this.data.dishSwiper = dish 
      this.updataDishSwiperdata()
    } else{
      let dish = this.data.frontSwiper
      for (let i = 0; i < dish.length; i++){
        if (dish[i].includes('http')) {
          let time = Math.random().toString(36).slice(-8);
          if (!this.uploadImage('front', dish[i], time)) {
            wx.showToast({
              title: '图片上传失败',
              icon:'error',
              duration: 1000
            })
            return
          }
          dish[i] = config.configData.cloudStoreAdress + '/swiper/front/'+ time + '.jpg'
        }
      }
      for (let i = 0; i < dish.length; i++) {
        if (dish[i] == '') {
          dish.splice(i,1);
          i--
          continue;
        }
      }
      this.data.frontSwiper = dish  
      this.updataFrontSwiperdata()
    }
  },

  updataDishSwiperdata(){
    let tmp = wx.getStorageSync('systemData')
    tmp = JSON.parse(tmp)
    let id = tmp._id
    tmp = this.data.dishSwiper
    for (let i = 0; i < tmp.length; i++) {
      tmp[i] = tmp[i].slice(config.configData.cloudStoreAdress.length)
    }
    let _this = this
    db.collection("system_info").doc(id).update({
      data: {
        dishSwiper: tmp
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功，稍候刷新',
          icon: 'success',
          duration: 2000
        })
        let data = wx.getStorageSync('systemData')
        data = JSON.parse(data)
        data.dishSwiper = tmp
        wx.setStorageSync('systemData', JSON.stringify(data))
        setTimeout(
          _this.setData({
            dishSwiper : _this.process(tmp)
          })
        , 5000 )
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

  updataFrontSwiperdata(){
    let tmp = wx.getStorageSync('systemData')
    tmp = JSON.parse(tmp)
    let id = tmp._id
    tmp = this.data.frontSwiper
    for (let i = 0; i < tmp.length; i++) {
      tmp[i] = tmp[i].slice(config.configData.cloudStoreAdress.length)
    }
    let _this = this
    db.collection("system_info").doc(id).update({
      data: {
        frontSwiper: tmp
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功,稍候刷新',
          icon: 'success',
          duration: 2000
        })
        let data = wx.getStorageSync('systemData')
        data = JSON.parse(data)
        data.frontSwiper = tmp
        wx.setStorageSync('systemData', JSON.stringify(data))
        setTimeout(
          _this.setData({
            frontSwiper : _this.process(tmp)
          })
        , 5000 )
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

  async uploadImage(type, path, name){
    let flag = false
    await wx.cloud.uploadFile({//上传至微信云存储
      cloudPath:'swiper/'+ type + '/' + name + ".jpg",//使用dish 的 _id命名
      filePath:path,// 暂时存放的文件路径
      success: res => {
        // 返回文件 ID
        console.log("上传成功",res.fileID)
        flag = true
      },
      fail: err =>{
        console.log("上传失败", err)
        flag = false
      }
    })
    return flag
  },

  deleteImage(e){
    let _this = this
    wx.showModal({
      title: '提示',
      content: '确认删除这张图片嘛',
      success (res) {
        if (res.confirm) {
          let type = e.currentTarget.dataset.type
          let index = e.currentTarget.dataset.index
          if (type == "dish") {
            
            let dish = _this.data.dishSwiper
            if (dish[index].includes('cloud')) {
              _this.deleteImageFromStorage(dish[index])
            }
            if (dish[index] == '') {
              dish.splice(index, 1)
            } else{
              dish[index] = ''
            }
            _this.setData({
              dishSwiper: dish
            })
          } else{
            let dish = _this.data.frontSwiper
            if (dish[index].includes('cloud')) {
              _this.deleteImageFromStorage(dish[index])
            }
            if (dish[index] == '') {
              dish.splice(index, 1)
            } else{
              dish[index] = ''
            }
            _this.setData({
              frontSwiper: dish
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  deleteImageFromStorage(name){
    wx.cloud.deleteFile({
      fileList: [name],
      success: res => {
        console.log("成功删除图片文件",res.fileList)
      },
      fail: err => {
        console.log("删除图片文件失败",err)
      }
    })
  },
  ChooseImage(e) {
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (type == "dish") {
          let dish = this.data.dishSwiper
          dish[index] = res.tempFilePaths[0]
          this.setData({
            dishSwiper: dish
          })
        } else{
          let dish = this.data.frontSwiper
          dish[index] = res.tempFilePaths[0]
          this.setData({
            frontSwiper: dish
          })
        }
      }
    });
  },

  async initPage(){
    let system = await db.collection("system_info").get()
    wx.setStorageSync('systemData', JSON.stringify(system.data[0]))
    let tmp = system.data[0]
    this.setData({
      dishSwiper: tmp.dishSwiper.length == 0? [""] : this.process(tmp.dishSwiper),
      frontSwiper: tmp.frontSwiper.length == 0? [""] : this.process(tmp.frontSwiper)
    })
  },

  process(data) {
    let arr = []
    data.forEach((item)=>{
      item = config.configData.cloudStoreAdress + item
      arr.push(item)
    })
    return arr
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