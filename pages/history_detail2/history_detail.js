// pages/history_detail2/history_detail.js
const utilsHis = require('../../utils/history.js');
const utilsTomd = require('../../utils/tomd.js');
const utilsWord = require('../../utils/word2.js');
const utilsTrie = require('../../utils/trie.js');
const utilsDeal = require('../../utils/deal.js');
const util = require('../../utils/util.js');
const app = getApp();

const markdownTagToSymbol = {
  'mark': '==',
  'em': '*',
  'ins': '++',
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
    dialogTitle: "",
    dialogContent: "",
    buttons: [{
      text: "忘了"
    }, {
      text: "记得"
    }],
    history: null,
    towxmlArray: [],
    _deal_word: '',
    _word_tag: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () { },
    //将修改存至本地
    onUnload: function () {
      this.data.history.save();
    },

    article_modify: function () {
      wx.redirectTo({
        url: '/pages/history_detail_modify/history_detail_modify',
      });
    },

    //背诵
    recite: function () {
      wx.redirectTo({
        url: `/pages/recite2/recite?historyuuid=${this.data.history.uuid}`,
      });
    },

    /**
     * 封装towxml，提供默认参数
     */
    markdownTowxml: function (text) {
      return app.towxml(text, 'markdown', {
        theme: 'light',
        events: {
          tap: (e) => {
            console.log('tap', e);
            this.setData({
              _word_tag: e.currentTarget.dataset.data._e.tag,
              _deal_word: e.currentTarget.dataset.data.child[0].text,
            })
          }
        }
      })
    },

    /**
     * 调整属性与局部渲染文本
     */
    setTo: function (sourceMark, targetMark, key, word) {
      console.log(`将${key}由${sourceMark}改为${targetMark}`)
      let [para, sent] = word.location.split('.').map(x => Number(x));
      let history = this.data.history;
      let tempwxml = history.passageFragments[para][sent].replace(`${sourceMark}${key}${sourceMark}`, `${targetMark}${key}${targetMark}`);
      let towxmlArray = this.data.towxmlArray;
      towxmlArray[para][sent] = tempwxml;
      this.setData({
        dialogShow: false,
        history: history,
        towxmlArray: towxmlArray,
      });
    },

    /**
     * 响应对话框按钮的点击方法
     */
    tapDialogButton: function (e) {
      let key = this.data._deal_word;
      let word = this.data.history.words[key];
      switch (e.detail.index) {
        case 0:
          if (word.tag === 'vo') {
            break;
          }
          app.vocabularyTrie.insertData(key);
          app.familiarTrie.deleteData(key);
          word.tag = 'vo';
          var targetTag = markdownTagToSymbol['mark'];
          break;
        case 1:
          if (word.tag === 'fa') {
            break;
          } else {
            this.data.history.plus += 1;
          }
          app.familiarTrie.insertData(key);
          app.vocabularyTrie.deleteData(key);
          word.tag = 'fa';
          var targetTag = ''; // 熟词无需标记（但还需要*的斜体标记，以获得词）
          break;
        default:
          app.familiarTrie.deleteData(key);
          app.vocabularyTrie.deleteData(key);
          word.tag = 'un';
          var targetTag = markdownTagToSymbol['ins']
      }
      this.setTo(markdownTagToSymbol[this.data._word_tag], targetTag, key, word);
    },
  },

  observers: {
    /**
     * 接收到uuid时，从缓存中获取该条历史记录
     */
    'historyuuid': function (historyuuid) {
      console.log(`historyuuid: ${historyuuid}`);
      var history = new utilsHis.History(wx.getStorageSync(historyuuid));
      var passage = util.joinPassage(history.passageFragments);
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

      passage = utilsTomd.markTextAll(passage, markdownTagToSymbol['em']); // 标记所有文本为斜体
      passage = utilsTomd.markPassage(passage, vocabulary, markdownTagToSymbol['mark']); // 标记生词为黄色高亮
      passage = utilsTomd.markPassage(passage, unknown, markdownTagToSymbol['ins']); // 标记未知词为下划线
      passage = util.splitPassage(passage); // 标记完后拆分文章为段句二维数组结构

      let that = this;
      let towxmlArray = passage.map(para => para.map(sent => that.markdownTowxml(sent))); // 按句转wxml

      this.setData({
        history: history,
        towxmlArray: towxmlArray,
      });
    },
    /**
     * _deal_word被改变时（即点击了某个单词），显示对话框
     */
    '_deal_word': function (deal_word) {
      this.setData({
        dialogTitle: this.data._deal_word,
        dialogContent: this.data._deal_word,
        dialogShow: true
      })
    }
  }
})