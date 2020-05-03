// pages/history_detail2/history_detail.js
const utilsHis = require('../../utils/history.js');
const utilsTomd = require('../../utils/tomd.js');
const utilsWord = require('../../utils/word2.js');
const utilsTrie = require('../../utils/trie.js');
const utilsDeal = require('../../utils/deal.js');
const app = getApp();
function history(headline, body, vocabulary, unknown, date) {
  this.headline = headline;
  this.body = body;
  this.vocabulary = vocabulary;
  this.unknown = unknown;
  this.date = date;
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    his_headline: "",
    his_body: [],
    his_vocabulary: [],
    his_unknown: [],
    his_date: "",
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{
      text: "忘了"
    }, {
      text: "记得"
    }],
    _deal_word:'',
    _word_tag:'',
    _vocabulary:[],
    _unknown_remember_vocabulary:[],
    _voc_remember_vocabulary:[],
    _familiar_forget:[],
    _unknown:[],
    _history_example:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      var history_detail = wx.getStorageSync('history_detail');
      let history_example0 = utilsHis.getHistoryFromStorage(history_detail);
      let headlineTemp = utilsDeal.deal_passageWithHeadline(history_example0.headline, history_example0.body.join(' '));
      this.data._history_example = utilsHis.getHistoryFromStorage(headlineTemp);
      this.data._vocabulary = [];
      this.data._unknown = [];
      this.data._vocabulary = this.data._history_example.vocabulary.map(element => element.name);
      this.data._unknown = this.data._history_example.unknown.map(element => element.name);
      let article_mes = this.data._history_example.body.join(' ');
      let article_temp0 = article_mes.toLowerCase();
      let article_temp = article_temp0.replace(/[^a-zA-Z]/g, ' ');
      let article_words = article_temp.split(" "); //获取单词
      article_words = [...new Set(article_words)]; //单词去重
      article_words = article_words.filter(function (x) {
        return x && x.trim();
      }); //单词去空
      article_words = article_words.filter(function (x) {
        return x.length > 2;
      });
      var his_body_temp0 = utilsTomd.markArticle(article_mes, article_words, '*'); //TODO等待雨飞的函数
      var his_body_temp = utilsTomd.markArticle(his_body_temp0, this.data._vocabulary, '==');
      var his_body_res = utilsTomd.markArticle(his_body_temp, this.data._unknown, '++');
      var his_body_result = app.towxml(his_body_res, 'markdown', {
        theme: 'light',
        events: {
          tap: (e) => {
            console.log('tap', e);
            let word_temp = e.currentTarget.dataset.data.child[0].text;
            this.data._word_tag = e.currentTarget.dataset.data._e.tag;
            this.data._deal_word = word_temp;
            this.setData({
              dialogTitle: this.data._deal_word,
              dialogContent: this.data._deal_word,
              dialogShow: true
            })
          }
        }
      });
      this.setData({
        his_headline: this.data._history_example.headline,
        his_body: his_body_result,
        his_vocabulary: this.data._vocabulary,
        his_unknown: this.data._unknown,
        his_date: this.data._history_example.date,
      });
    },
    //将修改存至本地
    onUnload: function () {
      wx.removeStorage({
        key: this.data._history_example.headline,
        success: function (res) {
          //console.log(res);
        },
      })

      if (this.data._history_example.vocabulary.length === 0 && this.data. _history_example.unknown.length === 0) {
        let history_done_list = utilsHis.getHistoryListDoneFromStorage();
        history_done_list.splice(temp, 1, 'success');
        utilsHis.setHistoryListDoneInStorage(history_done_list);
      }

      var history_result = new history(this.data._history_example.headline, this.data._history_example.body, this.data._history_example.vocabulary, this.data._history_example.unknown, this.data._history_example.date);
      utilsHis.setHistoryInStorage(this.data._history_example.headline, history_result);
      utilsWord.appendVocabulary(this.data._vocabulary);
      utilsWord.deleteVocabularyFromVocabularyTrie(this.data._voc_remember_vocabulary);
      utilsWord.appendFamiliar(this.data._unknown_remember_vocabulary);
      console.log(this.data._familiar_forget);
      utilsWord.deleteFamiliarFromFamiliarTrie(this.data._familiar_forget);
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
          headline: this.data._history_example.headline,
        },
        success: function () {
          wx.redirectTo({
            url: '/pages/recite/recite',
          });
        }
      })
    },

    tapDialogButton: function (e) {
      if (this.data._word_tag === "mark") {
        var temp_index = this.data._vocabulary.indexOf(this.data._deal_word);
        switch (e.detail.index) {
          //忘了
          case 0:
            break;
          //记得
          case 1:
            this.data._voc_remember_vocabulary.push(this.data._deal_word);
            this.data._unknown_remember_vocabulary.push(this.data._vocabulary[temp_index]);
            this.data._vocabulary.splice(temp_index, 1);
            this.data._history_example.vocabulary.splice(temp_index, 1);
            break;
        }
      }
      if (this.data._word_tag === "ins") {
        var temp_index = this.data._unknown.indexOf(this.data._deal_word);
        switch (e.detail.index) {
          //忘了
          case 0:
            this.data._unknown.splice(temp_index, 1);
            this.data._vocabulary.push(this.data._deal_word);
            let addword = this.data._history_example.unknown[temp_index];
            this.data._history_example.unknown.splice(temp_index, 1);
            this.data._history_example.vocabulary.push(addword);
            break;
          //记得
          case 1:
            this.data._unknown_remember_vocabulary.push(this.data._unknown[temp_index]);
            this.data._unknown.splice(temp_index, 1);
            this.data._history_example.unknown.splice(temp_index, 1);
            break;
        }
      }
      if (this.data._word_tag === "em") {
        switch (e.detail.index) {
          //忘了
          case 0:
            this.data._familiar_forget.push(this.data._deal_word);
            this.data._vocabulary.push(this.data._deal_word);
            this.data._history_example.vocabulary.push(this.data._deal_word);
            break;
          //记得
          case 1:
            break;
        }
        console.log(this.data._familiar_forget);
      }
      this.setData({
        dialogShow: false,
        his_vocabulary: this.data._vocabulary,
        his_unknown: this.data._unknown,
      });
    },
  }
})