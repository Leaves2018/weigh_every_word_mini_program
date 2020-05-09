// pages/input2/input.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      this.clipboardData ='';
    },
    onShow: function () {
      var that = this;
      wx.getClipboardData({
        success(res) {
          if (that.clipboardData === res.data) {
            return;
          } else {
            that.clipboardData = res.data;
            wx.showModal({
              title: '是否录入当前剪贴板信息？',
              content: res.data,
              success: function (res1) {
                if (res1.confirm) {
                  //点击确定
                  wx.setStorage({
                    key: 'input_passage_information',
                    data: res.data,
                    success: (res) => {
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
              success:(res)=>{
                wx.navigateTo({
                  url: '/pages/deal_input2/deal_input',
                })
              }
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
  }
})
