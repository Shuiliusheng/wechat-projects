var common = require("../../utiliz/common_client.js")

const app = getApp()
var udp;
var port;
var username = "user2"
var server_ip = "192.168.1.102";
var server_port = 45466;
var inputValue = "";
Page({
  data: {
    str: "",
    left: "<<",
    messages: [],
    isOpen: false,
    username: username,
    inputValue: "",
  },
  inputUsername: function (e) {
    username = e.detail.value;
  },
  inputIP: function (e) {
    server_ip = e.detail.value;
  },
  inputPort: function (e) {
    server_port = e.detail.value;
  },
  inputData: function (e) {
    inputValue = e.detail.value;
    this.setData({
      inputValue: inputValue
    })
  },
  inputOver: function () {
    this.sendMess();
  },
  //接收消息
  recvMessage: function (res) {
    let unit8Arr = new Uint8Array(res.message.data);
    let encodedString = String.fromCharCode.apply(null, unit8Arr);
    var data = decodeURIComponent(escape((encodedString)));
    if (common.addMessage(data, username)) {
      this.setData({
        messages: common.getNewMessages().reverse()
      });
    }
  },

  //打开网络
  open_udp: function () {
    if (username == "" || server_ip == "" || server_port == "")
      return;
    udp = wx.createUDPSocket()
    port = udp.bind();
    udp.onMessage(this.recvMessage);
    this.setData({
      isOpen: true,
      username: username
    })
  },
  //关闭网络
  close_udp: function () {
    udp.close();
    this.setData({
      isOpen: false
    })
  },

  //发送消息
  sendMess: function () {
    if (inputValue == "") {
      wx.showToast({
        title: '输入不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    udp.send({
      address: server_ip,
      port: server_port,
      message: common.procMessage(1, username, inputValue)
    });
    inputValue = "";
    this.setData({
      inputValue: inputValue
    })
  },

  //删除消息
  clearMessages: function () {
    this.setData({
      messages: []
    });
    common.clearMessages();
  },
  lastMessages: function () {
    this.setData({
      messages: common.lastMessages().reverse()
    });
  },
  nextMessages: function () {
    this.setData({
      messages: common.nextMessages().reverse()
    });
  },
  newMessages: function () {
    this.setData({
      messages: common.getNewMessages().reverse()
    });
  },

  onLoad: function () {


  }

})
