//search.js
const utils_his = require('../../utils/history.js');
var base64 = require("../../images/base64");
var number;
Page({
  data: {
    his_headline:"",
    his_body:[],
    his_vocabulary:[],
    his_unknown:[],
    his_date:""
  },
  onLoad: function () {
    var history_choice = wx.getStorageSync('history_choice');
    var history_example = utils_his.getHistoryFromStorage(history_choice);
    this.setData({
      his_headline: history_example.headline,
      his_body: history_example.body,
      his_vocabulary: history_example.vocabulary,
      his_unknown: history_example.unknown,
      his_date: history_example.date,
    });
  },

});




