var words = [{
  name: "weigh",
  chinese: "称量"
}, {
  name: "every",
  chinese: "每一个"
}, {
  name: "word",
  chinese: "单词"
}];
var cnt = -1;
var len = words.length;

Page({
  data: {
    progressOverall: 0,
    word: "word",
    chinese: "单词",
    progressThis: 100,
    progressThisActive: false,
    thisDuration: 30,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: true,
    loading: false
  },
  onLoad: function () {
    this.next();
  },
  next: function () {
    cnt++;
    if (cnt < len) {
      this.setData({
        progressOverall: Math.round((cnt + 1) / len * 100),
        word: words[cnt].name,
        chinese: words[cnt].chinese
      });
      if (cnt === len - 1) {
        this.reciteDone();
      }
    } else {
      this.reciteDone();
    }
  },
  activateButtons: function () {
    this.setData({
      disabled: false,
      progressThisActive: false
    });
  },
  tapHesitate: function () {
    this.setData({
      disabled: true,
      progressThisActive: true
    })
  },
  tapForget: function () {
    this.next();
  },
  tapRemember: function () {
    this.next();
  },
  reciteDone: function () {
    console.log("recite done");
    wx.navigateTo({
      url: '../recite_done/recite_done',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }
});