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
  data: {},

  lifetimes: {
    /**
     * 组件被放置到组件树上时，计算屏幕宽高，并依此设置卡片宽高
     */
    attached: function() {
      console.log("recite component is attached")

    },
    /**
     * 视图层渲染完成
     */
    ready: function() {
      console.log("recite component is ready")
      let systemInfo = wx.getSystemInfoSync();
      console.log(JSON.stringify(systemInfo))
      let wordCardWidth = Math.round(systemInfo.windowWidth * 0.8);
      let wordCardHeight = Math.round(systemInfo.windowHeight * 0.618);
      this.setData({
        wordCardWidth: wordCardWidth + "px",
        wordCardHeight: wordCardHeight + "px",
        recycleViewHeight: systemInfo.windowHeight,
        recycleViewWidth: systemInfo.windowWidth * 0.8,
      })
    },
    /**
     * 组件卸载
     */
    detached: function() {
      console.log("recite component is detached");
      if (this.ctx) this.ctx.destroy();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    close: function close() {
      console.log("In recite3, close() is called.");
      if (!this.data.maskClosable) return;
      this.setData({
        show: false
      });
      this.triggerEvent('close', {}, {});
    },
    stopEvent: function stopEvent() {},
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
        // 每次显示时，重新读取历史记录并解析
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
          // 销毁原有的ctx，重新建立ctx并赋予新数据
          if (this.ctx) this.ctx.destroy();
          this.ctx = createRecycleContext({
            id: 'wordCardRrecycleId',
            dataKey: 'wordCardList',
            page: this,
            itemSize: {
              width: parseInt(this.data.wordCardWidth),
              height: parseInt(this.data.wordCardHeight) + 25,
            }
          })
          this.ctx.append(wordCardList)
        }
      }
    }
  }
})