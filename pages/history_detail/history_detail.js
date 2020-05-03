//search.js
const utils_his = require('../../utils/history.js');
const utils_tomd = require('../../utils/tomd.js');
var base64 = require("../../images/base64");
const util_word = require('../../utils/word2.js');
const util_trie = require('../../utils/trie.js');
const utils_deal = require('../../utils/deal.js');
const app = getApp();
function history(headline, body, vocabulary, unknown, date) {
  this.headline = headline;
  this.body = body;
  this.vocabulary = vocabulary;
  this.unknown = unknown;
  this.date = date;
}
var deal_word;
var word_tag;
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
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{ text: "忘了" }, { text: "记得" }],
  },
  onLoad: function () {
    var history_detail = wx.getStorageSync('history_detail');
    let history_example0 = utils_his.getHistoryFromStorage(history_detail);
    let headlineTemp = utils_deal.deal_passageWithHeadline(history_example0.headline, history_example0.body.join(' '));
    history_example = utils_his.getHistoryFromStorage(headlineTemp);
    vocabulary = [];
    unknown = [];
    vocabulary = history_example.vocabulary.map(element => element.name);
    unknown = history_example.unknown.map(element => element.name);
    before_headline = history_example.headline;
    let article_mes = history_example.body.join(' ');
    let article_temp0 = article_mes.toLowerCase();
    let article_temp = article_temp0.replace(/[^a-zA-Z]/g, ' ');
    let article_words = article_temp.split(" "); //获取单词
    article_words = [...new Set(article_words)];//单词去重
    article_words = article_words.filter(function (x) { return x && x.trim(); });//单词去空
    article_words = article_words.filter(function (x) { return x.length > 2; });
    var his_body_temp0 = utils_tomd.markArticle(article_mes, article_words, '*');//TODO等待雨飞的函数
    var his_body_temp = utils_tomd.markArticle(his_body_temp0, vocabulary, '==');
    var his_body_res = utils_tomd.markArticle(his_body_temp, unknown, '++');
    var his_body_result = app.towxml(his_body_res, 'markdown', {
      theme: 'light',
      events: {
        tap: (e) => {
          console.log('tap', e);
          let word_temp = e.currentTarget.dataset.data.child[0].text;
          word_tag = e.currentTarget.dataset.data._e.tag;
          deal_word = word_temp;
          this.setData({
            dialogTitle: deal_word,
            dialogContent: deal_word,
            dialogShow: true
          })
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
  
  tapDialogButton: function (e) {
    if (word_tag === "mark") {
      var temp_index = vocabulary.indexOf(deal_word);
      switch (e.detail.index) {
        //忘了
        case 0:
          break;
        //记得
        case 1:
          voc_remember_vocabulary.push(deal_word);
          unknown_remember_vocabulary.push(vocabulary[temp_index]);
          vocabulary.splice(temp_index, 1);
          history_example.vocabulary.splice(temp_index, 1);
          break;
      }
    }
    if (word_tag === "ins") {
      var temp_index = unknown.indexOf(deal_word);
      switch (e.detail.index) {
        //忘了
        case 0:
          unknown.splice(temp_index, 1);
          vocabulary.push(deal_word);
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
    }
    if (word_tag === "em") {
      switch (e.detail.index) {
        //忘了
        case 0:
          util_word.deleteFamiliar(deal_word);
          vocabulary.push(deal_word);
          history_example.vocabulary.push(deal_word);
          break;
        //记得
        case 1:
          break;
      }
    }
    this.setData({
      dialogShow: false,
      his_vocabulary: vocabulary,
      his_unknown: unknown,
    });
  },
  
  // buttontap(e) {
  //   console.log(e.detail)
  // }
});




