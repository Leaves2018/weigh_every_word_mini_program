var base64 = require("../../images/base64");
const db = wx.cloud.database()
const words = db.collection("familiar")
words.add({
  data: {
    name: "notos",
    chinese: "南风"
  }
}).then(res => {
  console.log(res)
})
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{text: "忘了"}, {text: "记得"}],
    words: [{
      first: "weigh",
      second: "every",
      third: "word"
    }, {
        first: "weigh",
        second: "every",
        third: "word"
      }, {
        first: "weigh",
        second: "every",
        third: "word"
      }, {
        first: "weigh",
        second: "every",
        third: "word"
      }, {
        first: "weigh",
        second: "every",
        third: "word"
      }, {
        first: "weigh",
        second: "every",
        third: "word"
      }, {
        first: "weigh",
        second: "every",
        third: "word"
      }]
  },
  onLoad: function () {
    this.setData({
      search: this.search.bind(this)
    });
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
  },
  showDetail: function (e) {
    let index, order;
    [index, order] = e.currentTarget.dataset.position.split(".");
    let word = this.data.words[index][order];
    this.setData({
      dialogTitle: word,
      dialogContent: word,
      dialogShow: true
    })
  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false
    })
  }
});