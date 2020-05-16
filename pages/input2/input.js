// pages/input2/input.js
const util = require('../../utils/util.js');
const utilTrie = require('../../utils/trie.js');
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
    // month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      this.totalday = wx.getStorageSync("show140days");
      this.last_launch_date = wx.getStorageSync("last_launch_date");
      if (this.last_launch_date === '') {
        this.last_launch_date = 0;
      }
      let nowdate = util.formatTime(new Date()).substring(8, 10);
      if (this.totalday===''){
        this.totalday = [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,];
      }
      if (this.last_launch_date === nowdate) {
        this.day = this.totalday.splice(-140, 140);
      }else {
        this.day = this.totalday.splice(-139, 139);
        this.familiarTrie = utilTrie.getFamiliarTrie();
        this.vocabularyTrie = utilTrie.getVocabularyTrie();
        this.last_num_of_words = wx.getStorageSync("last_num_of_words");
        if (this.last_num_of_words === '') {
          this.last_num_of_words = 0;
        }
        this.now_num_of_words = (this.familiarTrie.number !== undefined) ? this.familiarTrie.number : 0 + (this.vocabularyTrie.number !== undefined) ? this.vocabularyTrie.number : 0;
        if (this.now_num_of_words > this.last_num_of_words) {
          this.appendday = [1];
        } else {
          this.appendday = [''];
        }
        this.day = this.day.concat(this.appendday);
        console.log(this.day);
      }
      // let datemonth = parseInt(util.formatTime(new Date()).substring(5, 7));
      // let showmonth = [];
      // if (datemonth - 5 < 0) {
      //   showmonth = this.data.month.slice(datemonth - 5, 12).concat(this.data.month.slice(0, datemonth));
      // } else {
      //   showmonth = this.data.month.slice(datemonth - 5, datemonth);
      // }
      // showmonth = showmonth.join('      ');
      this.clipboardData = '';
      let datetime = parseInt(util.formatTime(new Date()).substring(11, 13));
      let condition;
      if (datetime < 12) {
        condition = 0;
      } else if (datetime < 18) {
        condition = 1;
      } else {
        condition = 2;
      }
      this.setData({
        condition: condition,
        //showmonth: showmonth,
      });
    },
    onShow: function() {
      let input_passage_information = wx.getStorageSync('input_passage_information');
      let draftcondition;
      if (typeof (input_passage_information) !== String && input_passage_information !== '') {
        draftcondition = 1;
      }else{
        draftcondition = 0;
      }
      this.setData({
        draftcondition: draftcondition,
        //showmonth: showmonth,
      });
      this.familiarTrie = utilTrie.getFamiliarTrie();
      this.vocabularyTrie = utilTrie.getVocabularyTrie();
      this.now_num_of_words = (this.familiarTrie.number !== undefined) ? this.familiarTrie.number : 0 + (this.vocabularyTrie.number !== undefined) ? this.vocabularyTrie.number : 0;
      if (this.now_num_of_words > this.last_num_of_words) {
        this.day[139] += 1;
        console.log(this.day);
      }
      this.last_num_of_words = this.now_num_of_words;
      this.setData({
        showday: this.day,
      });
      wx.setStorage({
        key: 'show140days',
        data: this.totalday.concat(this.day),
      })
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
              success: function(res1) {
                if (res1.confirm) {
                  //点击确定
                  wx.setStorage({
                    key: 'input_passage_information',
                    data: res.data.split('res'),
                    success: (res) => {
                      wx.navigateTo({
                        url: '/pages/draft/draft',
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
    navigatetodraft: function () {
      wx.navigateTo({
        url: '/pages/draft/draft',
      })
    },
    //添加图片进行OCR识别
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
            let passage_res = passage.replace(/[\u4e00-\u9fa5]/g, '');
            wx.setStorage({
              key: 'input_passage_information',
              data: [passage_res],
              success: (res) => {
                wx.navigateTo({
                  url: '/pages/draft/draft',
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
        fail: function(res) {},
        complete: function(res) {},
      })
    },
  }
})