//search.js
const app = getApp()
const utils_lc = require('../../utils/local_cloud.js');

Page({
  data: {
    mHidden: true,
    isDown: false,
    percent: 0,
    nHidden: true,
    storagepercent: 0,
    currentSize: 0,
    limitSize: 0,
  },
  onLoad: function () {
    var that = this;
    wx.getStorageInfo({
      success(res) {
        that.setData({
          storagepercent: (res.currentSize / res.limitSize)*100,
          currentSize: res.currentSize,
          limitSize: res.limitSize - res.currentSize,
        })
      }
    })
    
  },
  local_to_cloud: function () {
    this.setData({
      nHidden: false,
      isDown: true,
      percent: 99,
    });
    utils_lc.local_to_cloud();
    this.setData({
      percent: 100,
    });
  },

  cloud_to_local: function () {
    this.setData({
      nHidden: false,
      isDown: true,
      percent: 99,
    });
    utils_lc.cloud_to_local();
    this.setData({
      percent: 100,
    });
  },

  sliderchange: function (e) {
    console.log(e.detail.value);
  },
  clear_storage: function () {
    this.setData({
      mHidden: false,
    });
  },
  modalconfirm: function () {
    this.setData({
      mHidden: true,
    });
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
  },

  modalcancel: function () {
    this.setData({
      mHidden: true,
    });
  },
  modalconfirm1: function () {
    this.setData({
      nHidden: true
    });
  },
})
