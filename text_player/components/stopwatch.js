var speed=10;
var temp = 1;
var str = "𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀔𓀕𓀖𓀗𓀘𓀙𓀚𓀛𓀜𓀝𓀞𓀟𓀠𓀡𓀢𓀣𓀤𓀥𓀦𓀧𓀨𓀩𓀪𓀫𓀬𓀻𓀼𓀽𓀾𓀿𓁀𓁁𓁂𓁃𓁄𓁅𓁆𓁇𓁈";
Component({
  properties: { //父组件传给子组件的属性
    speed1:{
      type:Number,
      value:10
    }
  }, 
  options: {
    multipleSlots: true //for slots
  },
  data: {
    size: 32,
    text: '◙',
    now: 0,
    max: 100
  },
  methods: {
    start: function() {
      
      var times=1;
      var convertTimeStampToString1 = function(ts) {
        var ms = String(1000 + Math.floor(ts) % 1000).slice(1)
        var s = String(100 + Math.floor(ts / 1000) % 60).slice(1)
        var m = Math.floor(ts / 60000)
        if (m < 10) m = '0' + m
        return m + ':' + s + '.' + ms
      }
      var getSpeed = function(){
        return speed;
      }
      var setSpeed = function(s) {
        speed=s;
      }
      var toString1 = function (ts) {
        times++
        if (times >= speed) 
        {
          temp = (temp + 1)%10;
          times=0;
        }
        switch(temp)
        {
          case 0:return "_---------";
          case 1:return "-_--------";
          case 2:return "--_-------";
          case 3:return "---_------";
          case 4:return "----_-----";
          case 5:return "-----_----";
          case 6:return "------_---";
          case 7:return "-------_--";
          case 8:return "--------_-";
          default:return "---------_";
        }
      }

      var toString2=function(ts){
        times++
        if (times >= speed) {
          temp = (temp + 1) ;
          times = 0;
        }
        temp = temp%(str.length/2);
        return str.substr(temp*2,2);
      }

      this.setData({
        text: toString2(0),
        max: str.length/2
      })
      var startTime = Date.now()
      var self = this
      this._interval = setInterval(function() {
        self.setData({
          text: toString2(Date.now() - startTime),
          now: temp
        })
      }, 33)
    },
    stop: function() {
      clearInterval(this._interval)
    },
    faster: function() {
      var s = speed;
      s=s-1;
      if (s<1)
        s=1;
      speed=s;
    },
    slower: function() {
      speed = speed+1;
    },
    text_bigger: function() {
      var s = this.data.size;
      s = s+1;
      if(s>200) s=200;
      this.setData({
        size: s
      })
    },
    text_smaller: function () {
      var s = this.data.size;
      s = s - 1;
      if (s < 10) s = 10;
      this.setData({
        size: s
      })
    }
  }
})
