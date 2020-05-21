// pages/recite2/recite.js
const util = require('../../utils/util.js');
const utilHis = require('../../utils/history.js');
// const utilTrie = require('../../utils/trie2.js');
const utilWord = require('../../utils/word2.js');
const utilTomd = require('../../utils/tomd.js');

const app = getApp();

const windowWidth = app.globalData.windowWidth;
const windowHeight = app.globalData.windowHeight;

const animation = wx.createAnimation({
  duration: 50,
  timingFunction: 'ease-in-out',
});

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    historyuuid: {
      type: String,
      value: "",
    }
  },

  /**
   * 配置选项
   */
  options: {
    pureDataPattern: /^_/,
  },

  /**
   * 组件的初始数据
   */
  data: {
    thisWord: "",
    startReciting: true,
    _currentIndex: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面第一次渲染完成
     */
    onReady: function() {
      const query = wx.createSelectorQuery();
      query.select('#progress-overall').boundingClientRect();
      query.exec(res => {
        console.log(res);
        let remainingHeight = windowHeight - res[0].bottom;
        this.setData({
          contextHeight: Math.floor(remainingHeight * 0.382) + "px",
          wordHeight: Math.floor(remainingHeight * 0.618) + "px",
        })
      })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面被销毁
     */
    onUnload: function() {
      this.history.save();
    },

    /**
     * 向左滑动处理方法
     */
    swipeLeft: function() {
      // console.log("swipeLeft in recite2")
      animation.translateX(-windowWidth).step(); //  向左移出窗口
      animation.translateY(windowHeight).step();
      animation.translateX(0).step(); // 移动到窗口正下方
      this.setData({
        animationData: animation.export(),
        _currentIndex: this.data._currentIndex + 1,
      });
      // 数据处理
      this.history.words[this.data.thisWord].tag = 'fa'; // 左滑记作熟词
      app.familiarTrie.insertData(this.data.thisWord);
      this.history.plus += 1;
    },

    /**
     * 向右滑动处理方法
     */
    swipeRight: function(e) {
      console.log("swipeRight in recite2")
      console.log(e.detail)
      // 动画处理
      animation.translateX(windowWidth).step(); // 向右移出窗口
      animation.translateY(windowHeight).step();
      animation.translateX(0).step(); // 移动到窗口正下方
      this.setData({
        animationData: animation.export(),
        _currentIndex: this.data._currentIndex + 1,
      });
      // 数据处理
      this.history.words[this.data.thisWord].tag = 'vo';
      app.vocabularyTrie.insertData(this.data.thisWord);
    },

    /**
     * 重定向至历史记录详情
     */
    goBack: function() {
      wx.redirectTo({
        url: `../history_detail2/history_detail?historyuuid=${this.history.uuid}`,
      });
    },
  },

  /**
   * 数据监听器
   */
  observers: {
    'historyuuid': function(historyuuid) {
      console.log(`In observers of page recite, historyuuid=${historyuuid}`);
      this.history = new utilHis.History(wx.getStorageSync(historyuuid));
      this.wordList = Object.keys(this.history.words)
      this.setData({
        _currentIndex: 0,
      })
    },
    '_currentIndex': function(currentIndex) {
      console.log(`_currentIndex=${currentIndex}`)
      let history = this.history;
      if (currentIndex >= this.wordList.length) {
        // 原reciteDone()方法
        history.done = true;
        this.setData({
          startReciting: false,
          msg_type: "success",
          msg_title: "背诵完成",
          msg_extend: ["Congratulations!"],
        });
      } else {
        // 原loadIndexWord()方法
        var that = this;
        setTimeout(() => {
          animation.translateY(0).step({
            duration: 300
          });
          while (true) {
            var thisWord = that.wordList[that.data._currentIndex];
            var word = history.words[thisWord];
            if (word.tag !== 'fa') {
              break;
            }
            that.data._currentIndex += 1; // 没有使用setData，不会触发observer
          }
          let [para, sent] = word.location.split('.').map(x => Number(x));
          let wordDetailWXML = app.towxml(utilTomd.markText(history.passageFragments[para][sent], thisWord), 'markdown');
          this.setData({
            animationData: animation.export(),
            thisWord: thisWord,
            wordDetailWXML: wordDetailWXML,
            progressOverall: Math.round(that.data._currentIndex / that.wordList.length * 100),
          });
        }, 200);
      }
    },
  },
})