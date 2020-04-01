const util_word = require('../../utils/word.js');
var base64 = require("../../images/base64");
var familiar_trie = null;
var familiar_words = [];
Page({
  data: { 
    inputShowed: false,
    inputVal: "",
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{text: "忘了"}, {text: "记得"}],
  },
  onLoad: function () {
    familiar_trie = util_word.getFamiliar();
    familiar_words = familiar_trie.getAllData();
    this.setData({
      search: this.search.bind(this),
      words: familiar_words,
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
    let index;
    index = e.currentTarget.dataset.position;
    let id = this.data.words[index];
    util_word.getWord(id).then(word => {
      this.setData({
        dialogTitle: word._id,
        dialogContent: word.chinese,
        dialogShow: true
      })
    });

  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false
    });
  }
});



