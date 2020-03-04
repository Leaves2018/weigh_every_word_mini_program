var base64 = require("../../images/base64")
const db = wx.cloud.database()
const words = db.collection("vocabulary")
words.add({
  data: {
    name: "every",
    chinese: "每个"
  }
}).then(res => {
  console.log(res)
})
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    words: [{
      name: "weigh",
      chinese: "称量"
    }, {
      name: "every",
      chinese: "每一个"
    }, {
      name: "word",
      chinese: "单词"
    }, {
      name: "word",
      chinese: "单词"
    }, {
      name: "word",
      chinese: "单词"
    }, {
      name: "word",
      chinese: "单词"
    }, {
      name: "word",
      chinese: "单词"
    }, {
      name: "word",
      chinese: "单词"
    }]
  },
  onLoad: function () {
    this.setData({
      search: this.search.bind(this),
      icon: base64.icon20,
      slideButtons: [{
        text: '普通',
        src: '/images/icon_love.svg', // icon的路径
      }, {
        text: '普通',
        extClass: 'test',
        src: '/images/icon_star.svg', // icon的路径
      }, {
        type: 'warn',
        text: '警示',
        extClass: 'test',
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
  },
  search: function (value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([{ text: '搜索结果', value: 1 }, { text: '搜索结果2', value: 2 }])
      }, 200)
    })
  },
  selectResult: function (e) {
    console.log('select result', e.detail);
  }
});