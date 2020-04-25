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
var number;
var index;
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
    unknown_dialogShow: true,
    vocabulary_dialogShow: true,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{ text: "忘了" }, { text: "记得" }]
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
    let article_mes = history_example.body.join('.');  
    var his_body_temp = utils_tomd.markArticle(article_mes, vocabulary, '**');
    //var his_body_res = utils_tomd.markArticle(his_body_temp, unknown, '==');
    console.log(his_body_temp);
    var his_body_result = app.towxml(his_body_temp, 'markdown');
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

  //未知词背诵
  unknown_recite: function () {
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

  //生词背诵
  vocabulary_recite: function () {
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
  //修改标题
  loginForm: function (data) {
    //console.log(data.detail.value.headline)
    history_example.headline = data.detail.value.headline;
    this.setData({
      his_headline:history_example.headline,
    })
  },
  //展示未知词详情
  showDetail_unknown: function (e) {
    index = e.currentTarget.dataset.position;
    let unknown_trie = util_trie.getTrieFromStringArray(unknown);
    wx.setStorage({
      key: 'word_detail_list',
      data: {
        trie: unknown_trie,
        currentIndex: index,
      },
    });
    let word = unknown[index];
    let metaword = util_word.getWord(word).then(result => {
      this.setData({
        dialogTitle: word,
        dialogContent: result.translation,
        unknown_dialogShow: false
      })
    });
  },
  //展示生词详情
  showDetail_vocabulary: function (e) {
    index = e.currentTarget.dataset.position;
    let vocabulary_trie = util_trie.getTrieFromStringArray(vocabulary);
    wx.setStorage({
      key: 'word_detail_list',
      data: {
        trie: vocabulary_trie,
        currentIndex: index,
      },
    });
    let word = vocabulary[index];
    let metaword = util_word.getWord(word).then(result => {
      this.setData({
        dialogTitle: word,
        dialogContent: result.translation,
        vocabulary_dialogShow: false
      })
    });
  },
  //未知词记得操作
  unknown_modalconfirm: function () {
    unknown_remember_vocabulary.push(unknown[index]);
    unknown.splice(index, 1);
    history_example.unknown.splice(index, 1);
    this.setData({
      his_unknown: unknown,
      unknown_dialogShow: true,
    });
  },
  //未知词忘了操作
  unknown_modalcancel: function () {
    let addvoc = unknown[index];
    unknown.splice(index, 1);
    vocabulary.push(addvoc);
    let addword = history_example.unknown[index];
    history_example.unknown.splice(index,1);
    history_example.vocabulary.push(addword);
    this.setData({
      his_vocabulary: vocabulary,
      his_unknown: unknown,
      unknown_dialogShow: true,
    });
  },
  //生词记得操作
  vocabulary_modalconfirm: function () {
    voc_remember_vocabulary.push(vocabulary[index]);
    unknown_remember_vocabulary.push(vocabulary[index]);
    vocabulary.splice(index, 1);
    history_example.vocabulary.splice(index, 1);
    this.setData({
      his_vocabulary: vocabulary,
      vocabulary_dialogShow: true,
    });
  },
  //生词忘了操作
  vocabulary_modalcancel: function () {
    this.setData({
      vocabulary_dialogShow: true,
    });
  },
});




