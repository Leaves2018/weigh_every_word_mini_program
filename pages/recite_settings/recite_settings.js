//search.js
const app = getApp()
const utils_lc = require('../../utils/local_cloud.js');

Page({
  data: {
    mHidden: true,
  },
  local_to_cloud: function () {
    utils_lc.local_to_cloud();
  },

  cloud_to_local: function () {
    utils_lc.cloud_to_local();
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
})
