// pages/deal_input2/deal_input.js
const utilHistory = require('../../utils/history.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
    listnumber: {
      type: Number,
      value: undefined
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
    },

    bindFormSubmit: function (e) {
      this.setData({
        s: e.detail.value
      })
    },

    //处理文本
    deal_article: function () {
      let passage_temp = wx.getStorageSync('input_passage_information');
      passage_temp[this.listnumber] = this.data.s;
      wx.setStorage({
        key: 'input_passage_information',
        data: passage_temp,
      })
      wx.redirectTo({
        url: '/pages/draft/draft',
      })
    },

    deal_clear: function (e) {
      wx.redirectTo({
        url: '/pages/draft/draft',
      })
    },
  },

  observers: {
    'listnumber': function (listnumber) {
      this.listnumber = listnumber;
      console.log(listnumber);
      let passage_temp = wx.getStorageSync('input_passage_information')[listnumber];
      this.setData({
        s: passage_temp,
      })
    }
  }
})
