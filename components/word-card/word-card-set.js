// components/word-card/word-card-set.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    maskClosable: {
      type: Boolean,
      value: true
    },
    mask: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: false,
    },
    // history: {
    //   type: Object,
    //   value: null,
    // },
    words: {
      type: Array,
      value: [],
    },
    passageFragments: {
      type: Array,
      value: [],
    }
  },

  /**
   * 配置选项
   */
  options: {
    styleIsolation: 'isolated',
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的生命周期方法
   */
  lifetimes: {
    /**
     * 组件被放置到组件树上时，计算屏幕宽高，并依此设置卡片宽高
     */
    attached: function() {
      // console.log("word-card-set component is attached")
    },
    /**
     * 视图层渲染完成
     */
    ready: function() {
      // console.log("word-card-set  component is ready")
      let systemInfo = wx.getSystemInfoSync();
      // console.log(JSON.stringify(systemInfo))
      let wordCardWidth = Math.round(systemInfo.windowWidth * 0.8);
      let wordCardHeight = Math.round(systemInfo.windowHeight * 0.8);
      this.setData({
        wordCardSetHeight: wordCardHeight + "px",
        wordCardWidth: wordCardWidth + "px",
        wordCardHeight: Math.round(0.90 * wordCardHeight) + "px",
        bottomHeight: Math.round(0.10 * wordCardHeight) + "px",
      })
    },
    /**
     * 组件卸载
     */
    detached: function() {
      // console.log("word-card-set component is detached");
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close: function close() {
      // console.log("In recite3, close() is called.");
      if (!this.data.maskClosable) return;
      this.setData({
        show: false
      });
      this.triggerEvent('close', {}, {});
    },
    stopEvent: function stopEvent() {},
    buttonTap: function(e) { // 似乎触发不到
      console.log(e);
      this.scrollToItem(e.detail.selector);

      this.triggerEvent("buttontap", e.detail, {}); // 继续触发事件，向上冒泡
    },
    scrollToItem: function(res) {
      console.log('selector=' + res)
      this.setData({
        scrollIntoView: res.selector,
      })
    },
    scrollToLower: function() {
      var that = this;
      wx.showModal({
        title: '浏览完毕',
        content: '是否返回？',
        success: function(res) {
          if (res.confirm) {
            that.setData({
              show: false
            });
          }
        }
      })
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'show': function(show) {
      if (show) {
        setTimeout(function() {
          wx.hideLoading();
        }, 2000);
        if (this.data.words.length <= 0) {
          var that = this;
          wx.showToast({
            title: '全部处理完成',
            icon: 'success',
            duration: 2000,
            success: function() {
              that.setData({
                show: false
              });
            }
          })
        }
      }
    },
  }
})