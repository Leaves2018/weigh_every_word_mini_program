var base64 = require("../../images/base64")
const util_trie = require('../../utils/trie.js');
const util_word = require('../../utils/word.js');

var vocabulary_trie = null;
var vocabulary_words = [];
Page({
  data: {
    showWordDetail: false,
    inputVal: "",
    vocabulary_words: [],
  },
  
  onLoad: function () {
    this.setData({
      search: this.search.bind(this),
      icon: base64.icon20,
      slideButtons: [{
        type: 'warn',
        text: '警示',
        extClass: 'test',
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },

  onShow: function () {
    vocabulary_trie = util_word.getVocabulary();
    vocabulary_words = vocabulary_trie.getAllData();
    this.setData({
      vocabulary_words: vocabulary_words,
    });
  },

  onReady: function () {
  },

  onHide: function () {
    util_word.setVocabulary(vocabulary_trie);
  },

  onUnload: function () {
  },

  tapSlideView: function (e) {
    let index = e.currentTarget.dataset.position;

    wx.setStorage({
      key: 'word_detail_list',
      data: {
        trie: vocabulary_trie,
        currentIndex: index,
      },
    });

    wx.navigateTo({
      url: '../word_detail/word_detail',
    });
  },

  tapSlideViewButtons: function (e) {
    var pos = e.currentTarget.dataset.position;
    switch (e.detail.index) {
      case 0:
        this.deleteItem(pos);
        this.setData({
          vocabulary_words: vocabulary_words,
        });
        break;
    }
  },

  deleteItem: function (index) {
    var _id = vocabulary_words[index];
    vocabulary_words.splice(index,1);
    vocabulary_trie.deleteData(_id);
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