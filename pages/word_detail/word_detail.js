// pages/word_detail/word_detail.js
const util_word = require('../../utils/word.js');
const util_trie = require('../../utils/trie.js');

var trie = null;
var words = [];
var currentIndex = -1;

var minOffset = 30;
var minTime = 60;
var startX = 0;
var startY = 0;
var startTime = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      var word_detail_list = wx.getStorageSync('word_detail_list');
      trie = new util_trie.Trie(word_detail_list.trie.root);
      currentIndex = word_detail_list.currentIndex;
      words = trie.getAllData();

    
    } catch (e) {
      console.warn(e);
    }
    this.loadIndexWord();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  touchStart: function (e) {
    console.log("touchStart", e);
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
    console.log("touchEnd", e);
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
  swipeLeft: function () {
    console.log("Swipe left.");
  },
  swipeRight: function() {
    console.log("Swipe right.");
  },
  swipeUp: function () {
    console.log("Swipe up.");
    currentIndex += 1;
    this.loadIndexWord();
  },
  swipeDown: function () {
    console.log("Swipe down.");
    currentIndex -= 1;
    this.loadIndexWord();
  },
  loadIndexWord: function () {
    if (currentIndex < 0) {
      currentIndex = 0;
      wx.showToast({
        title: '前面没有啦',
        icon: 'info',
        duration: 2000,
      });
    } else if (currentIndex >= words.length) {
      currentIndex = words.length - 1;
      wx.showToast({
        title: '后面没有啦',
        icon: 'info',
        duration: 2000,
      })
    }
    util_word.getWord(words[currentIndex]).then(word => {
      this.setData({
        word_level: word.level,
        word_id: word._id,
        word_phonetic: word.phonetic,
        word_chinese: word.chinese,
        word_context: word.context,
        word_english: word.english,
      });
    })
  },
})