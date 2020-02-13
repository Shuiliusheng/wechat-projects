var data = require("./data.js");

var pic_type = [];

function calPicType()
{
  let all = data.pictures;
  for (var i = 0; i < all.length; i++)
  {
    var exist=false;
    for( var j=0; j < pic_type.length; j++)
    {
      if(all[i].type == pic_type[j].type)
      {
        exist=true;
        break;
      }
    }
    if(!exist)
    {
      let temp = {};
      temp.id = all[i].id;
      temp.type = all[i].type;
      temp.url = all[i].url;
      pic_type.push(temp);
    }
  }
}

function getPicType()
{
  let picType=[];
  calPicType();
  for(var i=0; i<pic_type.length; i++)
  {
    let temp={};
    temp.id=pic_type[i].id;
    temp.type=pic_type[i].type;
    temp.url=pic_type[i].url;
    picType.push(temp);
  }
  return picType;
}

function getPicture(type)
{
  let pictures=[];
  let all=data.pictures;
  for(var i=0; i<all.length;i++)
  {
    if(all[i].type == type)
    {
      let temp={};
      temp.id = all[i].id;
      temp.type = all[i].type;
      temp.url = all[i].url;
      pictures.push(temp);
    }
  }
  return pictures;
}

function getPictureById(id)
{
  let all = data.pictures;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id == id) {
      let temp = {};
      temp.id = all[i].id;
      temp.type = all[i].type;
      temp.url = all[i].url;
      return temp;
    }
  }
}
module.exports = {
  getPicType:getPicType,
  getPicture:getPicture,
  getPictureById: getPictureById
}