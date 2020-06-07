// pages/draft/draft.js
const utilHistory = require('../../utils/history.js');
const fileSystemManager = wx.getFileSystemManager();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    filename: {
      type: String,
      value: ''
    },
    storageKey: {
      type: String,
      value: ''
    },
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
    onShow: function() {
      let input_passage_information = wx.getStorageSync('input_passage_information');
      if (input_passage_information === "") {
        return;
      }
      this.setData({
        showinformation: input_passage_information,
      });
    },
    longdelete: function(e) {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认删除此片段吗？',
        success: function(res) {
          if (res.confirm) {
            let input_passage_information = wx.getStorageSync('input_passage_information');
            input_passage_information.splice(e.currentTarget.dataset.position, 1);
            console.log(input_passage_information);
            if(input_passage_information.length === 0){
              wx.setStorage({
                key: 'input_passage_information',
                data: '',
              })
            }else{
              wx.setStorage({
                key: 'input_passage_information',
                data: input_passage_information,
              })
            }
            that.setData({
              showinformation: input_passage_information,
            });
          }
        },
      })
    },
    showpassagefragment: function(e) {
      wx.redirectTo({
        url: `/pages/deal_input2/deal_input?listnumber=${e.currentTarget.dataset.position}`,
      })
    },
    addtext: function() {
      wx.redirectTo({
        url: '/pages/deal_input2/deal_input',
      })
    },

    addpicture: function() {
      var that = this;
      wx.chooseImage({
        count: 1,
        success: async function(res) {
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
        fail: function(res) {},
        complete: function(res) {},
      })
    },
    deal_passage: function() {
      let input_passage_information = wx.getStorageSync('input_passage_information');
      if (input_passage_information === '') {
        return;
      }
      let history = new utilHistory.History(input_passage_information.join(' '));
      wx.setStorage({
        key: 'input_passage_information',
        data: '',
      })
      wx.redirectTo({
        url: `/pages/history_detail2/history_detail?historyuuid=${history.uuid}`,
      })
    },
  },

  observers: {
    'filename': function(filename) {
      var that = this;
      console.log(filename);
      let todayArticle = wx.getStorageSync('today_article_address');
      // 如果已经录入或者为空，返回主页（input）
      if (filename === todayArticle || '') {
        wx.switchTab({
          url: '/pages/input2/input',
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
                that.setData({
                  showinformation: [res1.data],
                });
                wx.setStorage({
                  key: 'input_passage_information',
                  data: [res1.data],
                });
                wx.setStorage({
                  key: 'today_article_address',
                  data: filename,
                });
                this.deal_passage();
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
    'storageKey': function (storageKey) {
      var that = this;
      if(storageKey){
        wx.getStorage({
          key: storageKey,
          success: function(res) {
            if(res.data.length !== 36){
              that.setData({
                showinformation: [res.data],
              });
              let history = new utilHistory.History(res.data);
              wx.setStorage({
                key: storageKey,
                data: history.uuid,
              })
            }
          },
        })
      }
    }
  }
})