//search.js
const utils_his = require('../../utils/history.js');
var base64 = require("../../images/base64");
const util_word = require('../../utils/word.js');
function history(headline, body, vocabulary, unknown, date) {
  this.headline = headline;
  this.body = body;
  this.vocabulary = vocabulary;
  this.unknown = unknown;
  this.date = date;
}
var number;
var index;
var vocabulary = [];
var unknown = [];
var history_example;
var before_headline;
Page({
  data: {
    his_headline:"",
    his_body:[],
    his_vocabulary:[],
    his_unknown:[],
    his_date:"",
    unknown_dialogShow: true,
    vocabulary_dialogShow: true,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{ text: "忘了" }, { text: "记得" }]
  },
  onLoad: function () {
    var history_choice = wx.getStorageSync('history_choice');
    history_example = utils_his.getHistoryFromStorage(history_choice);
    vocabulary = [];
    unknown = [];
    unknown_result = [];
    vocabulary_result = [];
    for (var v_word of history_example.vocabulary) {
      vocabulary.push(v_word.name);
    }
    console.log(vocabulary);
    for (var v_word of history_example.unknown) {
      unknown.push(v_word.name);
    }
    console.log(unknown);
    var unknown_result = [];
    var vocabulary_result = [];
    for (var i = 0; i < unknown.length; i += 3) {
      unknown_result.push(unknown.slice(i, i + 3));
    }
    for (var i = 0; i < vocabulary.length; i += 3) {
      vocabulary_result.push(vocabulary.slice(i, i + 3));
    }
    before_headline = history_example.headline;
    this.setData({
      his_headline: history_example.headline,
      his_body: history_example.body,
      his_vocabulary: vocabulary_result,
      his_unknown: unknown_result,
      his_date: history_example.date,
    });
  },

  localdownload: function() {
    wx.removeStorage({
      key: before_headline,
      success: function (res) {
        console.log(res);
      },
    })
    var history_list = utils_his.getHistoryListFromStorage();
    var temp;
    for (var i = 0; i < history_list.length; i++) {
      if (history_list[i] == before_headline) {
        temp = i;
      }
    }
    history_list.splice(temp, 1, history_example.headline);
    console.log(history_list);
    utils_his.setHistoryListInStorage(history_list);
    var history_result = new history(history_example.headline, history_example.body, history_example.vocabulary, history_example.unknown, history_example.date);
    utils_his.setHistoryInStorage(history_example.headline, history_result);
  },

  onHide: function() {
  },

  loginForm: function (data) {
    console.log(data.detail.value.headline)
    history_example.headline = data.detail.value.headline;
    this.localdownload();
    this.setData({
      his_headline:history_example.headline,
    })
  },

  showDetail_unknown: function (e) {
    let a = e.currentTarget.dataset.position.split(".");
    console.log(e.currentTarget.dataset.position.split("."));
    let x = parseInt(a[0]);
    let y = parseInt(a[1]);
    index = 3 * x + y;
    console.log(index);
    let word = unknown[index];
    let metaword = util_word.getWord(word).then(result => {
      this.setData({
        dialogTitle: word,
        dialogContent: result.chinese,
        unknown_dialogShow: false
      })
    });
  },
  showDetail_vocabulary: function (e) {
    let a = e.currentTarget.dataset.position.split(".");
    console.log(e.currentTarget.dataset.position.split("."));
    let x = parseInt(a[0]);
    let y = parseInt(a[1]);
    index = 3 * x + y;
    let word = vocabulary[index];
    let metaword = util_word.getWord(word).then(result => {
      this.setData({
        dialogTitle: word,
        dialogContent: result.chinese,
        vocabulary_dialogShow: false
      })
    });
  },
  unknown_modalconfirm: function () {
    unknown.splice(index, 1);
    history_example.unknown.splice(index, 1);
    var unknown_result = [];
    for (var i = 0; i < unknown.length; i += 3) {
      unknown_result.push(unknown.slice(i, i + 3));
    }
    this.localdownload();
    this.setData({
      his_unknown: unknown_result,
      unknown_dialogShow: true,
    });
  },

  unknown_modalcancel: function () {
    let addvoc = unknown[index];
    unknown.splice(index, 1);
    vocabulary.push(addvoc);
    let addword = history_example.unknown[index];
    history_example.unknown.splice(index,1);
    history_example.vocabulary.push(addword);
    var unknown_result = [];
    var vocabulary_result = [];
    for (var i = 0; i < unknown.length; i += 3) {
      unknown_result.push(unknown.slice(i, i + 3));
    }
    for (var i = 0; i < vocabulary.length; i += 3) {
      vocabulary_result.push(vocabulary.slice(i, i + 3));
    }
    this.localdownload();
    this.setData({
      his_vocabulary: vocabulary_result,
      his_unknown: unknown_result,
      unknown_dialogShow: true,
    });
  },

  vocabulary_modalconfirm: function () {
    vocabulary.splice(index, 1);
    history_example.vocabulary.splice(index, 1);
    var vocabulary_result = [];
    for (var i = 0; i < vocabulary.length; i += 3) {
      vocabulary_result.push(vocabulary.slice(i, i + 3));
    }
    this.localdownload();
    this.setData({
      his_vocabulary: vocabulary_result,
      unknown_dialogShow: true,
    });
  },

  vocabulary_modalcancel: function () {
    this.setData({
      vocabulary_dialogShow: true,
    });
  },
});




