// components/word-card/word-card.js
const utilWord = require('../../utils/word2.js')
const app = getApp();

// 用于实现滑动手势操作
// const minOffset = 30;
// const minTime = 60;
// var startX = 0;
// var startY = 0;
// var startTime = 0;

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
    autoplayaudio: {
      type: Boolean,
      value: true,
    },
    showButtons: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    wordcard: {}, // 用于展示在页面上的单词数据
    showFront: true,
    hasLemma: false,
    showLemmaNow: false,
    showTranslation: true,
  },

  /**
   * 选项
   */
  options: {
    styleIsolation: 'isolated',
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      // this.setData({
      //   wordCardHeight: app.globalData.windowHeight * 0.618,
      // })
    },
    detached: function() {
      // console.log('word-card detached')
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 播放单词音频
     */
    playAudio: function() {
      if (!this.data.showFront) {
        // 朗读例句
      } else if (this.data.showLemmaNow) {
        this.lemma.playAudio();
      } else {
        this.original.playAudio();
      }
    },
    /**
     * 中英文解释切换
     */
    ecSwitch: function() {
      this.setData({
        showTranslation: !this.data.showTranslation,
      })
    },
    /**
     * 点击方法：显示单词在原文本中的形式
     */
    tapLemmaSwitchButton: function() {
      var show = this.data.showLemmaNow ? this.original : this.lemma;
      show.playAudio();
      this.setData({
        wordcard: show,
        definitionKeys: Object.keys(show.definition),
        translationKeys: Object.keys(show.translation),
        showLemmaNow: !this.data.showLemmaNow,
      })
    },
    /**
     * 翻转卡片
     */
    flipCard: function() {
      var that = this;
      this.animate('.word-card', [{
          opacity: 1.0
        },
        {
          opacity: 0.5,
        },
        {
          opacity: 0.0,
        }
      ], 500, function() {
        that.setData({
          showFront: !this.data.showFront,
        });
        that.animate('.word-card', [{
          opacity: 0.0,
        }, {
          opacity: 0.5,
        }, {
          opacity: 1.0,
        }], 500, function() {
          that.clearAnimation('.wordcard', {
            opacity: true,
            rotate: true
          }, function() {
            console.log("清除了.wordcard上的opacity和rotate属性")
          })
        }.bind(that))
      }.bind(this))
    },
    /**
     * 按钮点击方法
     */
    buttonTap: function buttonTap(e) {
      var index = e.currentTarget.dataset.index;

      this.triggerEvent('buttontap', { index: index, item: this.data.buttons[index] }, {});
    },
    /**
     * 点击方法：单词修改方法
     */
    // tapModifyButton: function() {
    //   console.log("In component word-card, tapModifyButton() is called.")
    //   wx.navigateTo({
    //     url: '../../pages/tutorial/tutorial',
    //   })
    // },
    // /**
    //  * 触摸控制：触摸开始
    //  */
    // touchStart: function(e) {
    //   startX = e.touches[0].pageX;
    //   startY = e.touches[0].pageY;
    //   startTime = new Date().getTime();
    // },
    // /**
    //  * 触摸控制：触摸取消
    //  */
    // touchCancel: function(e) {
    //   startX = 0;
    //   startY = 0;
    //   startTime = 0;
    // },
    // /**
    //  * 触摸控制：触摸结束事件（主要的判断流程）
    //  */
    // touchEnd: function(e) {
    //   var endX = e.changedTouches[0].pageX;
    //   var endY = e.changedTouches[0].pageY;
    //   var touchTime = new Date().getTime() - startTime;

    //   // 开始判断
    //   // 1. 时间是否达到阈值
    //   if (touchTime >= minTime) {
    //     // 2. 偏移量是否达到阈值
    //     var xOffset = endX - startX;
    //     var yOffset = endY - startY;
    //     var myEventDetail = {
    //       xOffset: xOffset,
    //       yOffset: yOffset,
    //       touchTime: touchTime,
    //       lemmaID: this.data._lemma ? this.data._lemma._id : undefined, // 回传lemma的ID（如果有lemma）
    //     };
    //     // 判断左右滑动还是上下滑动
    //     if (Math.abs(xOffset) >= Math.abs(yOffset) && Math.abs(xOffset) >= minOffset) {
    //       // 判断向左滑动还是向右滑动
    //       if (xOffset < 0) {
    //         this.triggerEvent("swipeleft", myEventDetail);
    //       } else {
    //         this.triggerEvent("swiperight", myEventDetail);
    //       }
    //     } else if (Math.abs(xOffset) < Math.abs(yOffset) && Math.abs(yOffset) >= minOffset) {
    //       // 判断向上滑动还是向下滑动
    //       if (yOffset < 0) {
    //         this.triggerEvent("swipeup", myEventDetail);
    //         // console.log("SwipeUp")
    //       } else {
    //         // console.log("SwipeDown")
    //         this.triggerEvent("swipedown", myEventDetail);
    //       }
    //     }
    //   } else {
    //     // console.log("滑动时间过短", touchTime);
    //   }
    // },
  },

  /**
   * 数据监听器
   */
  observers: {
    'word': function(word) {
      // 避免输入为空的情况
      if (!word) {
        return;
      }

      utilWord.getWord(word).then(wordRes => {
        // res = new utilWord.Word(res)
        // 如果有向单词卡片传递detail，则受托将其保存
        // if (detail) {
        //   wordRes.detail = this.data.detail;
        //   utilWord.setWord(wordRes);
        // } else if (wordRes.detail) {
        //   this.setData({
        //     detail: wordRes.detail,
        //   })
        // }
        this.original = wordRes;
        this.setData({
          showFront: true,
          wordcard: this.original,
          definitionKeys: Object.keys(this.original.definition),
          translationKeys: Object.keys(this.original.translation),
          thisword: {
            word: word,
            style: {
              "background": "yellow",
            }
          },
        })
        if (this.data.autoplayaudio) {
          this.original.playAudio();
        }
        let lemmaID = this.original.getExchange()["0"];
        if (lemmaID) {
          utilWord.getWord(lemmaID).then(lemmaRes => {
            this.lemma = lemmaRes;
            this.setData({
              hasLemma: true,
            })
          })
        } else {
          this.lemma = undefined;
          this.setData({
            hasLemma: false,
          })
        }
      })
    },
  },
})