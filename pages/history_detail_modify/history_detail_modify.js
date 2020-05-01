//search.js
const utils_his = require('../../utils/history.js');
const utils_tomd = require('../../utils/tomd.js');
const util_word = require('../../utils/word2.js');
const util_trie = require('../../utils/trie.js');
const utils_deal = require('../../utils/deal.js');
const app = getApp();
function history(headline, body, vocabulary, unknown, date) {
  this.headline = headline;
  this.body = body;
  this.vocabulary = vocabulary;
  this.unknown = unknown;
  this.date = date;
}
var history_example;
var before_headline;
var before_body;
Page({
  data: {
    his_headline: "",
    his_body: "",
  },
  onLoad: function () {
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
    var history_detail = wx.getStorageSync('history_detail');
    history_example = utils_his.getHistoryFromStorage(history_detail);
    before_headline = history_example.headline;
    before_body = history_example.body;
    this.setData({
      his_headline: history_example.headline,
      his_body: history_example.body.join(' '),
      textarea_height: textarea_height0 -450 + "rpx",
    });
  },
  modify_save: function () {
    if (this.data.his_body === "") {
      return;
    }
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认保存修改吗？',
      success: function (res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          //点击确定
          wx.removeStorage({
            key: before_headline,
            success: function (res) {
              //console.log(res);
            },
          })
          var history_list = utils_his.getHistoryListFromStorage();
          var temp;
          for (var i = 0; i < history_list.length; i++) {
            if (history_list[i] == before_headline) {
              temp = i;
            }
          }
          history_list.splice(temp, 1, that.data.his_headline);
          utils_his.setHistoryListInStorage(history_list);

          let headline = utils_deal.deal_passageWithHeadline(that.data.his_headline, that.data.his_body);

          let history_example_temp = utils_his.getHistoryFromStorage(headline);
          if (history_example_temp.vocabulary.length === 0 && history_example_temp.unknown.length === 0) {
            let history_done_list = utils_his.getHistoryListDoneFromStorage();
            history_done_list.splice(temp, 1, 'success');
            utils_his.setHistoryListDoneInStorage(history_done_list);
          }
          
          wx.setStorage({
            key: 'history_detail',
            data: headline,
          })
          wx.redirectTo({
            url: '/pages/history_detail/history_detail',
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
});




