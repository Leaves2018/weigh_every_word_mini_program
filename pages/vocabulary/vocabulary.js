var base64 = require("../../images/base64")
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word2.js');

var familiarWords = [];
var vocabularyTrie = null;
var vocabularyWords = [];
var currentIndex = 0;
Page({
  data: {
    showWordList: true,
    reciteDone: false,
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
    if (vocabularyWords.length === 0) {
      this.reciteDone();
    } else {
      this.setData({
        words: vocabularyWords,
      });
    }
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

  loadWord: function (thisWord) {
    this.setData({
      thisWord: thisWord,
      progressOverall: Math.round(currentIndex / vocabularyWords.length * 100),
    })
  },

  startReciteProcess: function () {
    this.setData({
      showWordList: false,
    })
    this.loadWord(vocabularyWords[currentIndex]);
  },

  tapSlideView: function (e) {
    currentIndex = e.currentTarget.dataset.position;
    this.startReciteProcess();
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
    if (vocabularyWords.length === 0) {
      this.reciteDone();
    }
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
  },

  reciteDone: function () {
    this.setData({
      showWordList: true,
      reciteDone: true,
    })
  },

  isOutOfBounds: function () {
    if (vocabularyWords.length === 0) {
      this.reciteDone();
    } else {
      currentIndex = currentIndex % vocabularyWords.length;
      this.loadWord(vocabularyWords[currentIndex]);
    }
  },

  swipeLeft: function (e) {
    console.log("SwipeLeft")
    console.log(e)
    let tempWord = vocabularyWords.splice(currentIndex, 1)[0];
    vocabularyTrie.deleteData(tempWord);
    familiarWords.push(tempWord);
    this.isOutOfBounds();
  },

  swipeRight: function (e) {
    console.log("SwipeRight")
    console.log(e)
    // 还是生词，什么都不做；考虑记录频次
    currentIndex += 1;
    this.isOutOfBounds();
  },
});