var base64 = require("../../images/base64")
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word2.js');

var familiarWords = [];
var vocabularyTrie = null;
var vocabularyWords = [];
Page({
  data: {
    showWordList: true,
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
        src: '/images/icon_dui.svg', // icon的路径
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
    utilWord.appendFamiliar(familiarWords);
  },

  tapSlideView: function (e) {
    let index = e.currentTarget.dataset.position;
    this.setData({
      thisWord: vocabularyWords[index],
      progressOverall: Math.round(index / vocabularyWords.length * 100),
      showWordList: false,
    })
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
    familiarWords.push(_id);
  },

  search: function (value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(vocabularyTrie.findPrefix(value).map(ans => {
          return { text: ans };
        }));
      }, 200);
    })
  },

  searchFocus: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  searchBlur: function (e) {
    console.log("In searchBlur()," + e);
    this.setData({
      searchState: false,
    });

  },
  selectResult: function (e) {
    console.log('select result: ', e.detail.item.text);
    this.pageScrollToWord(e.detail.item.text);
  },

  pageScrollToWord: function (text) {
    var indexHighlight = vocabularyWords.indexOf(text);
    this.setData({
      indexHighlight: indexHighlight,
    })
    const query = wx.createSelectorQuery();
    query.selectAll('.weui-slidecell').boundingClientRect();
    query.exec(res => {
      wx.pageScrollTo({
        scrollTop: res[0][indexHighlight].top - 100,
        duration: 300,
      });
    })
  },
  goBackToWordList: function (e) {
    this.setData({
      showWordList: true,
    })
    this.pageScrollToWord(this.data.thisWord);
  }
});