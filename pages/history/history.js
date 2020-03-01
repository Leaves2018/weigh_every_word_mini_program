//search.js

var base64 = require("../../images/base64");
Page({
  data: {
    items: [{
      name: "Love is open.",
    }, {
      name: "Positive Meanings of Love",
    }, {
      name: "Love means having a responsibility",
    }]
  },

  onLoad: function () {
    this.setData({
      icon: base64.icon20,
      slideButtons: [{
        src: '/images/tabbar_icon_recite_active.png', // icon的路径
      }, {
        extClass: 'test',
        src: '/images/icon_star.svg', // icon的路径
      }, {
        extClass: 'test',
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
  }
});












