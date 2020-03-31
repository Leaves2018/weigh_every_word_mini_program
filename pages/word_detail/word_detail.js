// pages/word_detail/word_detail.js
const util_word = require('../../utils/word.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 页面的其余数据
   */
  otherdata: {
    trie: null,
    words: [],
    currentIndex: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      var { trie, words, currentIndex } = wx.getStorageSync('word_detail_list');
      this.otherdata.trie = trie;
      this.otherdata.words = words;
      this.otherdata.currentIndex = currentIndex;
    } catch (e) {
      console.warn(e);
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

  }
})