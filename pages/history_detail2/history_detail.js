// pages/history_detail2/history_detail.js
const utilsHis = require('../../utils/history.js');
const utilsTomd = require('../../utils/tomd.js');
const utilsWord = require('../../utils/word2.js');
const utilsTrie = require('../../utils/trie.js');
const utilsDeal = require('../../utils/deal.js');
const util = require('../../utils/util.js');
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
    historyuuid: {
      type: String,
      value: ''
    }
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
    _deal_word: '',
    _word_tag: '',
    _vocabulary: [],
    _unknown_remember_vocabulary: [],
    _voc_remember_vocabulary: [],
    _familiar_forget: [],
    _unknown: [],
    _history_example: '',
    _towxmlArray: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {

    },
    //将修改存至本地
    onUnload: function() {
      this.data.history.save();
    },

    article_modify: function() {
      wx.redirectTo({
        url: '/pages/history_detail_modify/history_detail_modify',
      });
    },

    //背诵
    recite: function() {
      wx.setStorage({
        key: 'recite_info',
        data: {
          type: 'history',
          headline: this.data._history_example.headline,
        },
        success: function() {
          wx.redirectTo({
            url: '/pages/recite/recite',
          });
        }
      })
    },

    tapDialogButton: function(e) {
      let word = this.data.history.words[this.data._deal_word];
      if (this.data._word_tag === "mark") {
        switch (e.detail.index) {
          //忘了
          case 0:
            break;
          //记得
          case 1:
            this.data.history.words[this.data._deal_word].tag = 'fa';
            let xiel = word.location.split('.');
            this.data.history.passageFragments[xiel[0]][xiel[1]].replace(`==${this.data._deal_word}==`, this.data._deal_word);
            this.data._towxmlArray[xiel[0]][xiel[1]] = app.towxml(this.data.history.passageFragments[xiel[0]][xiel[1]], 'markdown', {
              theme: 'light',
              events: {
                tap: (e) => {
                  console.log('tap', e);
                  this.data._word_tag = e.currentTarget.dataset.data._e.tag;
                  this.data._deal_word = e.currentTarget.dataset.data.child[0].text;
                  this.setData({
                    dialogTitle: this.data._deal_word,
                    dialogContent: this.data._deal_word,
                    dialogShow: true
                  })
                }
              }
            });
            break;
        }
      }
      if (this.data._word_tag === "ins") {
        let word = this.data.history.words[this.data._deal_word];
        switch (e.detail.index) {
          //忘了
          case 0:
            this.data.history.words[this.data._deal_word].tag = 'vo';
            let xiel = word.location.split('.');
            this.data.history.passageFragments[xiel[0]][xiel[1]].replace(`++${this.data._deal_word}++`, `==${this.data._deal_word}==`);
            this.data._towxmlArray[xiel[0]][xiel[1]] = app.towxml(this.data.history.passageFragments[xiel[0]][xiel[1]], 'markdown', {
              theme: 'light',
              events: {
                tap: (e) => {
                  console.log('tap', e);
                  this.data._word_tag = e.currentTarget.dataset.data._e.tag;
                  this.data._deal_word = e.currentTarget.dataset.data.child[0].text;
                  this.setData({
                    dialogTitle: this.data._deal_word,
                    dialogContent: this.data._deal_word,
                    dialogShow: true
                  })
                }
              }
            });
            break;
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
      }
      this.setData({
        dialogShow: false,
        history: history,
        his_body: this.data._towxmlArray,
      });
    },
  },

  observers: {
    'historyuuid': function(historyuuid) {
      var history = new utilsHis.History(wx.getStorageSync(historyuuid));
      var article_mes = util.joinPassage(history.passageFragments);
      var vocabulary = [];
      var unknown = [];
      for (let word in history.words) {
        switch (history.words[word].tag) {
          case 'vo':
            vocabulary.push(word);
            break;
          case 'un':
            unknown.push(word);
            break;
        }
      }
      var his_body_temp0 = utilsTomd.markTextAll(article_mes, '*');
      var his_body_temp = utilsTomd.markPassage(his_body_temp0, vocabulary, '==');
      var his_body_res = utilsTomd.markPassage(his_body_temp, unknown, '++');
      var his_body_result = util.splitPassage(his_body_res);
      this.data._towxmlArray = [];
      for (var para of his_body_result) {
        var towxmlArrayTemp = [];
        for (var sent of para) {
          let towxmlTemp = app.towxml(sent, 'markdown', {
            theme: 'light',
            events: {
              tap: (e) => {
                console.log('tap', e);
                this.data._word_tag = e.currentTarget.dataset.data._e.tag;
                this.data._deal_word = e.currentTarget.dataset.data.child[0].text;
                this.setData({
                  dialogTitle: this.data._deal_word,
                  dialogContent: this.data._deal_word,
                  dialogShow: true
                })
              }
            }
          });
          towxmlArrayTemp.push({
            sentense: towxmlTemp
          });
        }
        this.data._towxmlArray.push({
          paragraph: towxmlArrayTemp
        });
      }
      this.setData({
        history: history,
        his_body: this.data._towxmlArray,
      });
    }
  }
})