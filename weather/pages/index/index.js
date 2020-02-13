var times=0;
var forecastArray={};

Page({
  data: {
    forecastTime: 0,
    nowTime: 0,
    date:"",
    place: ["安徽省","蚌埠市","固镇县"],
    forecast:{},
    now:{
      tmp:0,
      vis:0,
      cond_code:"999",
      cond_txt:"No",
      wind_dir:"No",
      wind_sc:0,
      wind_spd:0,
      hum:0,
      pres:0
    }
  },
  changePlace: function(e) {
    this.setData({
      place: e.detail.value,
      nowTime: 1,
      forecastTime: 0
    });
    this.getWeather();
  },
  getWeather: function() {
    var temp=this; /* wx中不能够直接使用this变量 */
    var p1=this.data.place[1];
    var p2=this.data.place[2];
    p1=p1.substr(0,p1.length-1);
    p2=p2.substr(0,p2.length-1);
    var loc=p2+","+p1;
    times=0;
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/now?',
      data:{
        location: loc,
        key: "ff9765ed366d418ca91c4e59f2889e89",
      },
      success: function (result) { /*请求成功之后的处理函数，返回值在result中*/
        console.log(result.data);
        temp.setData({ 
          now: result.data.HeWeather6[0].now,
          date: result.data.HeWeather6[0].update.loc,
          nowTime: 1,
          forecastTime: 0
        })
      }
    })

    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/forecast?',
      data: {
        location: loc,
        key: "ff9765ed366d418ca91c4e59f2889e89",
      },
      success: function (result) { /*请求成功之后的处理函数，返回值在result中*/
        console.log(result.data);
        forecastArray=result.data.HeWeather6[0].daily_forecast;
      }
    })

  },
  nowDay: function() {
    this.getWeather();
  },
  lastDay: function() {
    if(times!=0)
      times--;
    this.setData({
      nowTime: 0,
      forecastTime: 1,
      forecast: forecastArray[times],
      now: forecastArray[times],
      date:forecastArray[times].date
    })
  },
  nextDay: function(){
    if(times!=2)
      times++;
    this.setData({
      nowTime: 0,
      forecastTime: 1,
      forecast: forecastArray[times],
      now: forecastArray[times],
      date: forecastArray[times].date
    }) 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      nowTime: 1,
      forecastTime: 0
    });
    this.getWeather();
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