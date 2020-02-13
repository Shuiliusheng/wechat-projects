var pictures = [
  {
    url: '/images/snow1.png',//图片地址
    width: 100,
    height: 100,
  },
  {
    url: '/images/snow2.png',//
    width: 100,
    height: 100,
  },
  {
    url: '/images/y2.png',//
    width: 100,
    height: 100,
  }
];

var rains = [];
var speed_factor = 1;
function getRandom(min, max) {
  var l = max - min;
  return Math.floor(Math.random() * l + min);
}

function addRains(number) {
  for (var i = 0; i < number; i++) {
    var temp = {};
    temp.img = getRandom(0, 3);
    temp.x = getRandom(1, 850);
    // temp.x = 200;
    temp.y = 0;
    temp.scale = getRandom(25, 100);
    // temp.angle = 30;
    temp.angle = getRandom(16, 30) - 15;
    temp.speed = getRandom(40, 65) * speed_factor;
    temp.spin = 0;
    rains.push(temp);
  }
}

function rebornRain(i) {
  rains[i].img = getRandom(0, 3);
  rains[i].x = getRandom(1, 850);
  rains[i].y = 0;
  rains[i].scale = getRandom(25, 100);
  // rains[i].angle = -10;
  rains[i].angle = getRandom(16, 30) - 15;
  rains[i].speed = getRandom(40, 65) * speed_factor;
}

function updateRain(i, w) {
  var dis = rains[i].speed / 10;
  var max_y = 1000;
  var max_x = 750;
  var angle = rains[i].angle;

  var ax = -1 * dis * Math.sin(angle * Math.PI / 180);
  var ay = dis * Math.cos(angle * Math.PI / 180);

  rains[i].y = rains[i].y + ay;
  rains[i].x = rains[i].x + ax;


  rains[i].angle = rains[i].angle + (getRandom(0,20)-10)/5;

  rains[i].scale = rains[i].scale + (getRandom(0, 10)-5) / 10;

  if (rains[i].scale<10)
    rains[i].scale=10;
  else if (rains[i].scale>200)
    rains[i].scale=200;


  if (rains[i].x < -100) {
    rebornRain(i);
  }
  else if (rains[i].y >= max_y)
    rebornRain(i);
}

function speedUp() {
  speed_factor = speed_factor + 0.1;
}

function speedDown() {
  speed_factor = speed_factor - 0.1;
  if (speed_factor <= 0.1)
    speed_factor = 0.1;
}

module.exports = {
  rains: rains,
  pictures: pictures,
  addRains: addRains,
  updateRain: updateRain,
  speedDown: speedDown,
  speedUp: speedUp
}