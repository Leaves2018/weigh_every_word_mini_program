// pages/history_detail2/history_detail.js
const utilsHis = require('../../utils/history.js');
const utilsTomd = require('../../utils/tomd.js');
const utilsWord = require('../../utils/word2.js');
const utilsTrie = require('../../utils/trie.js');
const utilsDeal = require('../../utils/deal.js');
const util = require('../../utils/util.js');
const app = getApp();

const wxss = {
  fa: {
    "background": "white",
    "border": "none"
  },
  vo: {
    "background": "#7FFFAA"
  },
  un: {
    "border-bottom": "3px solid #8B4513"
  },
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    historyuuid: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialogShow: false,
    buttons: [{
      text: "忘了"
    }, {
      text: "记得"
    }],
    his_headline: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {},
    //将修改存至本地
    onUnload: function() {
      this.history.save(true);
    },

    redirectToModify: function() {
      wx.redirectTo({
        url: `/pages/history_detail_modify2/history_detail_modify?historyuuid=${this.data.historyuuid}`,
      });
    },

    //背诵
    redirectToRecite: function() {
      wx.redirectTo({
        url: `/pages/recite2/recite?historyuuid=${this.data.historyuuid}`,
      });
    },

    tapWord: function(e) {
      console.log(e);
      this.deal_word = e.detail.text;
      this.deal_word_location = e.detail.location;
      this.setData({
        dialogTitle: this.deal_word,
        dialogContent: this.deal_word,
        dialogShow: true
      })
    },

    /**
     * 响应对话框按钮的点击方法
     */
    tapDialogButton: function(e) {
      let key = this.deal_word;
      let location = this.deal_word_location;
      let word = this.history.words[key];
      switch (e.detail.index) {
        case 0:
          if (word === undefined) {
            this.history.words[key] = new utilsHis.Word('vo', location);
          }else if (word.tag === 'vo') {
            break;
          }
          app.vocabularyTrie.insertData(key);
          app.familiarTrie.deleteData(key);
          this.history.words[key].tag = 'vo';
          break;
        case 1:
          if (word.tag === 'fa') {
            break;
          } else {
            this.history.plus += 1;
          }
          app.familiarTrie.insertData(key);
          app.vocabularyTrie.deleteData(key);
          word.tag = 'fa';
          break;
        default:
          app.familiarTrie.deleteData(key);
          app.vocabularyTrie.deleteData(key);
          word.tag = 'un';
      }
      this.setData({
        thisword: {
          word: this.deal_word,
          style: wxss[this.history.words[key].tag],
        },
        dialogShow: false,
      })
    },
  },

  observers: {
    /**
     * 接收到uuid时，从缓存中获取该条历史记录
     */
    'historyuuid': function(historyuuid) {
      console.log(`historyuuid: ${historyuuid}`);
      this.history = new utilsHis.History(wx.getStorageSync(historyuuid));
      var passage = util.joinPassage(this.history.passageFragments);
      var vocabulary = [];
      var unknown = [];
      for (let word in this.history.words) {
        switch (this.history.words[word].tag) {
          case 'vo':
            vocabulary.push(word);
            break;
          case 'un':
            unknown.push(word);
            break;
        }
      }
      // 页面第一次渲染
      this.setData({
        passage: passage,
        highlight: [{
          words: unknown,
          style: wxss.un,
        }, {
          words: vocabulary,
          style: wxss.vo,
        }],
        his_headline: this.history.headline,
      })
    },
  }
})