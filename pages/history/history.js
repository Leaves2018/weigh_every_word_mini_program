//search.js
const utils_his = require('../../utils/history.js');
var base64 = require("../../images/base64");
var number;
var history_list;
var history_done_list;
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    mHidden: true,
    his_list: [],
    iconType: []
  },
  onLoad: function () {
  },
  onShow: function() {
    history_list = utils_his.getHistoryListFromStorage();
    history_list.reverse();
    history_done_list = utils_his.getHistoryListDoneFromStorage();
    var iconlist = [];
    for (var element of history_done_list) {
      for (var i = 0; i < history_list.length; i++) {
        if (element === history_list[i]) {
          iconlist[i] = 'success';
          break;
        }
        iconlist[i] = 'cancel';
      }
    }

    this.setData({
      his_list: history_list,
      iconType:iconlist,
      search: this.search.bind(this),
      icon: base64.icon20,
      slideButtons: [{
        src: '/images/tabbar_icon_recite_active.png', // icon的路径
      }, {
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },
  slideButtonTap(e) {
    number = e.currentTarget.dataset.position;
    //console.log(number);
    switch (e.detail.index) {
      case 0:
        var history_list = utils_his.getHistoryListFromStorage();
        history_list.reverse();
        //console.log(history_list);
        let his_recite = history_list[number];
        wx.setStorage({
          key: 'reciteInfo',
          data: {
            type: 'history',
            headline: his_recite,
          },
          success: function () {
            wx.navigateTo({
              url: '/pages/recite/recite',
            });
          }
        })
        break;
      case 1:
        this.setData({
          mHidden: false
        });
        break;
    }
  },

  modalconfirm: function () {
    //console.log(number);
    var history_list = utils_his.getHistoryListFromStorage();
    history_list.reverse();
    //console.log(history_list);
    let del_his = history_list[number];
    history_list.splice(number,1);
    //console.log(history_list);
    utils_his.setHistoryListInStorage(history_list);
    wx.removeStorage({
      key: del_his,
      success: function(res) {
        //console.log(res);
      },
    })
    this.setData({
      his_list: history_list,
      mHidden: true,
    });
  },
  modalcancel: function () {
    this.setData({
      mHidden: true,
    });
  },
  buttonnavigate: function (e) {
    number = e.currentTarget.dataset.position;
    //console.log(number);
    var history_list = utils_his.getHistoryListFromStorage();
    history_list.reverse();
    //console.log(history_list);
    let his_detail = history_list[number];
    wx.setStorage({
      key: 'history_detail',
      data: his_detail,
    })
    wx.navigateTo({
      url: '/pages/history_detail/history_detail',
    })
  },

  search: function (value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([{ text: '搜索结果', value: 1 }, { text: '搜索结果2', value: 2 }])
      }, 200)
    })
  },
  selectResult: function (e) {
    //console.log('select result', e.detail);
  }

});




