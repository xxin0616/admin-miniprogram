// components/sider/sider.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    _current: {
      type: String,
      value: "home",
      observer: 'loadCurrent'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    modalName: null,
    dish_expand: false,
    current: 'home',
    isDish: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadCurrent(){
      if (this.properties._current.includes("dish")){
        this.setData({
          isDish: true,
        })
      }
      this.setData({
        current: this.properties._current,
      })
    },
    expandDish(){
      let tmp = this.data.dish_expand;
      this.setData({
        dish_expand: !tmp,
      })
    },
    showModal(e) {
      this.setData({
        modalName: "DrawerModalL",
        dish_expand:false
      })
    },
    hideModal(e) {
      this.setData({
        modalName: null
      })
    },
    toHomePage(){
      wx.redirectTo({
        url: '../index/index',
      })
    },
    toOrderPage(){
      wx.redirectTo({
        url: '../order/index',
      })
    },
    toTypePage(){
      wx.redirectTo({
        url: '../type/index',
      })
    },
    toDishPage(){
      wx.redirectTo({
        url: '../dish/index',
      })
    },
    toSetPage(){
      wx.redirectTo({
        url: '../set/index',
      })
    },
    toUserPage(){
      wx.redirectTo({
        url: '../user/index',
      })
    },
    toCompanyPage(){
      wx.redirectTo({
        url: '../company/index',
      })
    },
    toOtherPage(){
      wx.redirectTo({
        url: '../other/index',
      })
    },
  }
})
