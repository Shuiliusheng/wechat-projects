var getTime = require("./getTime.js");
var usersInfo = [];
var showNumber = 20;
var bottomPlace = showNumber;

var recvMs = [];
var sep = "#*#";

//增加用户，返回用户的标签
function addUser(username, ip, port) {
  for (var i = 0; i < usersInfo.length; i++) {
    let temp = usersInfo[i];
    if (username == temp.username) {
      usersInfo[i].ip = ip;
      usersInfo[i].port = port;
      return i;
    }
  }
  var user = {};
  user.username = username;
  user.ip = ip;
  user.port = port;
  usersInfo.push(user);
  return usersInfo.length - 1;
}

//获取用户信息
function getUserInfo(label) {
  return usersInfo[label];
}

//增加新的消息进入队列
function addMessage(m, ip, port) {
  //增加ID
  m.id = recvMs.length;

  //增加日期
  m.date = getTime.formatTime(new Date());

  //处理消息中的数据
  var datas = m.message.split(sep);
  // console.log(datas);

  //消息的类型
  m.type = parseInt(datas[0]);

  //消息的实际数据
  m.message = datas[2];

  var username = datas[1];
  //addUser
  m.label = addUser(username, ip, port);

  //加入队列
  recvMs.push(m);

  var back = {};
  back.isBottom = (bottomPlace >= recvMs.length - 1);
  back.message = m;

  return back;
}

//获取指定范围的消息列表
function chooseMessages(start, end) {
  var temp = [];
  for (var i = start; i < end; i++) {
    temp.push(recvMs[i]);
  }
  return temp;
}

//获取当前最新的用于显示的消息列表
function getNewMessages() {
  var end = recvMs.length;
  var start = end - showNumber;
  if (start < 0)
    start = 0;

  end = start + showNumber;
  if (end > recvMs.length)
    end = recvMs.length;

  bottomPlace = end;
  return chooseMessages(start, end);
}

//获取前20个消息的列表
function lastMessages() {
  var end = bottomPlace - showNumber;
  var start = end - showNumber;
  if (start < 0)
    start = 0;

  end = start + showNumber;
  if (end > recvMs.length)
    end = recvMs.length;

  bottomPlace = end;
  return chooseMessages(start, end);
}

//获取后二十个消息的列表
function nextMessages() {
  var end = bottomPlace + showNumber;
  var start = 0;
  if (end > recvMs.length)
    end = recvMs.length;

  start = end - showNumber;
  if (start < 0)
    start = 0;

  bottomPlace = end;
  return chooseMessages(start, end);
}

//清除消息
function clearMessages() {
  bottomPlace = showNumber;
  recvMs = [];
}

//处理将要转发的消息
function procFordMessage(message) {
  var str = "";
  str = str + "2" + sep + usersInfo[message.label].username + sep;
  str = str + message.date + sep;
  str = str + message.message;
  return str;
}

function procMessage(type, username, data) {
  var str = "";
  str = str + type + sep + username + sep + data;
  return str;
}

module.exports = {
  getUserInfo: getUserInfo,
  addMessage: addMessage,
  lastMessages: lastMessages,
  nextMessages: nextMessages,
  getNewMessages: getNewMessages,
  clearMessages: clearMessages,
  usersInfo: usersInfo,
  procMessage: procMessage,
  procFordMessage: procFordMessage
}