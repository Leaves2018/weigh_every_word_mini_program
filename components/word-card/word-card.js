// components/word-card/word-card.js
const utilWord = require('../../utils/word2.js')
const app = getApp();

// 用于实现滑动手势操作
const minOffset = 30;
const minTime = 60;
var startX = 0;
var startY = 0;
var startTime = 0;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    word: {
      type: String,
      value: "",
    },
    detail: {
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
      console.log('word-card attached')
    },
    detached: function () {
      console.log('word-card detached')
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击方法：显示单词在原文本中的形式
     */
    tapShowOriginal: function () {
      // 首先判断单词是否有lemma：如果有，则进入切换逻辑
      if (this.data._lemma) {
        // 利用标志变量_showOriginal切换lemma和original
        this.setData({
          show: this.data._showOriginal ? this.data._original : this.data._lemma,
          _showOriginal: !this.data._showOriginal,
        })
      } else {  // 如果没有lemma，直接播放一遍音频
        this.data.wordcard.playAudio();
        console.log("tapShowOriginal audio")
      }
    },
    /**
     * 点击方法：单词修改方法
     */
    tapModifyButton: function () {
      console.log("In component word-card, tapModifyButton() is called.")
      wx.navigateTo({
        url: '../../pages/tutorial/tutorial',
      })
    },
    /**
     * 触摸控制：触摸开始
     */
    touchStart: function (e) {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      startTime = new Date().getTime();
    },
    /**
     * 触摸控制：触摸取消
     */
    touchCancel: function (e) {
      startX = 0;
      startY = 0;
      startTime = 0;
    },
    /**
     * 触摸控制：触摸结束事件（主要的判断流程）
     */
    touchEnd: function (e) {
      var endX = e.changedTouches[0].pageX;
      var endY = e.changedTouches[0].pageY;
      var touchTime = new Date().getTime() - startTime;

      // 开始判断
      // 1. 时间是否达到阈值
      if (touchTime >= minTime) {
        // 2. 偏移量是否达到阈值
        var xOffset = endX - startX;
        var yOffset = endY - startY;
        var myEventDetail = {xOffset: xOffset, yOffset: yOffset, touchTime: touchTime};
        // 判断左右滑动还是上下滑动
        if (Math.abs(xOffset) >= Math.abs(yOffset) && Math.abs(xOffset) >= minOffset) {
          // 判断向左滑动还是向右滑动
          if (xOffset < 0) {
            this.triggerEvent("swipeleft", myEventDetail);
          } else {
            this.triggerEvent("swiperight", myEventDetail);            
          }
        } else if (Math.abs(xOffset) < Math.abs(yOffset) && Math.abs(yOffset) >= minOffset) {
          // 判断向上滑动还是向下滑动
          if (yOffset < 0) {
            this.triggerEvent("swipeup", myEventDetail);
            console.log("SwipeUp")
          } else {
            console.log("SwipeDown")
            this.triggerEvent("swipedown", myEventDetail);
          }
        }
      } else {
        console.log("滑动时间过短", touchTime);
      }
    },
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
        // 如果有向单词卡片传递detail，则受托将其保存
        // if (detail) {
        //   res.detail = this.data.detail;
        //   utilWord.setWord(res);
        // }
        if (this.data.showdetail) {
          this.setData({
            wordcardDetailWXML: app.towxml(res.detail, 'markdown'),
          })
        }
        this.setData({
          _original: res,
          wordcard: res,
        })
        res.playAudio();
        console.log("'word' audio")
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
      if (!show) {
        return;
      }
      this.setData({
        wordcard: show,
        wordcardTag: Object.values(show.tag).join('/'),
      })
      this.data.show.playAudio();
    },
  },
})
