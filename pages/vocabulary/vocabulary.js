var base64 = require("../../images/base64")
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word.js');

var vocabularyTrie = null;
var vocabularyWords = [];
Page({
  data: {
    showWordDetail: false,
    inputVal: "",
    vocabularyWords: [],
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
    vocabularyTrie = utilWord.getVocabulary();
    vocabularyWords = vocabularyTrie.getAllData();
    this.setData({
      words: vocabularyWords,
    });
  },

  onReady: function () {
  },

  onHide: function () {
  },

  onUnload: function () {
    utilWord.setVocabulary(vocabularyTrie);
    // 缓存生词本数量
    wx.setStorage({
      key: 'vocabularyWordsLength',
      data: vocabularyWords.length,
    });
  },

  tapSlideView: function (e) {
    let index = e.currentTarget.dataset.position;

    wx.setStorage({
      key: 'recite_info',
      data: {
        type: 'trie',
        trie: vocabularyTrie,
        currentIndex: index,
      },
      success: function () {
        wx.navigateTo({
          url: '../recite/recite',
        });
      }
    });
  },

  tapSlideViewButtons: function (e) {
    var pos = e.currentTarget.dataset.position;
    switch (e.detail.index) {
      case 0:
        this.deleteItem(pos);
        this.setData({
          words: vocabularyWords,
        });
        break;
    }
  },

  deleteItem: function (index) {
    var _id = vocabularyWords[index];
    vocabularyWords.splice(index,1);
    vocabularyTrie.deleteData(_id);
  },

  search: function (value) {
    return new Promise((resolve, reject) => {
      if (vocabularyTrie.search(value)) {
        var index = vocabularyWords.indexOf(value);
        wx.pageScrollTo({
          scrollTop: 56+index*87,
          duration: 300,
        });
      }
    })
  },
  selectResult: function (e) {
    console.log('select result', e.detail);
  }
});