const pictures = [
  {
    id: "1",
    type: "nature",
    url: "https://w.wallhaven.cc/full/49/wallhaven-491d2k.jpg"
  },
  {
    id: "2",
    type: "nature",
    url: "https://w.wallhaven.cc/full/nr/wallhaven-nrv9v1.jpg"
  },
  {
    id: "3",
    type: "nature",
    url: "https://w.wallhaven.cc/full/0j/wallhaven-0j6r1p.jpg"
  },
  {
    id: "4",
    type: "nature",
    url: "https://w.wallhaven.cc/full/4o/wallhaven-4ok857.jpg"
  },
  {
    id: "5",
    type: "nature",
    url: "https://w.wallhaven.cc/full/4v/wallhaven-4v7yg3.jpg"
  },
  {
    id: "6",
    type: "nature",
    url: "https://w.wallhaven.cc/full/0p/wallhaven-0pry79.jpg"
  },
  {
    id: "7",
    type: "nature",
    url: "https://w.wallhaven.cc/full/0w/wallhaven-0wpr97.jpg"
  },
  {
    id: "8",
    type: "nature",
    url: "https://w.wallhaven.cc/full/5d/wallhaven-5dlqq9.jpg"
  },
  {
    id: "9",
    type: "nature",
    url: "https://w.wallhaven.cc/full/vm/wallhaven-vmmqo8.jpg"
  },
  {
    id: "10",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/96/wallhaven-96z68x.jpg"
  },
  {
    id: "11",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/n6/wallhaven-n63vr6.png"
  },
  {
    id: "12",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/yj/wallhaven-yj6oj7.jpg"
  },
  {
    id: "13",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/j5/wallhaven-j5kk7q.png"
  },
  {
    id: "14",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/95/wallhaven-95gvzk.jpg"
  },
  {
    id: "15",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/wy/wallhaven-wye1qr.jpg"
  },
  {
    id: "16",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/6k/wallhaven-6kpko7.jpg"
  },
  {
    id: "17",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/3k/wallhaven-3kp68d.jpg"
  },
  {
    id: "18",
    type: "WLOP",
    url: "https://w.wallhaven.cc/full/ey/wallhaven-eyykl8.jpg"
  },
  {
    id: "192",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/md/wallhaven-mdm6gy.jpg"
  },
  {
    id: "202",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/lm/wallhaven-lm7o2y.jpg"
  },
  {
    id: "212",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/j5/wallhaven-j5ojvw.jpg"
  },
  {
    id: "222",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/ey/wallhaven-ey1q3w.jpg"
  },
  {
    id: "232",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/vg/wallhaven-vgr15m.png"
  },
  {
    id: "242",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/39/wallhaven-39e89v.png"
  },
  {
    id: "193",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/6k/wallhaven-6kz1kq.png"
  },
  {
    id: "203",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/dg/wallhaven-dgqz5m.jpg"
  },
  {
    id: "213",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/vg/wallhaven-vgr1ml.jpg"
  },
  {
    id: "223",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/83/wallhaven-8316oj.jpg"
  },
  {
    id: "233",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/xl/wallhaven-xl2k7o.png"
  },
  {
    id: "243",
    type: "Latest",
    url: "https://w.wallhaven.cc/full/r2/wallhaven-r2zpmw.jpg"
  },
  {
    id: "19",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/96/wallhaven-96yzg8.png"
  },
  {
    id: "20",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/ox/wallhaven-oxv8pm.jpg"
  },
  {
    id: "21",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/r2/wallhaven-r25mm7.jpg"
  },
  {
    id: "22",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/md/wallhaven-mdv76m.png	"
  },
  {
    id: "23",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/wy/wallhaven-wyrqg7.png"
  },
  {
    id: "24",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/j5/wallhaven-j5qzjy.jpg"
  },
  {
    id: "191",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/13/wallhaven-13mk9v.jpg"
  },
  {
    id: "201",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/wy/wallhaven-wyv9qx.jpg"
  },
  {
    id: "211",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/96/wallhaven-96ydvw.jpg"
  },
  {
    id: "221",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/dg/wallhaven-dgqkw3.jpg"
  },
  {
    id: "231",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/xl/wallhaven-xl3r8l.jpg"
  },
  {
    id: "241",
    type: "Toplist",
    url: "https://w.wallhaven.cc/full/wy/wallhaven-wyr85x.jpg"
  }

]

module.exports = {
  pictures:pictures
}