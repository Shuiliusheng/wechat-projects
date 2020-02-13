// pages/show/show.js
var common = require("../../utiliz/common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pic: {},
    isCollect: false,
    showUrl:false
  },
  saveImg:function(){
    console.log("logtap in image");
    let that = this
    wx.getSetting({
      success(res) {
        //未授权 先授权 然后保存
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(re) {
              that.saveToBlum();
            }
          })
        } else {
          //已授 直接调用保存到相册方法
          that.saveToBlum();
        }
      }
    })
  },
  saveToBlum:function(){
    wx.downloadFile({
      url: this.data.pic.url,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(result) {
            wx.showToast({
              title: '已保存到相册',
              icon: 'success'
            })
          }
        })
      }
    })
  },
  collect:function(){
    let pic=this.data.pic;
    wx.setStorageSync(pic.id,pic);
    this.setData({
      isCollect:true
    })
  },
  discollect:function(){
    wx.removeStorageSync(this.data.pic.id)
    this.setData({
      isCollect:false
    })
  },
  showDetail:function(){
    this.setData({showUrl:true});
  },
  copyUrl:function(){
    wx.setClipboardData({
      data: this.data.pic.url,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '链接已复制到剪贴板'
            })
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    // let id=this.data.pic.id;
    let id=options.id;
    let pic=common.getPictureById(id);

    let collectsInfo=wx.getStorageInfoSync();
    let keys = collectsInfo.keys;
    let number = keys.length;

    this.setData({
      pic:pic,
      isCollect: false,
      showUrl: false
    })
    for( var i=0; i<number;i++)
    {
      if (id == keys[i] )
      {
        let pic=wx.getStorageSync(id);
        this.setData({
          isCollect: true
        })
        break;
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})