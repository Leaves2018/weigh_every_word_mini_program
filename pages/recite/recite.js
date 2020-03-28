const util_his = require('../../utils/history.js');
const util_word = require('../../utils/word.js');


Page({
  data: {
    progressOverall: 0,
    word_tag: "Unknown",
    progressThis: 100,
    progressThisActive: false,
    thisDuration: 30,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: true,
    loading: false
  },
  otherdata: {
    words: [],
    cnt: -1,
    len: 0,
    vocabulary_words: [],
    unknown_words: [],
    hisotry: null,
  },
  onLoad: function () {
    new Promise(this.loadHistory).then(this.next).catch(function() {console.log("Something wrong.")});
  },
  loadHistory: function(resolve, reject) {
    console.log("In loadHistory,")
    var headline = "";
    if (arguments.length > 0 && typeof(arguments[0]) === "string") {
      headline = arguments[0];
    } else {
      headline = util_his.getHistoryListFromStorage().pop();
    }
    console.log(headline);
    this.otherdata.history = util_his.getHistoryFromStorage(headline);
    
    console.log(this.otherdata.history);
    this.otherdata.vocabulary_words = this.otherdata.history.vocabulary;
    this.otherdata.unknown_words = this.otherdata.history.unknown;
    this.otherdata.words = this.otherdata.unknown_words.concat(this.otherdata.vocabulary_words);
    this.otherdata.len = this.otherdata.words.length;
    // console.log("In loadHistory:");
    // console.log(this.otherdata.words);
    if (this.otherdata.len > 0) {
      resolve();
    } else {
      reject();
    }
  },
  saveHistory: function() {
    
  },
  next: function () {
    console.log("In next:");
    // console.log(this.otherdata.words);
    this.otherdata.cnt++;
    if (this.otherdata.cnt < this.otherdata.len) {
      let wordFromInput = this.otherdata.words[this.otherdata.cnt];
      util_word.getWord(wordFromInput.name).then(word => {
        // console.log(typeof(word));
        // console.log(word);
        // console.log(this.otherdata.history.body);
        // console.log(wordFromInput.sentence);
        word.context = this.otherdata.history.body[wordFromInput.sentence];
        wx.setStorage({
          key: word._id,
          data: word,
        })
        this.setData({
          progressOverall: Math.round((this.otherdata.cnt + 1) / this.otherdata.len * 100),
          word_level: word.level,
          word_id: word._id,
          word_phonetic: word.phonetic,
          word_chinese: word.chinese,
          word_context: word.context,
          word_english: word.english,
        });
      });
      if (this.otherdata.cnt === this.otherdata.len - 1) {
        this.reciteDone();
      }
    } else {
      this.reciteDone();
    }
  },
  activateButtons: function () {
    this.setData({
      disabled: false,
      progressThisActive: false
    });
  },
  tapHesitate: function () {
    this.setData({
      disabled: true,
      progressThisActive: true
    })
  },
  tapForget: function () {
    this.next();
  },
  tapRemember: function () {
    this.next();
  },
  reciteDone: function () {
    console.log("recite done");
    wx.navigateTo({
      url: '../recite_done/recite_done',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }
});