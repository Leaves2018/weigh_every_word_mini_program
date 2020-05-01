//search.js
const utils_his = require('../../utils/history.js');
const utils_tomd = require('../../utils/tomd.js');
var base64 = require("../../images/base64");
const util_word = require('../../utils/word2.js');
const util_trie = require('../../utils/trie.js');
const app = getApp();
function history(headline, body, vocabulary, unknown, date) {
  this.headline = headline;
  this.body = body;
  this.vocabulary = vocabulary;
  this.unknown = unknown;
  this.date = date;
}
var deal_word;
var vocabulary = [];
var unknown_remember_vocabulary = [];
var voc_remember_vocabulary = [];
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
    unknown_dialogShow: false,
    vocabulary_dialogShow: false,
    familiar_dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons0: [{ text: "忘了" }, { text: "记得" }],
    buttons1: [{ text: "知道了" }],
  },
  onLoad: function () {
    var history_detail = wx.getStorageSync('history_detail');
    history_example = utils_his.getHistoryFromStorage(history_detail);
    vocabulary = [];
    unknown = [];
    for (var v_word of history_example.vocabulary) {
      vocabulary.push(v_word.name);
    }
    //console.log(vocabulary);
    for (var v_word of history_example.unknown) {
      unknown.push(v_word.name);
    }
    //console.log(unknown);
    before_headline = history_example.headline;
    let article_mes = history_example.body.join(' ');
    let article_temp0 = article_mes.toLowerCase();
    let article_temp = article_temp0.replace(/[^a-zA-Z]/g, ' ');
    let article_words = article_temp.split(" "); //获取单词
    article_words = [...new Set(article_words)];//单词去重
    article_words = article_words.filter(function (x) { return x && x.trim(); });//单词去空
    var his_body_temp0 = utils_tomd.markArticle(article_mes, article_words, '*');
    var his_body_temp = utils_tomd.markArticle(his_body_temp0, vocabulary, '==');
    var his_body_res = utils_tomd.markArticle(his_body_temp, unknown, '++');
    var his_body_result = app.towxml(his_body_res, 'markdown', {
      theme: 'light',
      events: {
        tap: (e) => {
          console.log('tap', e);
          let word_temp = e.currentTarget.dataset.data.child[0].text;
          if (e.currentTarget.dataset.data._e.tag==="mark"){
            util_word.getWord(word_temp).then(word => {
              deal_word = word_temp;
              this.setData({
                dialogTitle: word._id,
                dialogContent: word.translation,
                vocabulary_dialogShow: true
              })
            });
          } 
          if (e.currentTarget.dataset.data._e.tag === "ins") {
            util_word.getWord(word_temp).then(word => {
              deal_word = word_temp;
              this.setData({
                dialogTitle: word._id,
                dialogContent: word.translation,
                unknown_dialogShow: true
              })
            });
          }
          if (e.currentTarget.dataset.data._e.tag === "em") {
            util_word.getWord(word_temp).then(word => {
              deal_word = word_temp;
              this.setData({
                dialogTitle: word._id,
                dialogContent: word.translation,
                familiar_dialogShow: true
              })
            });
          }
        }
      }
    });
    this.setData({
      his_headline: history_example.headline,
      his_body: his_body_result,
      his_vocabulary: vocabulary,
      his_unknown: unknown,
      his_date: history_example.date,
    });
  },
  //将修改存至本地
  onUnload: function() {
    wx.removeStorage({
      key: before_headline,
      success: function (res) {
        //console.log(res);
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

    if (history_example.vocabulary.length === 0 && history_example.unknown.length === 0) {
      let history_done_list = utils_his.getHistoryListDoneFromStorage();
      history_done_list.splice(temp, 1, 'success');
      utils_his.setHistoryListDoneInStorage(history_done_list);
    }

    //console.log(history_list);
    utils_his.setHistoryListInStorage(history_list);
    var history_result = new history(history_example.headline, history_example.body, history_example.vocabulary, history_example.unknown, history_example.date);
    utils_his.setHistoryInStorage(history_example.headline, history_result);
    util_word.appendVocabulary(vocabulary);
    util_word.deleteVocabularyFromVocabularyTrie(voc_remember_vocabulary);
    util_word.appendFamiliar(unknown_remember_vocabulary);
  },

  article_modify: function () {
    wx.redirectTo({
      url: '/pages/history_detail_modify/history_detail_modify',
    });
  },

  //背诵
  recite: function () {
    wx.setStorage({
      key: 'recite_info',
      data: {
        type: 'history',
        headline: history_example.headline,
      },
      success: function () {
        wx.redirectTo({
          url: '/pages/recite/recite',
        });
      }
    })
  },
  
  unknown_tapDialogButton: function (e) {
    var temp_index;
    for (var i = 0; i < unknown.length; i++) {
      if (unknown[i] == deal_word) {
        temp_index = i;
      }
    }
    switch (e.detail.index) {
      //忘了
      case 0:
        let addvoc = unknown[temp_index];
        unknown.splice(temp_index, 1);
        vocabulary.push(addvoc);
        let addword = history_example.unknown[temp_index];
        history_example.unknown.splice(temp_index, 1);
        history_example.vocabulary.push(addword);
        break;
      //记得
      case 1:
        unknown_remember_vocabulary.push(unknown[temp_index]);
        unknown.splice(temp_index, 1);
        history_example.unknown.splice(temp_index, 1);
        break;
    }
    this.setData({
      unknown_dialogShow: false,
      his_vocabulary: vocabulary,
      his_unknown: unknown,
    });
  },
  
  vocabulary_tapDialogButton: function (e) {
    var temp_index;
    for (var i = 0; i < vocabulary.length; i++) {
      if (vocabulary[i] == deal_word) {
        temp_index = i;
      }
    }
    switch (e.detail.index) {
      //忘了
      case 0:
        break;
      //记得
      case 1:
        voc_remember_vocabulary.push(vocabulary[temp_index]);
        unknown_remember_vocabulary.push(vocabulary[temp_index]);
        vocabulary.splice(temp_index, 1);
        history_example.vocabulary.splice(temp_index, 1);
        break;
    }
    this.setData({
      vocabulary_dialogShow: false,
      his_vocabulary: vocabulary,
    });
  },

  familiar_tapDialogButton: function (e) {
    this.setData({
      familiar_dialogShow: false,
    });
  },
});




