var sep = "#*#";
var messages = [];
var showNumber = 10;
var bottomPlace = showNumber;


function procMessage(type, username, data) {
  var str = "";
  str = str + type + sep + username + sep + data;
  return str;
}


//将收到的消息加入队列
function addMessage(unit8Arr, type, info) {
  if (type == "text") {
    let encodedString = String.fromCharCode.apply(null, unit8Arr);
    var message = decodeURIComponent(escape((encodedString)));
    var datas = message.split(sep);
    let m = {};
    m.username = datas[1];
    m.date = datas[2];
    m.message = datas[3];
    m.type = 1;
    messages.push(m);
  }
  else if (type == "image") {
    let m = {};
    m.username = info.username
    m.filename = info.filename;
    m.date = info.date;
    m.message = "Recv " + info.filename + "(0%)";
    m.size = info.size;
    m.percent = 0;
    m.type = 2;//image
    m.url = "";
    messages.push(m);
  }
  let back = {};
  back.isBottom = (bottomPlace >= messages.length - 1);
  back.id = messages.length - 1;
  return back;
}

//更新图像消息的内容
function updateImageMessage(info) {
  messages[info.id].percent = info.percent;
  if (info.percent == 100)
    messages[info.id].message = info.message;
  else
    messages[info.id].message = "Recv " + messages[info.id].filename + " (" + messages[info.id].percent + "%)";

  bottomPlace += showNumber;
  return lastMessages();
}

function getMessages() {
  return messages;
}

//获取指定范围的消息列表
function chooseMessages(start, end) {
  var temp = [];
  for (var i = start; i < end; i++) {
    temp.push(messages[i]);
  }
  return temp;
}

//获取当前最新的用于显示的消息列表
function getNewMessages() {
  var end = messages.length;
  var start = end - showNumber;
  if (start < 0)
    start = 0;

  end = start + showNumber;
  if (end > messages.length)
    end = messages.length;

  bottomPlace = end;
  return chooseMessages(start, end);
}

//获取前x个消息的列表
function lastMessages() {
  var end = bottomPlace - showNumber;
  var start = end - showNumber;
  if (start < 0)
    start = 0;

  end = start + showNumber;
  if (end > messages.length)
    end = messages.length;

  bottomPlace = end;
  return chooseMessages(start, end);
}

//获取后x个消息的列表
function nextMessages() {
  var end = bottomPlace + showNumber;
  var start = 0;
  if (end > messages.length)
    end = messages.length;

  start = end - showNumber;
  if (start < 0)
    start = 0;

  bottomPlace = end;
  return chooseMessages(start, end);
}

//清除消息
function clearMessages() {
  bottomPlace = showNumber;
  messages = [];
}



module.exports = {
  procMessage: procMessage,
  addMessage: addMessage,
  getMessages: getMessages,
  lastMessages: lastMessages,
  nextMessages: nextMessages,
  getNewMessages: getNewMessages,
  clearMessages: clearMessages,
  updateImageMessage: updateImageMessage
}