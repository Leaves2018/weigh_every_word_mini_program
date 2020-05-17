// pages/draft/draft.js
const utilHistory = require('../../utils/history.js');
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
    onLoad: function() {
      
    },
    onShow: function () {
      let input_passage_information = wx.getStorageSync('input_passage_information');
      if (input_passage_information === "") {
        return;
      }
      this.setData({
        showinformation: input_passage_information,
      });
    },
    showpassagefragment: function (e) {
      wx.redirectTo({
        url: `/pages/deal_input2/deal_input?listnumber=${e.currentTarget.dataset.position}`,
      })
    },

    addpicture: function () {
      var that = this;
      wx.chooseImage({
        count: 1,
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
            let input_passage_information = wx.getStorageSync('input_passage_information');
            let passage_res = passage.replace(/[\u4e00-\u9fa5]/g, '');
            input_passage_information.push(passage_res);
            wx.setStorage({
              key: 'input_passage_information',
              data: input_passage_information,
            })
            that.setData({
              showinformation: input_passage_information,
            });
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
    returntoinput: function () {
      wx.navigateBack({
        url: '/pages/input2/input',
      })
    },
    redirectToHistory: function () {
      let input_passage_information = wx.getStorageSync('input_passage_information');
      let history = new utilHistory.History(input_passage_information.join(' '));
      wx.setStorage({
        key: 'input_passage_information',
        data: '',
      })
      wx.redirectTo({
        url: `/pages/history_detail2/history_detail?historyuuid=${history.uuid}`,
      })
    },
  }
})