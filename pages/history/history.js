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
    history_done_list.reverse();
    this.setData({
      his_list: history_list,
      iconType: history_done_list,
      search: this.search.bind(this),
      icon: base64.icon20,
      slideButtons: [{
        src: '/images/tabbar_icon_recite_active.png', // icon的路径
      }, {
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },
  //进行背诵和删除历史记录
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

  //确认删除
  modalconfirm: function () {
    //console.log(number);
    let history_list = utils_his.getHistoryListFromStorage();
    history_list.reverse();
    //console.log(history_list);
    let del_his = history_list[number];
    history_list.splice(number,1);
    //console.log(history_list);
    history_list.reverse();
    utils_his.setHistoryListInStorage(history_list);
    wx.removeStorage({
      key: del_his,
      success: function(res) {
        //console.log(res);
      },
    })
    let history_done_list = utils_his.getHistoryListDoneFromStorage();
    history_done_list.reverse();
    history_done_list.splice(number, 1);
    history_done_list.reverse();
    utils_his.setHistoryListDoneInStorage(history_done_list);
    history_list.reverse();
    this.setData({
      his_list: history_list,
      iconType: history_done_list,
      mHidden: true,
    });
  },
  //取消删除
  modalcancel: function () {
    this.setData({
      mHidden: true,
    });
  },
  //查看文章详情
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




