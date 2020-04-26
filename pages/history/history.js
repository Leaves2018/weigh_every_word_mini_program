//search.js
const utils_his = require('../../utils/history.js');
const utils_trie = require('../../utils/trie.js');
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
    var this_headline;
    var this_done;
    let test = wx.getStorage({
      key: 'recite_Info',
      success: function(res) {
        this_headline = res.data.headline;
        this_done = res.data.done;
        var temp;
        let history_list_temp = utils_his.getHistoryListFromStorage();
        for (var i = 0; i < history_list_temp.length; i++) {
          if (history_list_temp[i] == this_headline) {
            temp = i;
          }
        }
        if (this_done) {
          let history_done_list = utils_his.getHistoryListDoneFromStorage();
          history_done_list.splice(temp, 1, 'success');
          utils_his.setHistoryListDoneInStorage(history_done_list);
        }
      },
    })
    
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
          key: 'recite_info',
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
    history_done_list.reverse();
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
        var hl_temp = history_list.filter(function (x) {
          if (x.indexOf(value)!==-1) {
            return true;
          };
        });
        if (value.length!==0) {
          resolve(hl_temp.map(ans => {
            return { text: ans };
          })); 
        }
      }, 200);
    })
  },

  searchFocus: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  
  searchBlur: function (e) {
    console.log("In searchBlur()," + e);
    this.setData({
      searchState: false,
    });

  },
  selectResult: function (e) {
    console.log('select result: ', e.detail.item.text);
    var indexHighlight = history_list.indexOf(e.detail.item.text);
    this.setData({
      indexHighlight: indexHighlight,
    })
    const query = wx.createSelectorQuery();
    query.selectAll('.history-slidecell').boundingClientRect();
    query.exec(res => {
      wx.pageScrollTo({
        scrollTop: res[0][indexHighlight].top-100,
        duration: 300,
      });
    })
  },
  tapTestButton: function (e) {
    var query = wx.createSelectorQuery();
    console.log("In tapTestButton(),")
    console.log(e);
    query.selectAll('.weui-slidecell').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      console.log(res[0])       // #the-id节点的上边界坐标
      console.log(res[1].scrollTop) // 显示区域的竖直滚动位置
    })
  }

});




