const app = getApp()

Page({
  data: {
    started: false
  },
  start: function() {
    this.setData({
      started: true
    })
    this.selectComponent('#stopwatch').start()
  },
  stop: function() {
    this.setData({
      started: false
    })
    this.selectComponent('#stopwatch').stop()
    
  }
})
