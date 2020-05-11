// pages/recite3/recite.js
const app = getApp();
const createRecycleContext = require('miniprogram-recycle-view')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    // wordCardDisplayQueue: [{
    //   _id: "weigh",
    //   detail: "This is the test of weigh's detail."
    // }, {
    //   _id: "every",
    //   detail: "This is the test of every's detail."
    // }, {
    //   _id: "word",
    //   detail: "This is the test of word's detail."
    // }],
  },

  lifetimes: {
    /**
     * 组件被放置到组件树上时，计算屏幕宽高，并依此设置卡片宽高
     */
    attached: function() {
      console.log("recite component is attached")
      // var that = this;
      // wx.getSystemInfo({
      //   success: function(res) {
      //     that.setData({
      //       windowsize: res,
      //     })
      //   },
      // })
      let wordCardWidth = app.globalData.windowWidth * 0.8;
      let wordCardHeight = app.globalData.windowHeight * 0.618;
      this.setData({
        wordCardWidth: wordCardWidth + "px",
        wordCardHeight: wordCardHeight + "px",
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


  },
  /**
   * 数据监听器
   */
  observers: {
    'history': function(history) {
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
})