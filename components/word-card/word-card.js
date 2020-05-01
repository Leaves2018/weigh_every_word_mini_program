// components/word-card/word-card.js
const utilWord = require('../../utils/word2.js')
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    word: {
      type: String,
      value: "",
    },
    showdetail: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    wordcard: {},   // 用于展示在页面上的单词数据
    show: {},       // 承载当前需要展示的单词
    _original: {},  // 单词在文本中的形式
    _lemma: undefined,     // 单词词根/原形
    _showOriginal: false, // 切换original与lemma的标志变量
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function () {

    },
    detached: function () {

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    tapShowOriginal: function () {
      if (this.data._lemma) {
        this.setData({
          show: this.data._showOriginal ? this.data._original : this.data._lemma,
          _showOriginal: !this.data._showOriginal,
        })
      } else {
        this.data.wordcard.playAudio();
      }
    },

    tapModifyButton: function () {
      console.log("In component word-card, tapModifyButton() is called.")
    }
  },
  
  /**
   * 数据监听器
   */
  observers: {
    'word': function (word) {
      // 避免输入为空的情况
      if (!word) {
        return;
      }
      utilWord.getWord(word).then(res => {
        res = new utilWord.Word(res)
        this.setData({
          _original: res,
          wordcard: res,
        })
        res.playAudio();
        let lemma = res.getExchange()["0"];
        if (lemma) {
          utilWord.getWord(lemma).then(res2 => {
            this.setData({
              _lemma: new utilWord.Word(res2),
            })
          })
        } else {
          // 清除上一个单词的数据
          this.setData({
            _lemma: undefined,
          })
        }
      })
    },
    'show': function (show) {
      this.setData({
        wordcard: show,
        wordcardTag: Object.values(show.tag).join('/'),
      })
      this.data.show.playAudio();
      if (this.data.showdetail) {
        this.setData({
          wordcardDetailWXML: app.towxml(show.detail, 'markdown'),
        })
      }
    },
  },
})
