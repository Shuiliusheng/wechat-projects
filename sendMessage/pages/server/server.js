// pages/server/server.js
var common = require("../../utiliz/common_server.js")
var udp;
var port;
var startRecvFlag = false;
var local_ip = "127.0.0.1";
var broadcast = false;

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
      messages: common.getNewMessages(),
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
        message: common.procMessage(1, "localhost", "Localhost Test: send to self successfully!")
      })
    }
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
    let encodedString = String.fromCharCode.apply(null, unit8Arr);
    m.message = decodeURIComponent(escape((encodedString)));

    let port = res.remoteInfo.port;
    let ip = res.remoteInfo.address;

    var ret = common.addMessage(m, ip, port);
    if (ret.isBottom) {
      that.setData({
        messages: common.getNewMessages()
      });
    }

    //如果需要广播
    if (isbroadcast)
      this.forwardMessage(ret.message, common.usersInfo)

    // that.sendAck();
  },
  //广播消息
  forwardMessage: function (m, users) {
    var data = common.procFordMessage(m);
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
    let info = common.getUserInfo(e.currentTarget.dataset.id);
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
    common.clearMessages();
  },
  //上一组消息
  lastMessages: function () {
    this.setData({
      messages: common.lastMessages()
    })
  },
  //下一组消息
  nextMessages: function () {
    this.setData({
      messages: common.nextMessages()
    })
  },
  //最新消息
  newMessages: function () {
    this.setData({
      messages: common.getNewMessages()
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