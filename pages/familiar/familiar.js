var base64 = require("../../images/base64");

Page({
  data: {
    inputShowed: false,
    inputVal: "",
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{text: "忘了"}, {text: "记得"}],
    test_text: "there is no test word",
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
    wx.setStorage({
      key: 'test_key',
      data: word,
    })
  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false
    })
    let that = this
    wx.getStorage({
      key: 'test_key',
      success: function(res) {
        console.log(res.data)
        that.setData({
          test_text: res.data
        })
      },
    })
  }
});



