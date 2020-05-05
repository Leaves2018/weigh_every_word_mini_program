//input.js

var clipboardData = '';
Page({
  data: {},
  onLoad: function () {
    
  },
  onShow: function () {
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
                wx.setStorage({
                  key: 'input_passage_information',
                  data: res.data,
                  success:(res)=>{
                    wx.navigateTo({
                      url: '/pages/deal_input2/deal_input',
                    })
                  }
                })
              }
            },
          })
        }
      }
    })
  },
  navigate_deal: function () {
    wx.hideKeyboard(),
      wx.navigateTo({
        url: '/pages/deal_input2/deal_input',
      })
  },
  //添加图片进行OCR识别
  addpicture: function () {
    var that = this;
    wx.chooseImage({
      count: 9,
      success: async function (res) {
        console.log(res.tempFilePaths);
        wx.showToast({
          title: '加载中...',
          icon: 'loading',
          duration: 3000
        })
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
          let passage_res = passage.replace(/[\u4e00-\u9fa5]/g, '');
          wx.setStorage({
            key: 'input_passage_information',
            data: passage_res,
          })
          wx.navigateTo({
            url: '/pages/deal_input2/deal_input',
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
})