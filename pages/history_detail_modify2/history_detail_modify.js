// pages/history_detail_modify2/history_detail_modify2.js
const utils_his = require('../../utils/history.js');
const utils_tomd = require('../../utils/tomd.js');
const util_word = require('../../utils/word2.js');
const util_trie = require('../../utils/trie.js');
const utils_deal = require('../../utils/deal.js');
const util = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    historyuuid: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    his_headline: "",
    his_body: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onUnload: function () {
      this.history.save(true);
    },
    modify_save: function () {
      if (this.data.his_body === "") {
        return;
      }
      let historyuuid = this.historyuuid;
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认保存修改吗？',
        success: function (res) { 
          if (res.confirm) {
            let historyList = utils_his.getHistoryListFromStorage();
            historyList.deleteHistory(historyuuid);
            that.history = new utils_his.History(that.data.his_body, that.data.his_headline);
            wx.redirectTo({
              url: `/pages/history_detail2/history_detail?historyuuid=${that.history.uuid}`,
            });
          }
        },
      })

    },
    headline_bindFormSubmit: function (e) {
      this.setData({
        his_headline: e.detail.value
      })
    },
    body_bindFormSubmit: function (e) {
      this.setData({
        his_body: e.detail.value
      })
    },
  },

  observers: {
    /**
     * 接收到uuid时，从缓存中获取该条历史记录
     */
    'historyuuid': function (historyuuid) {
      var textarea_height0;
      wx.getSystemInfo({
        success: function (res) {
          // 获取可使用窗口宽度
          let clientHeight = res.windowHeight;
          // 获取可使用窗口高度
          let clientWidth = res.windowWidth;
          // 算出比例
          let ratio = 750 / clientWidth;
          // 算出高度(单位rpx)
          textarea_height0 = clientHeight * ratio;
          // 设置高度
        }
      });
      this.historyuuid = historyuuid;
      this.history = new utils_his.History(wx.getStorageSync(historyuuid));
      this.setData({
        his_headline: this.history.headline,
        his_body: util.joinPassage(this.history.passageFragments),
        textarea_height: textarea_height0 - 450 + "rpx",
      });
    },
  }
})
