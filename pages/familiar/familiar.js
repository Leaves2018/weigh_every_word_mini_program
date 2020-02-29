var base64 = require("../../images/base64");
Page({
  data: {
    words: [{
      name: "weigh",
      chinese: "称量"
    }, {
      name: "every",
      chinese: "每一个"
    }, {
      name: "word",
      chinese: "单词"
    }]
  },
  onLoad: function () {
    this.setData({
      icon: base64.icon20,
      slideButtons: [{
        text: '普通',
        src: '/images/icon_love.svg', // icon的路径
      }, {
        text: '普通',
        extClass: 'test',
        src: '/images/icon_star.svg', // icon的路径
      }, {
        type: 'warn',
        text: '警示',
        extClass: 'test',
        src: '/images/icon_del.svg', // icon的路径
      }],
    });
  },
  slideButtonTap(e) {
    console.log('slide button tap', e.detail)
  }
});