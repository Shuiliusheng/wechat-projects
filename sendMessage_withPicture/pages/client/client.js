var common_text = require("../../utiliz/client_getMessage.js")
var common_sendFile = require("../../utiliz/client_sendFile.js")
var common_recvFile = require("../../utiliz/client_recvFile.js")


const app = getApp()
var udp;
var port;
var username = "user2"
var server_ip = "192.168.1.102";
var server_port = 45466;
var inputValue = "";

///changed

var imageInfo = {};
var filenumber = 0;

const fileManage = wx.getFileSystemManager();
var ask_delay = 100;


Page({
  data: {
    filename: "",
    recvPer: 0,
    isChosed: false,
    str: "",
    left: "<<",
    messages: [],
    isOpen: false,
    username: username,
    inputValue: "",
  },

  showImageDetail: function (e) {
    wx.navigateTo({
      url: '../showImage/showImage?url=' + e.target.dataset.url,
    })
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
      message: common_text.procMessage("text", username, inputValue)
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
    common_text.clearMessages();
  },
  lastMessages: function () {
    this.setData({
      messages: common_text.lastMessages().reverse()
    });
  },
  nextMessages: function () {
    this.setData({
      messages: common_text.nextMessages().reverse()
    });
  },
  newMessages: function () {
    this.setData({
      messages: common_text.getNewMessages().reverse()
    });
  },

  //changed1

  //将接收的数据写入文件
  writeImage: function (dstfilename, info) {
    var that = this;
    let filedata = common_recvFile.getFileData(info.filename, info.username);

    fileManage.writeFile({
      filePath: wx.env.USER_DATA_PATH + "/" + dstfilename,
      // filePath:   "/images/" + dstfilename,
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


  //接收消息
  recvMessage: function (res) {

    let unit8Arr = new Uint8Array(res.message.data);
    let port = res.remoteInfo.port;
    let ip = res.remoteInfo.address;

    let back = common_recvFile.getMessage(unit8Arr, ip, port);

    let ret = {};

    //接收方的消息
    if (back.type == "text") {

      ret = common_text.addMessage(unit8Arr, "text", {});
      if (ret.isBottom) {
        this.setData({
          messages: common_text.getNewMessages().reverse()
        });
      }
    }
    //接收文件发送的数据
    else if (back.type == "fileinfo") //收到了文件
    {
      console.log("recv file info: ", back.info.username, back.info.src_ip, back.info.src_port)
      let m = {};
      m.filename = back.info.filename;
      m.username = back.info.username;
      m.place = 0;
      m.ip = back.info.src_ip;
      m.port = back.info.src_port;

      ret = common_text.addMessage(unit8Arr, "image", back.info);
      common_recvFile.setMessageID(back.info.username, back.info.filename, ret.id);

      let id = setInterval(this.requireFileData, ask_delay, m);
      common_recvFile.setIntervalID(back.info.username, back.info.filename, id);

      if (ret.isBottom) {
        this.setData({
          messages: common_text.getNewMessages()
        });
      }
    }
    else if (back.type == "filedata") { //接收到文件数据

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

        common_recvFile.clearRecvFileData(back.info);
      }
      else {

      }

    }



    //请求文件发送------------------------------------------
    else if (back.type == "askedfiledata") {
      //发送指定的文件数据
      // console.log("askedfiledata: ", back.info.username);
      this.sendImageData(back.info.filename, back.info.place, back.info.src_ip, back.info.src_port);
    }
    else if (back.type == "fileCompleteAck") {
      // console.log("fileCompleteAck: ", back.info.username);
      console.log("send file successfully: ", back.info.filename, back.info.ip, back.info.port);
      common_sendFile.clearFileData(back.info);
      // this.setData({
      //   filename: "",
      //   isChosed: false
      // });
    }
    else {
      console.log("recv Mess type is wrong: ", back.type)
    }

  },



  ///changed
  chooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original'], //   
      sourceType: ['album'], //   
      success: function (res) {
        imageInfo.path = res.tempFilePaths[0];
        imageInfo.size = res.tempFiles[0].size;
        let index = res.tempFilePaths[0].lastIndexOf(".");
        imageInfo.type = imageInfo.path.substr(index + 1);
        that.setData({ isChosed: true });
      }
    });
  },

  sendFile: function () {
    var that = this;
    fileManage.access({
      path: imageInfo.path,
      success: function () {
        //发送图像信息和数据
        let filename = username + "_pic_" + filenumber + "." + imageInfo.type;
        that.sendImage(filename, server_ip, server_port);
        filenumber++;

        that.setData({
          isChosed: false
        });
      },
      fail: function (res) {
        console.log("get Image Failed");
      }
    })
  },

  //发送图像信息
  sendImageData: function (filename, place, ip, port) {
    if (place == -1) {
      let data = common_sendFile.procImageInfo(filename, ip, port);
      udp.send({
        address: ip,
        port: port,
        message: data
      })
      this.setData({
        filename: filename,
        recvPer: 0
      });
      console.log("send file: ", filename, ip, port);
    }
    else {
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

      this.setData({
        recvPer: message.percent
      });
    }
  },

  //读取图像数据
  sendImage: function (filename, ip, port) {
    var that = this;
    fileManage.readFile({
      filePath: imageInfo.path,
      fail: function (res) {
        console.log("read file failed")
      },
      success: function (res) {
        var dataArr = new Uint8Array(res.data);

        //username
        common_sendFile.addSendFileList(username, filename, imageInfo.size, ip, port, dataArr);

        that.sendImageData(filename, -1, ip, port);
        // console.log("readImg successfully")
      }
    });
  },

  onLoad: function () {


  }

})
