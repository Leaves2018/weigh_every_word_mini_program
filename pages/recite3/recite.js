// pages/recite3/recite.js
const app = getApp();
const createRecycleContext = require('miniprogram-recycle-view')
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
    history: {
      type: Object,
      value: null,
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
  data: {
    buttons: [{
      text: "忘了"
    }, {
      text: "记得"
    }],
  },

  lifetimes: {
    /**
     * 组件被放置到组件树上时，计算屏幕宽高，并依此设置卡片宽高
     */
    attached: function() {
      console.log("recite component is attached")

      let wordCardWidth = app.globalData.windowWidth * 0.8;
      let wordCardHeight = app.globalData.windowHeight * 0.618;
      this.setData({
        wordCardWidth: wordCardWidth + "px",
        wordCardHeight: wordCardHeight + "px",
        recycleViewHeight: app.globalData.windowHeight,
        recycleViewWidth: app.globalData.windowWidth * 0.8,
      })
      var ctx = createRecycleContext({
        id: 'wordCardRrecycleId',
        dataKey: 'wordCardList',
        page: this,
        itemSize: {
          width: wordCardWidth,
          height: wordCardHeight + 25,
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    close: function close() {
      console.log("In recite3, close() is called.")
      if (!this.data.maskClosable) return;
      this.setData({
        show: false
      });
      this.triggerEvent('close', {}, {});
    },
    stopEvent: function stopEvent() { },
    buttonTap: function(e) {
      console.log(e);
      this.triggerEvent("buttontap", e.detail, {}); // 继续触发事件，向上冒泡
    },
  },
  /**
   * 数据监听器
   */
  observers: {
    'show': function(show) {
      console.log('show=' + JSON.stringify(show))
      if (show) {
        let history = this.data.history;
        if (history) {
          var wordCardList = [];
          for (let key in history.words) {
            let word = history.words[key];
            if (word.tag !== 'fa') {
              wordCardList.push({
                key: key,
                tag: word.tag,
                loc: word.location.split('.'),
              })
            }
          }
          this.setData({
            wordCardList: wordCardList,
          })
        }
      }
    }
  }
})