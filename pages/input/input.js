//deal_passage.js
const utils_deal = require('../../utils/deal.js');

const app = getApp()
var headline;

Page({
  data: {
    height: 30,
    mHidden: true,
    nHidden: true,
    s: '',
  },


  onShow: function () {
    wx.getClipboardData({
      success(res) {
        //console.log(res.data)
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
