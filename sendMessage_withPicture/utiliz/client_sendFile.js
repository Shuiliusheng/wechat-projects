var common = require("./common.js")

var sep = common.sep;
var sendFileList = [];

function addSendFileList(username, filename, size, ip, port, dataArr) {
  let file = {};
  file.src_user = username;
  file.filename = filename;
  file.size = size;
  file.dataArr = dataArr;
  file.dst_ip = ip;
  file.dst_port = port;
  sendFileList.push(file);
  // console.log("addSendFileList: ", file);
}

//根据文件名，ip，port查找fileList
function findFile(filename, dst_ip, dst_port) {
  for (var i = 0; i < sendFileList.length; i++) {
    if (sendFileList[i].filename == filename && sendFileList[i].dst_ip == dst_ip && sendFileList[i].dst_port == dst_port) {
      return sendFileList[i];
    }
  }
  return "";
}

//获取文件中指定的数据
function getImageData(filename, ip, port, place) {
  let file = findFile(filename, ip, port);
  //如果没有找到
  if (file == "")
    return "";

  let p = place * common.step;
  let size = common.step;
  if (p + size >= file.size)
    size = file.size - p;

  let dataArr = file.dataArr.slice(p, p + size);

  let m = {};
  m.dataArr = procImageData(file.src_user, file.filename, size, place, dataArr);
  m.ip = file.dst_ip;
  m.port = file.dst_port;
  m.percent = (100 * p / file.size).toFixed();
  return m;
}

//处理Image信息到字符串，用于发送
function procImageInfo(filename, ip, port) {
  let file = findFile(filename, ip, port);
  //如果没有找到
  if (file == "") {
    console.log(filename, ip, port, " is not found")
    console.log(sendFileList[0])
    return "";
  }

  var str = "";
  str = str + "fileinfo" + sep;
  str = str + file.src_user + sep;
  str = str + file.filename + sep;
  str = str + file.size;
  return str;
}

//处理Image数据到UintArray，用于发送
function procImageData(username, filename, size, place, data) {
  var str = "";
  str = str + "filedata" + sep;
  str = str + username + sep;
  str = str + filename + sep;
  str = str + size + sep;
  str = str + place + sep;
  let arr = common.str2Uint8Arr(str);
  let arr1 = common.connectArr(arr, data);
  return arr1;
}


function procAskInfo(username, filename, place) {
  var str = "";
  str = str + "askedfiledata" + sep;
  str = str + username + sep;
  str = str + filename + sep;
  str = str + place;
  return str;
}

function procFileCompAck(username, filename) {
  var str = "";
  str = str + "fileCompleteAck" + sep;
  str = str + username + sep;
  str = str + filename;
  return str;
}

function clearFileData(m) {
  for (var i = 0; i < sendFileList.length; i++) {
    if (sendFileList[i].filename == m.filename && sendFileList[i].dst_ip == m.ip && sendFileList[i].dst_port == m.port) {
      console.log("clearFiledata: ", m.filename, m.ip, m.port);
      sendFileList.splice(i, 1);
      return;
    }
  }
}

module.exports = {
  procImageData: procImageData,
  procImageInfo: procImageInfo,
  procAskInfo: procAskInfo,
  addSendFileList: addSendFileList,
  getImageData: getImageData,
  procFileCompAck: procFileCompAck,
  clearFileData: clearFileData
}