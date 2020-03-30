//search.js
const utils_his = require('../../utils/history.js');
var base64 = require("../../images/base64");
const util_word = require('../../utils/word.js');
var number;
var vocabulary = [];
var unknown = [];
Page({
  data: {
    his_headline:"",
    his_body:[],
    his_vocabulary:[],
    his_unknown:[],
    his_date:"",
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{ text: "忘了" }, { text: "记得" }]
  },
  onLoad: function () {
    var history_choice = wx.getStorageSync('history_choice');
    var history_example = utils_his.getHistoryFromStorage(history_choice);
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
    this.setData({
      his_headline: history_example.headline,
      his_body: history_example.body,
      his_vocabulary: vocabulary_result,
      his_unknown: unknown_result,
      his_date: history_example.date,
    });
  },
  showDetail_unknown: function (e) {
    let a = e.currentTarget.dataset.position.split(".");
    console.log(e.currentTarget.dataset.position.split("."));
    let x = parseInt(a[0]);
    let y = parseInt(a[1]);
    let index = 3 * x + y;
    console.log(index);
    let word = unknown[index];
    let metaword = util_word.getWord(word).then(result => {
      this.setData({
        dialogTitle: word,
        dialogContent: result.chinese,
        dialogShow: true
      })
    });
  },
  showDetail_vocabulary: function (e) {
    let a = e.currentTarget.dataset.position.split(".");
    console.log(e.currentTarget.dataset.position.split("."));
    let x = parseInt(a[0]);
    let y = parseInt(a[1]);
    let index = 3 * x + y;
    let word = vocabulary[index];
    let metaword = util_word.getWord(word).then(result => {
      this.setData({
        dialogTitle: word,
        dialogContent: result.chinese,
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




