
var sep="#*#";

var recvFileList = [];

function getFileData(filename)
{
  var data;
  for (var i = 0; i < recvFileList.length; i++)
  {
    if (recvFileList[i].filename == filename )
    {
      data = recvFileList[i].data;
      break;
    }  
  }
  
  data.sort(function (a, b) { return a.label - b.label })
  let filedata = data[0].unit8Arr;

  for(var i=1;i<data.length;i++)
  {
    filedata = connectArr(filedata,data[i].unit8Arr);
  }
  return filedata;
}

function getImageInfo(message)
{
  let datas = message.split(sep);
  var temp = {};
  temp.username = datas[1];
  temp.filename = datas[2];
  temp.size = datas[3];
  temp.recvSize = 0;
  temp.data = [];
  recvFileList.push(temp);
}

function getImageData(datas, unit8Arr) 
{
  let username = datas[1];
  let filename = datas[2];
  let size = Number(datas[3]);
  let data = {};
  data.label = Number(datas[4]);
  let length = datas[0].length + datas[1].length + datas[2].length + datas[3].length + datas[4].length + sep.length*5;

  data.unit8Arr = unit8Arr.slice(length, unit8Arr.byteLength);
  
  console.log("data: ", size, data.label)
  for (var i = 0; i < recvFileList.length; i++)
  {
    if (filename == recvFileList[i].filename && username == recvFileList[i].username)
    {
      recvFileList[i].data.push(data);
      recvFileList[i].recvSize += size;
      var info={}
      if (recvFileList[i].recvSize == recvFileList[i].size)
        info.m = "FileComplete";
      else
        info.m = "recv: "+recvFileList[i].recvSize + "/" + recvFileList[i].size;
      info.filename = filename;
      return info
    }
  }
  return {}
}

function getMessage(unit8Arr)
{
  let message = String.fromCharCode.apply(null, unit8Arr);
  let datas = message.split(sep);
  let type = datas[0];
  if(type == "filesize")
  {
    console.log(message)

    getImageInfo(message);
    return message;
  }
  else if(type == "filedata")
  {
    console.log("filedata: ",unit8Arr.byteLength)
    return getImageData(datas, unit8Arr);
  }
  else{
    return message;
  }
}

function str2Uint8Arr(str)
{
  var arr = new Uint8Array(str.length);
  for(var i =0;i<str.length;i++)
  {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function procImageInfo(username, filename, size)
{
  var str="";
  str = str + "filesize" + sep;
  str = str + username + sep;
  str = str + filename + sep;
  str = str + size;
  return str;
}

function procImageData(username, filename, size, label,data)
{
  var str = "";
  str = str + "filedata" + sep;
  str = str + username + sep;
  str = str + filename + sep;
  str = str + size + sep;
  str = str + label + sep;
  let arr = str2Uint8Arr(str);
  let arr1 = connectArr(arr,data);
  return arr1;
}


function connectArr(arr1,arr2)
{
  var arr = new Uint8Array(arr1.byteLength + arr2.byteLength);
  let n=0;
  for(var i=0;i< arr1.byteLength;i++)
  {
    arr[n]=arr1[i];
    n++;
  }
  for (var i = 0; i < arr2.byteLength; i++) {
    arr[n] = arr2[i];
    n++;
  }

  return arr;
}
module.exports= {
  procImageData: procImageData,
  procImageInfo: procImageInfo,
  getMessage: getMessage,
  connectArr: connectArr,
  getFileData: getFileData
}