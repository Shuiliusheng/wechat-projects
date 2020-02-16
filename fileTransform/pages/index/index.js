// pages/index/index.js

var common = require('../../utiliz/common.js')
var udp;
var ip="127.0.0.1";
var port="56455";
const fileManage = wx.getFileSystemManager();
var step = 1024*50; //byte size every time send 

var filenumber = 0;
var imageInfo={};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpen: false,
    info:"none",
    info1: "none",
    chooseOver: false,
    image: "/images/icon1.png"
  },
  saveShowedImage: function(){

    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('授权成功')
            }
          })
        }
      }
    });

    wx.saveImageToPhotosAlbum({
      filePath: that.data.image,
      success: (res) => {
        console.log(res);
        that.setData({
          info1: that.data.image+"is saved successfuly!" 
        })
      },
      fail(res) {
        console.log(res)
      }
    });

  },

  writeImage : function(filename,srcfilename){
    var that = this;
    var filedata = common.getFileData(srcfilename);
    // console.log(filedata.byteLength);
    fileManage.writeFile({
      filePath: wx.env.USER_DATA_PATH + "/" + filename,
      data:filedata.buffer,
      success: function(){
        that.setData({ image: wx.env.USER_DATA_PATH + "/" + filename });      
      },
      fail: function(res){
        console.log(res.errMsg);
      }
    })
  },

  recvMessages: function(res){
    let unit8Arr = new Uint8Array(res.message.data);

    let info = common.getMessage(unit8Arr);
    if (info.m == "FileComplete")
      this.writeImage("recv_"+info.filename,info.filename);
    this.setData({
      info: info.m+" : "+info.filename
    })
  },

  openUDP:function(){
    udp = wx.createUDPSocket();
    port = udp.bind();
    udp.onMessage(this.recvMessages);
    this.setData({ isOpen: true });
  },

  closeUDP: function()
  {
    udp.close();
    this.setData({ isOpen: false });
  },

  chooseImage(){
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original'], //   
      sourceType: ['album'], //   
      success: function (res) {
        imageInfo.path = res.tempFilePaths[0];
        imageInfo.size = res.tempFiles[0].size;
        that.setData({ info: res.tempFilePaths + "\nsize: "+imageInfo.size, chooseOver: true })
      }
    });
  },

  sendImageInfo: function(username, filename){
    let data = common.procImageInfo(username, filename, imageInfo.size);
    udp.send({
      address: ip,
      port: port,
      message: data
    })
  },

  readImageData: function (username, filename)
  {
    var that = this;
    fileManage.readFile({
      filePath: imageInfo.path,
      fail: function (res) {
        that.setData({
          info: that.data.info + "\n" + res.errMsg
        })
      },
      success: function (res) {
        that.sendImageData(res.data, username, filename)
      }
    });
  },

  sendImageData: function(data, username,filename){

    var dataArr = new Uint8Array(data);
    var p = 0;
    for(p = 0; p < imageInfo.size; p += step)
    {
      let size = step;
      if (p + step >= imageInfo.size)
        size = imageInfo.size - p;

      let sdata = dataArr.slice(p,p+size);
      let message = common.procImageData(username,filename,size,p,sdata);
      udp.send({
        address: ip,
        port: port,
        message: message.buffer,
        length: message.byteLength
      });
      this.setData({
        info1: "send: " + p + "/" + imageInfo.size
      })
    }

  },

  sendFile: function(){
    this.setData({
      chooseOver:false
    });

    var that = this;
    fileManage.access({
      path: imageInfo.path,
      success: function(){

        that.sendImageInfo("user1", "pic" + filenumber + ".jpg");
        that.readImageData("user1", "pic" + filenumber + ".jpg");
        filenumber++;

        that.setData({
          info: that.data.info + "\n" + "Access Succcessfully"
        })

      },
      fail: function(res){
        that.setData({
          info: that.data.info+"\n"+res.errMsg
        })
      } 
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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