var base64 = require("../../images/base64")
const util_trie = require('../../utils/trie.js');
const util_word = require('../../utils/word.js');

Page({
  data: {
    showWordDetail: false,
    inputVal: "",
    vocabulary_words: [],
  },
  otherdata: {
    vocabulary_trie: null,
    vocabulary_words: [],
  },
  onLoad: function () {
    this.otherdata.vocabulary_trie = util_word.getVocabulary();
    this.otherdata.vocabulary_words = this.otherdata.vocabulary_trie.getAllData();
    // console.log("In onLoad of vocabulary.js,");
    // console.log(this.otherdata.vocabulary_words);
    this.setData({
      search: this.search.bind(this),
      vocabulary_words: this.otherdata.vocabulary_words,
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
  tapSlideView(e) {
    // console.log('slide view ', e.detail);
    let index = e.currentTarget.dataset.position;
    // let _id = this.otherdata.vocabulary_words[index];
    // util_word.getWord(_id).then(word => {
    //   this.setData({
    //     showWordDetail: true,
    //     word_level: word.level,
    //     word_id: word._id,
    //     word_phonetic: word.phonetic,
    //     word_chinese: word.chinese,
    //     word_context: word.context,
    //     word_english: word.english,
    //   });
    // });

    wx.setStorage({
      key: 'word_detail_list',
      data: {
        trie: this.otherdata.vocabulary_trie,
        words: this.otherdata.vocabulary_words,
        currentIndex: index,
      },
    });

    wx.navigateTo({
      url: '../word_detail/word_detail',
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
  }
});