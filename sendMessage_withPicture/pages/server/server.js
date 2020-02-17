// pages/index/index.js
var common_text = require("../../utiliz/server_getMessage.js")
var common_recvFile = require("../../utiliz/server_recvFile.js");
var common_sendFile = require("../../utiliz/server_sendFile.js")


var udp;
var port;
var startRecvFlag = false;
var local_ip = "127.0.0.1";
var broadcast = false;

var username = "server1"
const fileManage = wx.getFileSystemManager();
var ask_delay = 100;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    notRecv: true,
    isOpen: false,
    info: "none",
    messages: [],
    broadcast: false
  },

  showImageDetail: function (e) {
    wx.navigateTo({
      url: '../showImage/showImage?url=' + e.target.dataset.url,
    })
  },

  //输入信息
  inputIP: function (e) {
    // console.log(e.detail.value);
    local_ip = e.detail.value;
  },

  //打开UDP
  open_udp: function () {
    udp = wx.createUDPSocket()
    port = udp.bind(45466);
    wx.showToast({
      title: '端口号:' + port,
      icon: 'success',
      duration: 2000
    })

    this.setData({
      isOpen: true,
      broadcast: false,
      messages: common_text.getNewMessages(),
      info: "Local: " + local_ip + ":" + port
    });
  },

  //关闭UDP
  close_udp: function () {
    this.setData({
      isOpen: false,
      notRecv: true,
      broadcast: false
    })
    udp.close();
    startRecvFlag = false;

  },

  //打开监听
  openBroadcast: function () {
    this.setData({ broadcast: true });
  },
  closeBroadcast: function () {
    this.setData({ broadcast: false });
  },
  //打开接受消息
  recvMessage: function () {
    this.setData({
      notRecv: false
    });

    if (!startRecvFlag) {
      //receive messages
      udp.onMessage(this.recvCallback);
      startRecvFlag = true;

      udp.send({
        address: local_ip,
        port: port,
        message: common_text.procMessage("text", "localhost", "Localhost Test: send to self successfully!")
      })
    }
  },
  /*********************send file************************ */
  //发送图像信息
  sendImageData: function (filename, place, ip, port) {
    if (place == -1) {//发送文件信息
      let data = common_sendFile.procImageInfo(filename, ip, port);
      udp.send({
        address: ip,
        port: port,
        message: data
      });
      console.log("send file: ", filename, ip, port);

    }
    else {//发送请求数据
      let message = common_sendFile.getImageData(filename, ip, port, place);
      if (message == "") {
        console.log("getImageData failed")
        return;
      }

      udp.send({
        address: message.ip,
        port: message.port,
        message: message.dataArr.buffer,
        length: message.dataArr.byteLength
      });

      // console.log("send " + filename + " to " + ip + ":" + port, message.percent)
    }
  },


  /******************************************** */

  //广播文件
  forwardImage: function (imageInfo, users) {
    var that = this;
    let date = common_text.getMessageDate(imageInfo.id);

    let filedata = common_recvFile.getFileData(imageInfo.filename, imageInfo.username);

    for (var i = 0; i < users.length; i++) {
      if (users[i].username == "localhost")
        continue;

      common_sendFile.addSendFileList(imageInfo.username, imageInfo.filename, filedata.byteLength, users[i].ip, users[i].port, filedata, date);

      this.sendImageData(imageInfo.filename, -1, users[i].ip, users[i].port);
    }
  },

  //将接收的数据写入文件
  writeImage: function (dstfilename, info) {
    var that = this;
    let filedata = common_recvFile.getFileData(info.filename, info.username);

    fileManage.writeFile({
      filePath: wx.env.USER_DATA_PATH + "/" + dstfilename,
      data: filedata.buffer,

      success: function () {
        info.message = wx.env.USER_DATA_PATH + "/" + dstfilename;
        that.setData({
          messages: common_text.updateImageMessage(info)
        });
      },

      fail: function (res) {
        console.log(res.errMsg);
      }
    })
  },

  //发送文件接收完成Ack
  sendFileCompAck: function (m) {
    let data = common_sendFile.procFileCompAck(username, m.filename);
    udp.send({
      address: m.ip,
      port: m.port,
      message: data
    })
  },

  //请求文件数据
  requireFileData: function (m) {
    let data = common_sendFile.procAskInfo(username, m.filename, m.place);
    udp.send({
      address: m.ip,
      port: m.port,
      message: data
    })
  },

  //接收消息的处理函数
  recvCallback: function (res) {

    let showFlag = this.data.notRecv;
    let isbroadcast = this.data.broadcast;

    if (showFlag)
      return;

    var m = {};
    var that = this;
    let unit8Arr = new Uint8Array(res.message.data);

    let port = res.remoteInfo.port;
    let ip = res.remoteInfo.address;

    let back = common_recvFile.getMessage(unit8Arr, ip, port, isbroadcast);

    let ret = {};

    //console.log("message:",back.type);
    //接收方的消息
    if (back.type == "text") {
      ret = common_text.addMessage(unit8Arr, ip, port, "text", {});
      if (ret.isBottom) {
        that.setData({
          messages: common_text.getNewMessages()
        });
      }
      //如果需要广播
      if (isbroadcast)
        this.forwardMessage(ret.message, common_text.usersInfo)
    }
    else if (back.type == "fileinfo") //收到了文件
    {
      console.log("recv file info: ", back.info.username, back.info.src_ip, back.info.src_port)
      let m = {};
      m.filename = back.info.filename;
      m.username = back.info.username;
      m.place = 0;
      m.ip = back.info.src_ip;
      m.port = back.info.src_port;

      ret = common_text.addMessage(unit8Arr, ip, port, "image", back.info);

      common_recvFile.setMessageID(back.info.username, back.info.filename, ret.id);

      let id = setInterval(this.requireFileData, ask_delay, m);
      common_recvFile.setIntervalID(back.info.username, back.info.filename, id);

      if (ret.isBottom) {
        that.setData({
          messages: common_text.getNewMessages()
        });
      }

    }
    else if (back.type == "filedata") {

      // console.log("recv filedata: ", back.info.username, back.info.type)
      //文件接收尚未请求结束，请求下一个
      if (back.info.type == "askNext") {
        //发送请求更改
        //关闭上一个
        let id = common_recvFile.clearIntervalID(back.info.username, back.info.filename);

        //打开下一个
        id = setInterval(this.requireFileData, ask_delay, back.info);
        common_recvFile.setIntervalID(back.info.username, back.info.filename, id);

        this.setData({
          messages: common_text.updateImageMessage(back.info)
        });
      }
      //文件接收完成
      else if (back.info.type == "fileComplete")//文件收到完成
      {
        console.log("recv file info successfully: ", back.info.username, back.info.ip, back.info.port)

        let id = common_recvFile.clearIntervalID(back.info.username, back.info.filename);
        //发送文件接收完成的ack
        this.sendFileCompAck(back.info);

        //保存文件
        this.writeImage("recv_" + back.info.filename, back.info);

        if (back.info.needBroadcast)
          this.forwardImage(back.info, common_text.usersInfo);

        common_recvFile.clearRecvFileData(back.info);
      }
      else {

      }

    }

    /***************请求文件的消息*************** */
    else if (back.type == "askedfiledata") {
      //发送指定的文件数据
      // console.log("askedfiledata: ", back.info.username, back.info.filename);
      this.sendImageData(back.info.filename, back.info.place, back.info.src_ip, back.info.src_port);
    }
    else if (back.type == "fileCompleteAck") {
      console.log("send file successfully: ", back.info.filename, back.info.ip, back.info.port);
      common_sendFile.clearFileData(back.info);
    }
    else {
      console.log("recv Mess type is wrong: ", back.type)
    }

    // that.sendAck();
  },


  //广播消息
  forwardMessage: function (m, users) {
    var data = common_text.procFordMessage(m);
    for (var i = 0; i < users.length; i++) {
      if (users[i].username == "localhost")
        continue;
      udp.send({
        address: users[i].ip,
        port: users[i].port,
        message: data
      });
    }
  },





  //确认收到
  sendAck: function (ip, port) {
    udp.send({
      address: ip,
      port: port,
      message: 'receive successfully'
    })
  },

  //停止接受消息
  closeRecv: function () {
    this.setData({
      notRecv: true
    })
  },

  //点击client text的信息显示
  showUserDetail: function (e) {
    let info = common_text.getUserInfo(e.currentTarget.dataset.id);
    this.setData({
      info: info.username + ": " + info.ip + ":" + info.port
    })
  },
  //点击text后的信息恢复
  recovrInfo: function (e) {
    this.setData({
      info: "Local: " + local_ip + ":" + port
    })
  },

  //清楚消息
  clearMessages: function () {
    this.setData({
      messages: []
    });
    common_text.clearMessages();
  },
  //上一组消息
  lastMessages: function () {
    this.setData({
      messages: common_text.lastMessages()
    })
  },
  //下一组消息
  nextMessages: function () {
    this.setData({
      messages: common_text.nextMessages()
    })
  },
  //最新消息
  newMessages: function () {
    this.setData({
      messages: common_text.getNewMessages()
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    startRecvFlag = false;
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