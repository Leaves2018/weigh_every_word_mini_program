//deal_passage.js
const utilHistory = require('../../utils/history.js');
var headline;
const fileSystemManager = wx.getFileSystemManager();

Page({
  data: {
    height: 30,
    mHidden: true,
    nHidden: true,
    s: '',
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
    let todayArticle = wx.getStorageSync('todayArticleAddress');
    if (todayArticle) {
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/daily-push/' + todayArticle, // 文件 ID
        success: res => {
          console.log(res.tempFilePath);
          fileSystemManager.readFile({
            filePath: res.tempFilePath,
            encoding: 'utf8',
            success: res1 => {
              that.setData({
                s: res1.data,
              })
              let history = new utilHistory.History(res1.data);
              wx.setStorage({
                key: 'todayArticleAddress',
                data: '',
              });
              wx.setStorage({
                key: 'history_detail',
                data: history.uuid,
                success: (res)=>{
                  wx.navigateTo({
                    url: '/pages/history_detail2/history_detail',
                  })
                }
              })
            },
            fail: err => {
              console.log('readFile fail', err)
            }
          });
        },
        fail: err => {
          console.log('downFile fail', err)
        }
      })
    }
  },

  onShow: function () {
    var that = this;
    let passage_temp = wx.getStorageSync('input_passage_information');
    if (passage_temp === "") {
      return;
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
