
//分隔符
var sep = "#*#";
const step = 1024 * 50; //byte size every time send 

//字符串到Uint8Array
function str2Uint8Arr(str) {
  var arr = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

//合并两个Uint8Array
function connectArr(arr1, arr2) {
  var arr = new Uint8Array(arr1.byteLength + arr2.byteLength);
  let n = 0;
  for (var i = 0; i < arr1.byteLength; i++) {
    arr[n] = arr1[i];
    n++;
  }
  for (var i = 0; i < arr2.byteLength; i++) {
    arr[n] = arr2[i];
    n++;
  }

  return arr;
}


module.exports = {
  sep: sep,
  str2Uint8Arr: str2Uint8Arr,
  connectArr: connectArr,
  step: step
}