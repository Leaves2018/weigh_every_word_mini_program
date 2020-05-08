// pages/deal_input2/deal_input.js
const utilHistory = require('../../utils/history.js');
const fileSystemManager = wx.getFileSystemManager();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    filename:{
      type:String,
      value:''
    }
  },

  /**
   * 配置选项
   */
  options: {
    pureDataPattern: /^_/,
  },

  /**
   * 组件的初始数据
   */
  data: {
    s: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
            textarea_height: height - 150 + "rpx",
          });
        }
      });
      
    },

    onShow: function () {
      var that = this;
      let passage_temp = wx.getStorageSync('input_passage_information');
      if (passage_temp === "") {
        return;
      } else {
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
      let history = new utilHistory.History(this.data.s);
      wx.redirectTo({
        url: `/pages/history_detail2/history_detail?historyuuid=${history.uuid}`,
      })
    },

    deal_clear: function (e) {
      this.setData({
        s: '',
      })
    },
  },

  observers: {
    'filename':function(filename){
      console.log(filename);
      let todayArticle = wx.getStorageSync('today_article_address');
      // 如果已经录入或者为空，返回主页（input）
      if (filename === todayArticle || '') {
        wx.switchTab({
          url: '/pages/input/input',
        })
      } else {
        wx.cloud.downloadFile({
          fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/daily-push/' + filename, // 文件 ID
          success: res => {
            console.log(res.tempFilePath);
            fileSystemManager.readFile({
              filePath: res.tempFilePath,
              encoding: 'utf8',
              success: res1 => {
                this.setData({
                  s: res1.data,
                })
                wx.setStorage({
                  key: 'today_article_address',
                  data: filename,
                });
                this.deal_article();
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
    }
  }
})
