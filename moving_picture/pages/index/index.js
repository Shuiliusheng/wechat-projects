
var common = require("../../utiliz/common.js")
var rains = common.rains;
var pics = common.pictures;
var ctx;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:true
  },
  
  startPlay: function(){
    this.timer=setInterval(this.drawImg,1000/33);
    this.setData({
      flag:false
    })
  },
  stopPlay: function(){
    clearInterval(this.timer);
    this.setData({
      flag:true
    })
  },
  drawImg: function(){
    
    for(var i=0;i<rains.length;i++)
    {
      let img = pics[rains[i].img];
      ctx.rotate(rains[i].angle * Math.PI / 180);

      let delta = rains[i].y/100 ;
      delta = delta * common.getFactor();
      // console.log(common.getFactor())  
      var w = img.width * rains[i].scale / 100 - delta;
      var h = img.height * rains[i].scale / 100 + delta;
      if(w<5)
        w=5;
      ctx.drawImage(img.url, rains[i].x / 2, rains[i].y / 2, w, h);
      
      ctx.rotate(-1*rains[i].angle * Math.PI / 180)
      common.updateRain(i, w);
    }
    ctx.draw(false)
  },
  rainMore: function(){
    common.addRains(5);
  },
  slowdown: function(){
    common.speedDown();
  },
  speedup: function(){
    common.speedUp();
  },


  onLoad: function (options) {
    common.addRains(1);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    ctx=wx.createCanvasContext("canvas1");
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