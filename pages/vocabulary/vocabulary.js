var base64 = require("../../images/base64")
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word2.js');

var familiarWords = [];
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
    familiarWords.push(_id);
  },

  search: function (value) {
    return new Promise((resolve, reject) => {
      console.log(value);
      if (vocabularyTrie.search(value)) {
        console.log("search success");
        var indexHighlight = vocabularyWords.indexOf(value);
        this.setData({
          indexHighlight: indexHighlight,
        })
        
        const query = wx.createSelectorQuery();
        query.selectAll('.weui-slidecell').boundingClientRect();
        query.exec(res => {
          console.log("In search(),")
          console.log(res);
          wx.pageScrollTo({
            scrollTop: res[0][indexHighlight].top,
            duration: 300,
          });
        })

      }
    })
  },
  selectResult: function (e) {
    console.log('select result', e.detail);
  },
  tapTestButton: function (e) {
    var query = wx.createSelectorQuery();
    console.log("In tapTestButton(),")
    console.log(e);
    query.selectAll('.weui-slidecell').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      console.log(res)
      console.log(res[0])       // #the-id节点的上边界坐标
      console.log(res[1].scrollTop) // 显示区域的竖直滚动位置
    })
  }
});