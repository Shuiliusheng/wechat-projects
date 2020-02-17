// pages/index/index.js

var common_recv = require('../../utiliz/recvFile.js')
var common_send = require('../../utiliz/sendFile.js')


var udp;
var ip="127.0.0.1";
var port="56455";
const fileManage = wx.getFileSystemManager();

var filenumber = 0;
var imageInfo={};

var ask_delay = 1000;


var send_user = "sendUser";
var recv_user = "recvUser"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpen: false,
    info:"none",
    info1: "none",
    info2: "none",
    info3: "none",
    info4: "none",
    chooseOver: false,
    image: "/images/icon1.png",
    recvPer: 0
  },

  openUDP: function () {
    udp = wx.createUDPSocket();
    port = udp.bind();
    udp.onMessage(this.recvMessages);
    this.setData({ isOpen: true });
  },

  closeUDP: function () {
    udp.close();
    this.setData({ isOpen: false });
  },

/* ***************** 接收信息的处理 ******************/
  //保存图像
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

  //将接收的数据写入文件
  writeImage: function (dstfilename, srcfilename, username){
    var that = this;
    var filedata = common_recv.getFileData(srcfilename, username);

    fileManage.writeFile({
      filePath: wx.env.USER_DATA_PATH + "/" + dstfilename,
      data:filedata.buffer,

      success: function(){
        that.setData({ image: wx.env.USER_DATA_PATH + "/" + dstfilename });      
      },

      fail: function(res){
        console.log(res.errMsg);
      }
    })
  },
  //发送文件接收完成Ack
  sendFileCompAck: function(m){
    let data = common_send.procFileCompAck(recv_user, m.filename);
    udp.send({
      address: m.ip,
      port: m.port,
      message: data
    })
  },

  //请求文件数据
  requireFileData: function (m) {
    let data = common_send.procAskInfo(recv_user, m.filename, m.place);
    // console.log("requireFiledata: ",data);
    udp.send({
      address: m.ip,
      port: m.port,
      message: data
    })
  },

  //接收到消息的回调函数
  recvMessages: function(res){
    let unit8Arr = new Uint8Array(res.message.data);

    let back = common_recv.getMessage(unit8Arr, res.remoteInfo.address, res.remoteInfo.port);

    //接收方的消息
    if (back.type == "fileinfo")
    {
      console.log("recv fileinfo: ", back.info.username)
      let m = {};
      m.filename = back.info.filename;
      m.username = back.info.username;
      m.place = 0;
      m.ip = back.info.src_ip;
      m.port = back.info.src_port;

      let id = setInterval(this.requireFileData, ask_delay, m);
      common_recv.setIntervalID(back.info.username, back.info.filename,id);
      
      this.setData({
        info1: "getID: "+id+"  ask for  " + 0
      });
    }
    else if (back.type == "filedata")
    {
      console.log("recv filedata: ", back.info.username, back.info.type)
      //文件接收尚未请求结束，请求下一个
      if(back.info.type == "askNext")
      {
        //发送请求更改
        //关闭上一个
        let id = common_recv.clearIntervalID(back.info.username, back.info.filename);
        this.setData({
          info3: "clearID: " + id
        });

        //打开下一个
        id = setInterval(this.requireFileData, ask_delay, back.info);
        common_recv.setIntervalID(back.info.username, back.info.filename, id);
        this.setData({
          info1: "getID: " + id + "  ask for  " + back.place,
          recvPer: back.info.percent
        });
      }
      //文件接收完成
      else if (back.info.type == "fileComplete")//文件收到完成
      {
        let id = common_recv.clearIntervalID(back.info.username, back.info.filename);
        this.setData({
          info3: "clearID: " + id
        });

        this.writeImage("recv_" + back.info.filename, back.info.filename, back.info.username);
        common_recv.clearRecvFileData(back.info);

        //发送文件接收完成的ack
        this.sendFileCompAck(back.info);

        this.setData({
          info: "fileComplete",
          recvPer: 100
        });
      }
      else{

      }
    }

    //发送方接收到的消息------------------------------------------
    else if (back.type == "askedfiledata")
    {
      //发送指定的文件数据
      console.log("askedfiledata: ", back.info.username);
      this.sendImageData(back.info.filename, back.info.place, back.info.src_ip, back.info.src_port);
    }
    else if (back.type == "fileCompleteAck")
    {
      console.log("fileCompleteAck: ", back.info.username);
      common_send.clearFileData(back.info);
      this.setData({
        info: "recv file complete ack messages"
      });
    }
    else
    {
      this.setData({
        info: "other message"
      })
    }
  },



/* ***************** 发送信息的处理 ******************/
  //选择要发送的图像
  chooseImage(){
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original'], //   
      sourceType: ['album'], //   
      success: function (res) {
        imageInfo.path = res.tempFilePaths[0];
        imageInfo.size = res.tempFiles[0].size;
        that.setData({ 
          // info: res.tempFilePaths + "\nsize: "+imageInfo.size, 
          chooseOver: true 
        });
      }
    });
  },

  //发送图像信息
  sendImageData: function(filename, place, ip, port){
    if(place == -1)
    {
      let data = common_send.procImageInfo(filename, ip, port);
      udp.send({
        address: ip,
        port: port,
        message: data
      })
    }
    else
    {
      let message = common_send.getImageData(filename, ip, port, place);
      if(message == "")
      {
        this.setData({
          info1: "getImageData failed: "+filename+" "+place
        });
        return;
      }

      udp.send({
        address: message.ip,
        port: message.port,
        message: message.dataArr.buffer,
        length: message.dataArr.byteLength
      });

      this.setData({
        info2: "send "+filename+": " + place +" "+ message.dataArr.byteLength
      });

    }
  },

  //读取图像数据
  sendImage: function (filename, ip, port)
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
        var dataArr = new Uint8Array(res.data);
        common_send.addSendFileList(send_user, filename, imageInfo.size, ip, port, dataArr);
        that.sendImageData(filename, -1, ip, port);
        // console.log("readImg successfully")
      }
    });
  },

  //点击发送文件的处理
  sendFile: function(){
    this.setData({
      chooseOver:false
    });

    var that = this;
    fileManage.access({
      path: imageInfo.path,
      success: function(){

        //发送图像信息和数据
        that.sendImage("pic" + filenumber + ".jpg", ip, port);

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