// pages/type/index.js
const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:null,
    // true表示用allData false表示用searchData
    tableMode: true,
    showAddDialog: false,
    showTypeDialog: false,
    // 新增还是修改mode -1表示新增
    mode: -1,
    addForm:{name:""},
    totalNum: 0,
    allData:[],
    searchData:[],
    searchText:"",
    dishForm:[],
    checkedArray:[]
  },
  handleExport() {
    let that = this;
    wx.showLoading({
      title: '正在生成，请稍等',
    })
    wx.cloud.callFunction({
      name: "exportExcelFile",
      data:{
        collection: 'type_info'
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
  checkboxChange(e) {
    this.data.checkedArray = e.detail.value
  },
  handleSubmitDishDialog(){
    let dish = []
    let checked = this.data.checkedArray
    for (let i = 0; i < checked.length; i++) {
      dish.push({name:this.data.dishForm[checked[i]].name, _id:this.data.dishForm[checked[i]]._id})
    }

    let type
    if (this.data.tableMode) {
      type = this.data.allData[this.data.mode]
    } else {
      type = this.data.searchData[this.data.mode]
    }
    let id = type._id
    console.log(dish)
    db.collection('type_info').doc(id).update({
      data: {
        sort : dish,
        count: dish.length
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
        this.closeDishDialog()
        this.initPage()
      }
    })
  },
  openTypeDialog(e){
    this.data.mode = e.currentTarget.dataset.mode

    let type
    if (this.data.tableMode) {
      type = this.data.allData[this.data.mode]
    } else {
      type = this.data.searchData[this.data.mode]
    }

    let dishForm = this.data.dishForm
    let j = 0
    for (let i = 0; i < dishForm.length; i++) {
      let flag = false
      for (let j = 0; type.sort != undefined && j < type.sort.length; j++){
        if(dishForm[i]._id == type.sort[j]._id) {
          flag = true
          break
        }
      }
      dishForm[i].value = flag
    }
    this.setData({
      showTypeDialog: true,
      dishForm: dishForm
    })
  },
  closeDishDialog(){
    this.setData({
      showTypeDialog: false
    })
  },
  getAllDishName(){
    let _this = this
    wx.cloud.callFunction({
      name: 'getDishName',
      complete: res => {
        let dishForm = []
        for (let i = 0; i < res.result.length; ++i) {
          dishForm.push({name: res.result[i].name , _id: res.result[i]._id, value: false})
        }
        _this.setData({
          dishForm: dishForm
        })
      }
    });
  },
  handleDelete(e){
    let data = e.currentTarget.dataset
    this.data.mode = data.mode
    let _this = this
    wx.showModal({
      title: '确认操作提示',
      content: '确认删除这个品类嘛 '+data.name,
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
    this.setData({
      tableMode: true,
      searchText: ""
    })
  },
  search(){
    let data = this.data.searchText
    db.collection('type_info').where({
      name: data
    })
    .get({
      complete: (res) => {
        if (res.data.length == 0) {
          wx.showToast({
            title: '无查找结果',
            icon: 'success',
            duration: 2000
          })
        }
        this.setData({
          searchData: res.data,
          tableMode: false
        })
      }
    })
  },
  handleSeach(e) {
    let data = e.detail.value
    if (data == "") {
      this.initPage()
      return
    }
    this.data.searchText = data
    this.search()
  },
  refreshPage(){
    if (this.data.tableMode) {
      this.initPage()
    } else {
      this.search()
    }
  },
  deleteData(){
    let type
    if (this.data.tableMode) {
      type = this.data.allData[this.data.mode]
    } else {
      type = this.data.searchData[this.data.mode]
    }
    let id = type._id

    let _this = this
    db.collection("type_info").doc(id).remove({
      success: (res) => {
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
    if (data.mode >= 0) {
      this.setData({
        addForm:{name:data.name}
      })
    }
  },
  closeAddDialog(){
    this.setData({
      showAddDialog: false,
      addForm: {name:""}
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
  initPage(){
    wx.showLoading({
      title: '正在加载数据中',
    })
    db.collection("type_info").get({
      complete:(res) => {
        console.log("获取品类信息",res)
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
  handleSubmitAddDialog(e){
    if (this.data.mode >= 0) {
      let id = this.data.allData[this.data.mode]._id
      db.collection('type_info').doc(id).update({
        data: {
          name: this.data.addForm.name
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
          this.closeAddDialog()
        }
      })
    } else {
      db.collection("type_info").add({
        data:{
          name: this.data.addForm.name,
          count: 0,
          sort: []
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
          this.closeAddDialog()
        }
      })
    }
    
  },
  onInput(e){
    this.data.addForm[e.currentTarget.id] = e.detail.value
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.globalData.initCloud) { // 云初始化已完成
      this.getAllDishName()
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