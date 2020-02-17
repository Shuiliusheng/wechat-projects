var common = require("./common.js")

var sep = common.sep;
var recvFileList = [];
var intervalID = [];

//设置图像详细在消息队列中的位置
function setMessageID(username, filename, id) {
  for (var i = 0; i < recvFileList.length; i++) {
    if (recvFileList[i].filename == filename && recvFileList[i].username == username) {
      recvFileList[i].messageID = id;
      return;
    }
  }
}

function setIntervalID(username, filename, id) {
  for (var i = 0; i < intervalID.length; i++) {
    if (filename == intervalID[i].filename && username == intervalID[i].username) {
      intervalID[i].id = id;
      return;
    }
  }
  let temp = {};
  temp.filename = filename;
  temp.username = username;
  temp.id = id;
  intervalID.push(temp);
}

function clearIntervalID(username, filename) {
  for (var i = 0; i < intervalID.length; i++) {
    if (filename == intervalID[i].filename && username == intervalID[i].username) {
      clearInterval(intervalID[i].id);
      return intervalID[i].id;
    }
  }
  return -1;
}


//获取消息中的信息，进行下一步解析
function getMessage(unit8Arr, ip, port, isbroadcast) {
  let message = String.fromCharCode.apply(null, unit8Arr.slice(0, 20));
  let type = message.split(sep)[0];

  let back = {};
  back.type = type;
  back.info = "";

  if (type == "fileinfo") {
    // console.log("fileinfo: ", unit8Arr.byteLength);
    back.info = getImageInfo(unit8Arr, ip, port, isbroadcast);
    return back;
  }

  else if (type == "filedata") {  //收到接收到的文件消息
    // console.log("filedata unit8Arr length: ", unit8Arr.byteLength);

    back.info = getImageData(unit8Arr);
    return back;
  }

  else if (type == "askedfiledata") { //收到请求文件的消息
    // console.log("filedata: ", unit8Arr.byteLength)

    back.info = getRequireInfo(unit8Arr, ip, port);
    return back;
  }

  else if (type == "fileCompleteAck") {//收到文件接收完成的消息
    back.info = fileSendComplete(unit8Arr, ip, port);
    return back;
  }
  else {
    return back;
  }
}

//收到文件收到完成的确认信息处理
function fileSendComplete(unit8Arr, ip, port) {
  let message = String.fromCharCode.apply(null, unit8Arr);
  let datas = message.split(sep);

  let info = {};
  info.filename = datas[2];
  info.username = datas[1];
  info.ip = ip;
  info.port = port;
  return info;
}

//获取请求的消息内容
function getRequireInfo(unit8Arr, ip, port) {
  let message = String.fromCharCode.apply(null, unit8Arr);
  let datas = message.split(sep);

  let info = {};
  info.username = datas[1];
  info.filename = datas[2];
  info.place = Number(datas[3]);
  info.src_ip = ip;
  info.src_port = port;
  return info;

}

//根据文件名和用户名 获取文件信息
function getRecvFileInfo(filename, username) {
  for (var i = 0; i < recvFileList.length; i++) {
    if (filename == recvFileList[i].filename && username == recvFileList[i].username) {
      let file = recvFileList[i];
      return i;
    }
  }
  return -1;
}

//如果消息是图像信息，则处理
function getImageInfo(unit8Arr, ip, port, isbroadcast) {

  let message = String.fromCharCode.apply(null, unit8Arr);
  let datas = message.split(sep);

  var temp = {};
  temp.username = datas[1];
  temp.filename = datas[2];
  temp.size = datas[3];
  temp.recvSize = 0;
  temp.reqPlace = 0;
  temp.src_ip = ip;
  temp.src_port = port;
  temp.messageID = -1;
  temp.data = [];
  temp.needBroadcast = isbroadcast;
  recvFileList.push(temp);
  console.log("getImageInfo:", isbroadcast)
  return temp;
}


//如果消息是Image的数据，则处理
function getImageData(unit8Arr) {
  let message = String.fromCharCode.apply(null, unit8Arr.slice(0, 200));
  let datas = message.split(sep);
  let username = datas[1];
  let filename = datas[2];
  let size = Number(datas[3]);
  let headLength = datas[0].length + datas[1].length + datas[2].length + datas[3].length + datas[4].length + sep.length * 5;

  let place = Number(datas[4]);
  let n = getRecvFileInfo(filename, username);

  let back = {};
  back.type = "";
  if (n == -1 || place != recvFileList[n].reqPlace)//无用的消息
    return back;

  let data = {};
  data.place = place;
  data.unit8Arr = unit8Arr.slice(headLength, unit8Arr.byteLength);

  recvFileList[n].data.push(data);
  recvFileList[n].recvSize += size;
  recvFileList[n].reqPlace++;

  //如果收到的大小和文件大小一致，则文件接收完成
  if (recvFileList[n].recvSize == recvFileList[n].size) {
    back.type = "fileComplete";
    back.filename = recvFileList[n].filename;
    back.username = recvFileList[n].username;
    back.ip = recvFileList[n].src_ip;
    back.port = recvFileList[n].src_port;
    back.id = recvFileList[n].messageID;
    back.percent = 100;
    back.needBroadcast = recvFileList[n].needBroadcast;
    return back;
  }
  else {
    back.type = "askNext";
    back.filename = recvFileList[n].filename;
    back.username = recvFileList[n].username;
    back.place = recvFileList[n].reqPlace;
    back.ip = recvFileList[n].src_ip;
    back.port = recvFileList[n].src_port;
    back.percent = (recvFileList[n].recvSize / recvFileList[n].size) * 100;
    back.percent = back.percent.toFixed();
    back.id = recvFileList[n].messageID;
    return back;
  }
}


//获取Image的全部数据
function getFileData(filename, username) {
  var data;
  for (var i = 0; i < recvFileList.length; i++) {
    if (recvFileList[i].filename == filename && recvFileList[i].username == username) {
      data = recvFileList[i].data;
      break;
    }
  }
  data.sort(function (a, b) { return a.label - b.label })
  let filedata = data[0].unit8Arr;

  for (var i = 1; i < data.length; i++) {
    filedata = common.connectArr(filedata, data[i].unit8Arr);
  }
  return filedata;
}

//删除某个接收的文件数据
function clearRecvFileData(m) {
  for (var i = 0; i < recvFileList.length; i++) {
    if (recvFileList[i].filename == m.filename && recvFileList[i].src_ip == m.ip && recvFileList[i].src_port == m.port) {
      console.log("clearRecvFiledata: ", m.filename, m.ip, m.port);
      recvFileList.splice(i, 1);
      return;
    }
  }
}

module.exports = {
  //接收到消息的处理
  getMessage: getMessage,
  //获取收到文件的数据的处理
  getFileData: getFileData,
  //获取intervalID，并保存
  setIntervalID: setIntervalID,
  //清除intervalID，并关闭该interval
  clearIntervalID: clearIntervalID,
  //清楚接收到的文件数据
  clearRecvFileData: clearRecvFileData,

  setMessageID: setMessageID
}