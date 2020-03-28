const util_his = require('../../utils/history.js');
const util_trie = require('../../utils/trie.js');
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
    thisword: null,
    words: [],
    cnt: -1,
    len: 0,
    vocabulary_words: [],
    unknown_words: [],
    history: null,
    new_unknown_words: [],
    new_vocabulary_words: [],
    new_familiar_words: [],
  },
  onLoad: function () {

  },
  onShow: function () {
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
    this.otherdata.history.vocabulary = this.otherdata.new_vocabulary_words;
    this.otherdata.history.unknown = this.otherdata.new_unknown_words;
    let nvw = this.otherdata.new_vocabulary_words;
    nvw = nvw.length > 0 ? nvw.map(word => word.name) : [];
    let nfw = this.otherdata.new_familiar_words;
    nfw = nfw.length > 0 ? nfw.map(word => word.name) : [];
    util_word.appendFamiliar(nfw);
    util_word.deleteFamiliar(nfw);
    util_word.appendVocabulary(nvw);
    util_word.deleteVocabulary(nvw);
    util_his.setHistoryInStorage(this.otherdata.history.headline, this.otherdata.history);
  },
  next: function () {
    if (this.otherdata.unknown_words.length>0) {
      this.setData({
        word_tag: "「未知」",
      })
      this.otherdata.thisword = this.otherdata.unknown_words.shift();
    } else if (this.otherdata.vocabulary_words.length>0) {
      this.otherdata.thisword = this.otherdata.vocabulary_words.shift();
      this.setData({
        word_tag: "「生词」",
      })
    } else {
      this.reciteDone();
    }
    util_word.getWord(this.otherdata.thisword.name).then(word => {
      // word.hesitateNum = 0;
      word.context = this.otherdata.history.body[this.otherdata.thisword.sentence];
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
  },
  // saveWord: function () {
  //   let word = this.otherdata.thisword;
  //   wx.setStorage({
  //     key: word._id,
  //     data: word,
  //   })
  // },
  activateButtons: function () {
    this.setData({
      disabled: false,
      progressThisActive: false
    });
  },
  tapHesitate: function () {
    // thisword.hesitateNum += 1;
    this.setData({
      disabled: true,
      progressThisActive: true
    })
  },
  tapForget: function () {
    this.otherdata.new_vocabulary_words.push(this.otherdata.thisword);
    // this.saveWord();
    this.next();
  },
  tapRemember: function () {
    this.otherdata.new_familiar_words.push(this.otherdata.thisword);
    // this.saveWord();
    this.next();
  },
  reciteDone: function () {
    console.log("recite done");
    this.saveHistory();
    wx.navigateTo({
      url: '../recite_done/recite_done',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }
});