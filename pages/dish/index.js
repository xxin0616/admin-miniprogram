// pages/dish/index.js
const app = getApp()
const db = app.globalData.db
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:null,
    // true表示用allData false表示用searchData
    tableMode: true,
    showAddDialog: false,
    // 新增还是修改mode -1表示新增
    mode: -1,
    addForm:{name:"",imgSrc:"",price:""},
    totalNum: 0,
    allData:[],
    searchData:[],
    searchText:"",
    imgPrefix: "cloud://futoo-test-7glxxkute4ab5a38.6675-futoo-test-7glxxkute4ab5a38-1311079499/dishImg/",
    showChoiceDialog: false,
    showHealthDialog: false,
    showOtherDialog: false,
    healthForm:{fat:"",salt:"",fiber:"",protein:"",carbon:"",energy:""},
    otherForm:[{name:"", content:""}],
    choiceForm:[{type:true, name:"", content:""}]
  },

  handleExport() {
    let that = this;
    wx.showLoading({
      title: '正在生成，请稍等',
    })
    wx.cloud.callFunction({
      name: "exportExcelFile",
      data:{
        collection: 'dish_info'
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
  openChoiceDialog(e){
    let data = e.currentTarget.dataset
    this.setData({
      showChoiceDialog: true,
      mode: data.mode
    })
    
    let tmp
    if (this.data.tableMode) {
      tmp = this.data.allData[data.mode].choice
    } else {
      tmp = this.data.searchData[data.mode].choice
    }
    if (tmp == undefined || tmp.length == 0) {
      tmp = [{type:true, name:"", content:""}]
    }
    this.setData({
      choiceForm: tmp
    })
  },
  closeChoiceDialog(e) {
    this.setData({
      showChoiceDialog: false,
    })
  },
  onSwitchChange(e){
    this.data.choiceForm[e.currentTarget.dataset.index].type = e.detail.value
  },
  handleSubmitChoiceDialog(){
    console.log(this.data.choiceForm)
    for (let i = 0; i < this.data.choiceForm.length; ++i) {
      if (this.data.choiceForm[i].name == "" || this.data.choiceForm[i].content == "") {
        this.data.choiceForm.splice(i, 1)
        i--
      }
    }
    console.log(this.data.choiceForm)
    if (this.data.choiceForm.length == 0) {
      wx.showToast({
        title: '请输入标题和内容',
        icon: 'error',
        duration: 1000
      })
      return
    }

    let id
    if (this.data.tableMode) {
      id = this.data.allData[this.data.mode]._id
    } else {
      id = this.data.searchData[this.data.mode]._id
    }
    db.collection('dish_info').doc(id).update({
      data: {
        choice : this.data.choiceForm
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
      },
      fall:res=>{
        wx.showToast({
          title: '修改失败',
          icon: 'error',
          duration: 2000
        })
      },
      complete: res=>{
        this.refreshPage()
        this.closeChoiceDialog()
      }
    })
  },
  refreshPage(){
    if (this.data.tableMode) {
      this.initPage()
    } else {
      console.log("是否更新search")
      this.search()
    }
  },
  handleAddChoice(e) {
    let tmp = this.data.choiceForm
    tmp.push({type:0, name:"", content:""})
    this.setData({
      choiceForm: tmp
    })
  },
  handleAddOther(e) {
    let tmp = this.data.otherForm
    tmp.push({name:"", content:""})
    this.setData({
      otherForm: tmp
    })
  },
  handleSubmitOtherDialog(){
    console.log(this.data.otherForm)
    for (let i = 0; i < this.data.otherForm.length; ++i) {
      if (this.data.otherForm[i].name == "" || this.data.otherForm[i].content == "") {
        this.data.otherForm.splice(i, 1)
        i--
      }
    }
    console.log(this.data.otherForm)
    if (this.data.otherForm.length == 0) {
      wx.showToast({
        title: '请输入标题和内容',
        icon: 'error',
        duration: 1000
      })
      return
    }
    let id
    if (this.data.tableMode) {
      id = this.data.allData[this.data.mode]._id
    } else {
      id = this.data.searchData[this.data.mode]._id
    }
    db.collection('dish_info').doc(id).update({
      data: {
        other_info : this.data.otherForm
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
      },
      fall:res=>{
        wx.showToast({
          title: '修改失败',
          icon: 'error',
          duration: 2000
        })
      },
      complete: res=>{
        this.refreshPage()
        this.closeOtherDialog()
      }
    })

  },
  closeOtherDialog(){
    this.setData({
      showOtherDialog: false,
    })
  },
  openOtherDialog(e){
    let data = e.currentTarget.dataset
    this.setData({
      showOtherDialog: true,
      mode: data.mode
    })
    let tmp
    if (this.data.tableMode) {
      tmp = this.data.allData[data.mode].other_info
    } else {
      tmp = this.data.searchData[data.mode].other_info
    }

    if (tmp == undefined || tmp.length == 0) {
      tmp = [{name:"", content:""}]
    }
    this.setData({
      otherForm: tmp
    })
  },
  openHealthDialog(e){
    let data = e.currentTarget.dataset
    this.setData({
      showHealthDialog: true,
      mode: data.mode
    })
    let tmp
    if (this.data.tableMode) {
      tmp = this.data.allData[data.mode].health
    } else {
      tmp = this.data.searchData[data.mode].health
    }
    this.setData({
      healthForm: tmp
    })
  },
  closeHealthDialog(e){
    this.setData({
      showHealthDialog: false
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        let tmp = this.data.addForm
        tmp.imgSrc = res.tempFilePaths[0]
        this.setData({
          addForm: tmp
        })
      }
    });
  },
  DelImg(e) {
    let tmp = this.data.addForm
    tmp.imgSrc = ""
    this.setData({
      addForm: tmp
    })
  },
  handleDelete(e){
    let data = e.currentTarget.dataset
    let _this = this
    wx.showModal({
      title: '确认操作提示',
      content: '确认删除这个菜品嘛 '+data.name,
      confirmColor:'#4B81FF',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          _this.deleteData(data.id)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  handleCloseSeach(){
    this.initPage()
  },
  search(){
    let data = this.data.searchText
    db.collection('dish_info').where({
      name: data
    })
    .get({
      complete: (res) => {
        console.log("搜索结果是",res)
        if (res.data.length == 0) {
          wx.showToast({
            title: '无查找结果',
            icon: 'success',
            duration: 2000
          })
          this.setData({
            searchData: [],
            tableMode: false
          })
        } else {
          let tmp = this.process(res.data)
          this.setData({
            searchData: tmp,
            tableMode: false
          })
        }
      }
    })
  },
  handleSeach(e) {
    let data = e.detail.value
    if (data == "") {
      this.handleCloseSeach()
      return
    }
    this.data.searchText = data
    this.search()
  },
  process(data){
    data.forEach((item) => {
      item.imgSrc = "cloud://futoo-test-7glxxkute4ab5a38.6675-futoo-test-7glxxkute4ab5a38-1311079499/dishImg/" + item._id + '.jpg'
      
      item.healthString = '脂肪 ' + item.health.fat + " 碳水 " + item.health.carbon + " 能量 " + item.health.energy + " 蛋白质 " + item.health.protein + " 膳食纤维 " + item.health.fiber
      
      let otherString = ""
      let i
      for (i = 0; item.other_info != undefined && i < item.other_info.length; ++i) {
        otherString = otherString + item.other_info[i].name + ':' + item.other_info[i].content + ' '
      }
      item.otherString = otherString

      let choiceString = ""
      for (i = 0; item.choice != undefined && i < item.choice.length; ++i) {
        choiceString = choiceString + item.choice[i].name + '('+ (item.choice[i].type ? '单': '多') +'):' + item.choice[i].content + ' '
      }
      item.choiceString = choiceString

      item.timeSting = util.dateFormat(item.time)
    })
    return data
  },
  deleteData(id){
    console.log(id)
    let _this = this
    // 尝试删除图片
    this.deleteImage(id)
    db.collection("dish_info").doc(id).remove({
      success: (res) => {
        console.log("删除的结构",res)
        _this.refreshPage()
      }
    })
  },
  openAddDialog(e){
    let data = e.currentTarget.dataset
    this.setData({
      showAddDialog: true,
      mode: data.mode
    })
    let tmp
    if (this.data.tableMode) {
      tmp = this.data.allData[data.mode]
    } else {
      tmp = this.data.searchData[data.mode]
    }
    if (data.mode >= 0) {
      this.setData({
        addForm:{
          name: tmp.name, 
          price: tmp.price,
          imgSrc: tmp.imgSrc
        }
      })
    }
  },
  closeAddDialog(){
    this.setData({
      showAddDialog: false,
      addForm: {name:"",imgSrc:"",price:""}
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
  changeDishStatus(e){
    let data = e.currentTarget.dataset
    let _this = this
    wx.showModal({
      title: '确认操作提示',
      content: '确认 '+ data.name +' '+ (data.status == '1'?'售罄嘛':'开售嘛'),
      confirmColor:'#4B81FF',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          _this.changeStatus(data.id, data.status)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  changeStatus(id, status){
    let data 
    if(status == '1'){
      data = '0'
    } else {
      data='1'
    }
    let _this = this
    db.collection('dish_info').doc(id).update({
      data:{
        status: data
      },
      success: (res) => {
        let storage = wx.getStorageSync('dishData')
        storage = JSON.parse(storage)
        let index = storage.findIndex((item)=>{
          return item._id = id
        })
        storage[index].status = data
        wx.setStorageSync('dishData', JSON.stringify(storage))
        let tmp = _this.data.allData
        tmp[index].status = data
        this.setData({
          allData: tmp
        })
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },
  initPage(){
    let storage = wx.getStorageSync('dishData')
    let _this = this
    if (storage == undefined) {
      
      wx.showLoading({
        title: '正在加载数据中',
      })
      db.collection("dish_info").get({
        complete:(res) => {
          let tmp = _this.process(res.data)
          this.setData({
            totalNum: res.data.length,
            allData: tmp,
            tableMode: true,
            searchText: ""
          })
        }
      })
      wx.hideLoading({
        title: '正在加载数据中',
      })
    } else {
      storage = JSON.parse(storage)
      let tmp = _this.process(storage)
      this.setData({
        totalNum: storage.length,
        allData: tmp,
        tableMode: true,
        searchText: ""
      })
    }
    
  },
  handleCloseSeach(){
    this.setData({
      tableMode: true,
      searchText: ""
    })
  },
  handleSubmitAddDialog(e){
    if (this.data.addForm.name == "") {
      wx.showToast({
        title: '请填入名字',
        icon: "error",
        duration: 1000
      })
      return
    }
    if (this.data.addForm.price != "") {
      let pattern = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/;
      if (!pattern.test(this.data.addForm.price)) {
        let tmp = this.data.addForm
        tmp.price = ""
        this.setData({
          addForm : tmp
        })
        wx.showToast({
          title: '价格格式错误',
          icon: "error",
          duration: 1000
        })
        return
      }
    }
    if (this.data.mode >= 0) {
      let tmp
      if (this.data.tableMode) {
        tmp = this.data.allData[this.data.mode]
      } else {
        tmp = this.data.searchData[this.data.mode]
      }
      let id = tmp._id
      db.collection('dish_info').doc(id).update({
        data: {
          name: this.data.addForm.name,
          price: this.data.addForm.price
        },
        success: function(res) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000
          })
        },
        fall:res=>{
          wx.showToast({
            title: '修改失败',
            icon: 'error',
            duration: 2000
          })
        },
        complete: res=>{
          if (this.data.addForm.imgSrc != tmp.imgSrc && this.data.addForm.imgSrc != "") {
            this.uploadImage(id)
          }
          console.log("===============>")
          this.closeAddDialog()
          this.refreshPage()
        }
      })
    } else {
      let time = Date.parse( new Date() ).toString();
      db.collection("dish_info").add({
        data:{
          name: this.data.addForm.name,
          price: this.data.addForm.price,
          sales: 0,
          time: time,
          health: {fat:"0",salt:"0",fiber:"0",protein:"0",carbon:"0",energy:"0"},
          choice: [],
          status: 1,
          type: [],
          other_info: []
        },
        success: function(res) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1000
          })
        },
        fall:res=>{
          wx.showToast({
            title: '修改失败',
            icon: 'error',
            duration: 1000
          })
        },
        complete: res=>{
          // 如果有上传图片 
          if (this.data.addForm.imgSrc != "") {
            this.uploadImage(res._id)
          }
          this.closeAddDialog()
          this.refreshPage()
        }
      })
    }
  },
  handleSubmitHealthDialog(){
    // 检测 是否有不合规的数据输入
    // if (this.data.healthForm.price != "") {
    //   let pattern = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/;
    //   if (!pattern.test(this.data.addForm.price)) {
    //     let tmp = this.data.addForm
    //     tmp.price = ""
    //     this.setData({
    //       addForm : tmp
    //     })
    //     wx.showToast({
    //       title: '价格格式错误',
    //       icon: "error",
    //       duration: 1000
    //     })
    //     return
    //   }
    // }
    let id
    if (this.data.tableMode) {
      id = this.data.allData[this.data.mode]._id
    } else {
      id = this.data.searchData[this.data.mode]._id
    }
      db.collection('dish_info').doc(id).update({
        data: {
          health: this.data.healthForm
        },
        success: function(res) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 2000
          })
        },
        fall:res=>{
          wx.showToast({
            title: '修改失败',
            icon: 'error',
            duration: 2000
          })
        },
        complete: res=>{
          this.initPage()
          this.closeHealthDialog()
        }
      })
  },
  // 删除云存储中的照片 如果不存在也不会报错
  // 但是删除后 小程序中的imag 标签依然可以显示图片 这是之前就下载好的
  deleteImage(index) {
    wx.cloud.deleteFile(
      {
        fileList:[this.data.imgPrefix + index + '.jpg'],
        success:(res)=>{
          console.log("删除文件成功",res)
        },
        fail:(res)=>{
          console.log("删除文件失败",res)
        },
      }
    );
  },
  // 上传图片到云存储中，如果存在图片名字，则会直接覆盖 hhh
  uploadImage(index){
    let that=this
      wx.cloud.uploadFile({//上传至微信云存储
        cloudPath:'dishImg/' + index + ".jpg",//使用dish 的 _id命名
        filePath:that.data.addForm.imgSrc,// 暂时存放的文件路径
        success: res => {
          // 返回文件 ID
          console.log("上传成功",res.fileID)
          wx.showToast({
            icon:'success',
            title: '稍后刷新图片',
            duration: 1000
          })
        },
        fail: err =>{
          console.log("上传失败", err)
          wx.showToast({
            icon:'error',
            title: '图片上传失败，请重新上传',
            duration: 1000
          })
        }
      })
  },
  onInput(e){
    if (e.currentTarget.dataset.form == "otherForm" || e.currentTarget.dataset.form == "choiceForm") {
      this.data[e.currentTarget.dataset.form][e.currentTarget.dataset.index][e.currentTarget.id] = e.detail.value
    } else {
      this.data[e.currentTarget.dataset.form][e.currentTarget.id] = e.detail.value
    }
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