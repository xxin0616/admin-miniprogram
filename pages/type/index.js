// pages/type/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:null,
    tableData:[{},{},{},{},{}],
    showAddDialog: false,
    // 新增还是修改mode -1表示新增
    mode: -1
  },

  handleDelete(e){
    let data = e.currentTarget.dataset
    console.log(data)
    wx.showModal({
      title: '确认操作提示',
      content: '确认删除这个品类嘛 '+data.active,
      confirmColor:'#4B81FF',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  openAddDialog(e){
    console.log(e.currentTarget.dataset)
    let data = e.currentTarget.dataset
    this.setData({
      showAddDialog: true,
      mode: data.mode
    })
  },
  closeAddDialog(){
    this.setData({
      showAddDialog: false
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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