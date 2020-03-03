//search.js
var base64 = require("../../images/base64");
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    items: [{
      title: "Love is open.",
    }, {
      title: "mature love",
    }, {
      title: "Positive Meanings of Love",
    }, {
      title: "Love means having a responsibility",
    }]
  },
  onLoad: function () {
    this.setData({
      search: this.search.bind(this),
      icon: base64.icon20,
      slideButtons: [{
        src: '/images/tabbar_icon_recite_active.png', // icon的路径
      }, {
        src: '/images/icon_star.svg', // icon的路径
      }, {
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
  },
  search: function (value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([{ text: '搜索结果', value: 1 }, { text: '搜索结果2', value: 2 }])
      }, 200)
    })
  },
  selectResult: function (e) {
    console.log('select result', e.detail);
  }

});












