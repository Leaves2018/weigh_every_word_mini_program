const utilHis = require('../../utils/history.js');
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word.js');

var currentIndex = 0;         // 当前显示单词位于总体位置的下标
var history = {};             // 当输入参数为历史记录时使用
var wordList = [];            // 解析得到的单词列表

var vocabularyWordList = [];  // 记录用户修改得到的生熟词
var familiarWordList = [];
var cnt = 0;
var len = 0;

var minOffset = 30;
var minTime = 60;
var startX = 0;
var startY = 0;
var startTime = 0;

var windowWidth = 0;
var windowHeight = 0;
wx.getSystemInfo({
  success: function(res) {
    windowWidth = res.windowWidth;
    windowHeight = res.windowHeight;
  },
});

var animation = wx.createAnimation({
  duration: 50,
  timingFunction: 'linear',
})

Page({
  data: {
    // 背诵流程页面数据
    progressOverall: 0,
    progressThis: 100,
    thisDuration: 30,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: true,
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // console.log("Page recite is onLoad");
    try {
      var reciteInfo = wx.getStorageSync('reciteInfo');
      if (reciteInfo === "") {
        throw "reciteInfo is undefined in storage.";
      } else {
        switch (reciteInfo.type) {
          case "trie":
            this.parseTrieInfo(new utilTrie.Trie(reciteInfo.trie.root));
            currentIndex = reciteInfo.currentIndex;
            break;
          case "history":
            this.parseHistoryInfo(reciteInfo.headline);
            currentIndex = 0;
            break;
        }
      } 
    } catch (e) {
      console.warn(e);
    } finally {
      // reciteInfo即用即废止，所存信息是一次性的
      wx.setStorage({
        key: 'reciteInfo',
        data: -1,
      });
      this.startReciting();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面第一次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面被销毁
   */
  onUnload: function () {
    this.saveChanges();
    this.clearOtherData();
  },

  /**
   * 清理使用参数
   */
  clearOtherData: function () {
    currentIndex = 0;         // 当前显示单词位于总体位置的下标
    history = {};             // 当输入参数为历史记录时使用
    wordList = [];            // 解析得到的单词列表

    vocabularyWordList = [];  // 记录用户修改得到的生熟词
    familiarWordList = [];
    animation = wx.createAnimation({
      duration: 50,
      timingFunction: 'ease',
    });
    cnt = 0;
    len = 0;
  },

  /**
   * 解析字典树
   */
  parseTrieInfo: function (trie) {
    wordList = trie.getAllData();
    len = wordList.length;
  },

  /**
   * 解析历史记录
   */
  parseHistoryInfo: function (headline) {
    history = utilHis.getHistoryFromStorage(headline);
    history.isHistory = true;
    history.hisSenLocMap = new Map();
    history.unknown.concat(history.vocabulary).map(word => {
      wordList.push(word.name);
      history.hisSenLocMap.set(word.name, word.sentence);
    });
    len = wordList.length;
  },

  /**
   * 开始背诵流程
   */
  startReciting: function () {
    this.setData({
      startReciting: true,
    });
    this.loadIndexWord();
  },

  /**
   * 加载wordList[currentIndex]指定的单词
   */
  loadIndexWord: function () {
    var that = this;
    if (currentIndex < 0) {
      currentIndex = 0;
      wx.showModal({
        title: '提示',
        content: '前面没有啦，是否结束并保存？',
        success (res) {
          if (res.confirm) {
            that.reciteDone();
          }
        }
      });
    } else if (currentIndex >= wordList.length) {
      currentIndex = wordList.length - 1;
      wx.showModal({
        title: '提示',
        content: '后面没有啦，是否结束并保存？',
        success(res) {
          if (res.confirm) {
            that.reciteDone();
          }
        }
      });
    }
    // 数据处理
    utilWord.getWord(wordList[currentIndex]).then(word => {
      if (history.isHistory) {
        word.context = history.body[history.hisSenLocMap.get(wordList[currentIndex])];
      }
      this.setData({
        progressOverall: Math.round(cnt / len * 100),
        word: word,
      });
    });

    // 动画处理
    animation.translateY(0).step({duration: 300});
    this.setData({
      animationData: animation.export(),
    });
  },

  touchStart: function (e) {
    // console.log("touchStart", e);
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    startTime = new Date().getTime();
  },

  touchCancel: function (e) {
    startX = 0;
    startY = 0;
    startTime = 0;
  },

  touchMove: function (e) {

  },

  /**
   * 触摸结束事件：主要的判断流程
   */
  touchEnd: function (e) {
    // console.log("touchEnd", e);
    var endX = e.changedTouches[0].pageX;
    var endY = e.changedTouches[0].pageY;
    var touchTime = new Date().getTime() - startTime;

    // 开始判断
    // 1. 时间是否达到阈值
    if (touchTime >= minTime) {
      // 2. 偏移量是否达到阈值
      var xOffset = endX - startX;
      var yOffset = endY - startY;
      // 判断左右滑动还是上下滑动
      if (Math.abs(xOffset) >= Math.abs(yOffset) && Math.abs(xOffset) >= minOffset) {
        cnt += 1;
        // 判断向左滑动还是向右滑动
        if (xOffset < 0) {
          this.swipeLeft();
        } else {
          this.swipeRight();
        }
      } else if (Math.abs(xOffset) < Math.abs(yOffset) && Math.abs(yOffset) >= minOffset) {
        // 判断向上滑动还是向下滑动
        if (yOffset < 0) {
          this.swipeUp();
        } else {
          this.swipeDown();
        }
      }
    } else {
      console.log("滑动时间过短", touchTime);
    }
  },
  /**
   * 向左滑动处理方法
   */
  swipeLeft: function () {
    // 动画处理
    animation.translateX(-windowWidth).step();  //  向左移出窗口
    animation.translateY(-windowHeight).step();
    animation.translateX(0).step(); // 移动到窗口正上方
    this.setData({
      animationData: animation.export(),
    });
    // 数据处理
    familiarWordList.push(wordList[currentIndex]);  // 左滑记作熟词
    wordList.splice(currentIndex, 1);
    setTimeout(this.loadIndexWord, 200);
  },
  /**
   * 向右滑动处理方法
   */
  swipeRight: function () {
    // 动画处理
    animation.translateX(windowWidth).step(); // 向右移出窗口
    animation.translateY(-windowHeight).step();
    animation.translateX(0).step(); // 移动到窗口正上方
    this.setData({
      animationData: animation.export(),
    });
    // 数据处理
    vocabularyWordList.push(wordList[currentIndex]);
    wordList.splice(currentIndex, 1);
    setTimeout(this.loadIndexWord,200);
  },
  /**
   * 向上滑动处理方法
   */
  swipeUp: function () {
    // // 动画处理
    // animation.translateY(-windowHeight).step(); // 向上移出窗口
    // animation.translateX(-windowWidth).step();
    // animation.translateY(windowHeight).step();
    // animation.translateX(0).step(); // 移动到窗口下方
    // this.setData({
    //   animationData: animation.export(),
    // });
    // // 数据处理
    // currentIndex -= 1;
    // setTimeout(this.loadIndexWord, 300);
  },
  /**
   * 向下滑动处理方法
   */
  swipeDown: function () {
    // // 动画处理
    // animation.translateY(windowHeight).step(); // 向上移出窗口
    // animation.translateX(-windowWidth).step();
    // animation.translateY(-windowHeight).step();
    // animation.translateX(0).step(); // 移动到窗口下方
    // this.setData({
    //   animationData: animation.export(),
    // });
    // // 数据处理
    // currentIndex += 1;
    // setTimeout(this.loadIndexWord, 300);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * 下拉则清空原有数据直接拉取新数据
   */
  onPullDownRefresh: function () {
    wx.removeStorage({
      key: wordList[currentIndex],
      success: function(res) {
        utilWord.getWord(wordList[currentIndex]).then(word => {
          console.log(word);
          console.log("refresh successifully.");
          this.setData({
            word: word,
          });
        });
      },
    })
  },

  /**
   * 将用户修改保存到用户本地的生熟词本
   * 并将结果保存到key为recite_info的本地缓存，供调用recite页面的页面进行数据处理
   */
  saveChanges: function () {
    utilWord.appendFamiliar(familiarWordList);
    utilWord.deleteFamiliar(familiarWordList);
    utilWord.appendVocabulary(vocabularyWordList);
    utilWord.deleteVocabulary(vocabularyWordList);
    wx.setStorage({
      key: 'reciteInfo',
      data: {
        type: 'result',
        vocabulary: vocabularyWordList,
        familiar: familiarWordList,
      },
    })
  },

  /**
   * 背诵完成控制方法
   */
  reciteDone: function() {
    this.saveChanges();
    this.setData({
      startReciting: false,
      msg_type: "success",
      msg_title: "背诵完成",
      msg_extend: ["Congratulations!"],
    });
  },

  /**
   * 跳转上一级页面（历史记录）
  */
  goBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },


  /**
   * 前往背诵页面
   *
  goToInput: function () {
    wx.switchTab({
      url: '/pages/input/input',
    })
  },
  */
});