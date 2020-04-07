//search.js
const app = getApp()

Page({
  data: {
    mHidden: true,
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
