//deal_passage.js
const utils_deal = require('../../utils/deal.js');

const app = getApp()
var headline;
var clipboardData = '';

Page({
  data: {
    height: 30,
    mHidden: true,
    nHidden: true,
    s: '',
    clipboardData:'',
  },

  // onReady: function() {
  //   let that = this;
  //   // 获取系统信息
  //   wx.getSystemInfo({
  //     success: function (res) {
  //       // 获取可使用窗口宽度
  //       let clientHeight = res.windowHeight;
  //       // 获取可使用窗口高度
  //       let clientWidth = res.windowWidth;
  //       // 算出比例
  //       let ratio = 750 / clientWidth;
  //       // 算出高度(单位rpx)
  //       let height = clientHeight * ratio;
  //       // 设置高度
  //       that.setData({
  //         textarea_height: height,
  //       });
  //     }
  //   });
  // },

  onShow: function () {
    var that = this;
    wx.getClipboardData({
      success(res) {
        if (clipboardData === res.data){
          return;
        }else{
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
  },

  bindFormSubmit: function (e) {
    this.setData({
      s: e.detail.value
    })
  },

  //添加图片进行OCR识别
  addpicture: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: async function (res) {
        try {
          const invokeRes = await wx.serviceMarket.invokeService({
            service: 'wx79ac3de8be320b71',
            api: 'OcrAllInOne',
            data: {
              // 用 CDN 方法标记要上传并转换成 HTTP URL 的文件
              img_url: new wx.serviceMarket.CDN({
                type: 'filePath',
                filePath: res.tempFilePaths[0],
              }),
              data_type: 3,
              ocr_type: 8
            },
          })

          console.log('invokeService success', invokeRes)
          let passage = "";
          var informations = invokeRes.data.ocr_comm_res.items;
          for (var element of informations) {
            passage += " ";
            passage += element.text;
          }
          let his_detail = utils_deal.deal_passage(passage);
          wx.setStorage({
            key: 'history_detail',
            data: his_detail,
          })
          wx.navigateTo({
            url: '/pages/history_detail/history_detail',
          })
        } catch (err) {
          console.error('invokeService fail', err)
          wx.showModal({
            title: 'fail',
            content: err,
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
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
      s:'',
    });
  },
  deal_clear: function (e) {
    this.setData({
      s:'',
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
  }
})
