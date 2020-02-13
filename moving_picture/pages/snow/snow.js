
var snow = require("../../utiliz/snow.js")
var rains = snow.rains;
var pics = snow.pictures;
var ctx;
var spin=0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: true
  },

  startPlay: function () {
    this.timer = setInterval(this.drawImg, 1000 / 33);
    this.setData({
      flag: false
    })
  },
  stopPlay: function () {
    clearInterval(this.timer);
    this.setData({
      flag: true
    })
  },
  drawImg: function () {

    for (var i = 0; i < rains.length; i++) {
      let img = pics[rains[i].img];
      var w = img.width * rains[i].scale / 100;
      var center={};
      center.x = rains[i].x / 2 + w / 2;
      center.y = rains[i].y / 2 + w / 2;

      ctx.translate(center.x, center.y);
      ctx.rotate(rains[i].spin * Math.PI / 180);
      
      ctx.drawImage(img.url, -1 * w / 2, -1 * w / 2, w, w);
      
      ctx.rotate(-1*rains[i].spin * Math.PI / 180);
      ctx.translate(-1*center.x,-1*center.y);

      rains[i].spin = rains[i].spin + 2;
      if (rains[i].spin > 360)
        rains[i].spin = 0;

      snow.updateRain(i, w);
    }
    ctx.draw(false)
  },
  rainMore: function () {
    snow.addRains(5);
  },
  slowdown: function () {
    snow.speedDown();
  },
  speedup: function () {
    snow.speedUp();
  },


  onLoad: function (options) {
    snow.addRains(1);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    ctx = wx.createCanvasContext("canvas1");
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