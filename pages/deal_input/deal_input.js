//deal_passage.js
const utils_deal = require('../../utils/deal.js');
var headline;
var clipboardData = '';

Page({
  data: {
    height: 30,
    mHidden: true,
    nHidden: true,
    s: '',
    clipboardData: '',
  },

  onLoad: function () {
    let that = this;
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        // 获取可使用窗口宽度
        let clientHeight = res.windowHeight;
        // 获取可使用窗口高度
        let clientWidth = res.windowWidth;
        // 算出比例
        let ratio = 750 / clientWidth;
        // 算出高度(单位rpx)
        let height = clientHeight * ratio;
        // 设置高度
        that.setData({
          textarea_height:height-150 + "rpx",
        });
      }
    });

  },

  onShow: function () {
    var that = this;
    let passage_temp = wx.getStorageSync('input_passage_information');
    if (passage_temp === "") {
      wx.getClipboardData({
        success(res) {
          if (clipboardData === res.data) {
            return;
          } else {
            clipboardData = res.data;
            wx.showModal({
              title: '是否录入当前剪贴板信息？',
              content: res.data,
              success: function (res1) {
                if (res1.cancel) {
                  //点击取消,默认隐藏弹框
                } else {
                  //点击确定
                  that.setData({
                    s: res.data,
                  })
                }
              },
            })
          }
        }
      })
    }else {
      wx.setStorage({
        key: 'input_passage_information',
        data: "",
      })
      that.setData({
        s: passage_temp,
      })

    }
  },

  bindFormSubmit: function (e) {
    this.setData({
      s: e.detail.value
    })
  },

  //处理文本
  deal_article: function () {
    if (this.data.s === "") {
      return;
    }
    headline = utils_deal.deal_passage(this.data.s);
    wx.setStorage({
      key: 'history_detail',
      data: headline,
    })
    this.setData({
      mHidden: false,
      s: '',
    });
  },
  deal_clear: function (e) {
    this.setData({
      s: '',
    })
  },

  modalconfirm: function () {
    this.setData({
      mHidden: true
    });
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 1500
    })
    wx.setStorage({
      key: 'recite_info',
      data: {
        type: 'history',
        headline: headline,
      },
      success: function () {
        wx.navigateTo({
          url: '/pages/recite/recite',
        });
      }
    })
  },

  modalcancel: function () {
    this.setData({
      mHidden: true,
      nHidden: false
    });
  },

  modalconfirm1: function () {
    this.setData({
      nHidden: true
    });
    wx.navigateBack({
      url: '/pages/input/input',
    });
  }
})
