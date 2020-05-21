// pages/me2/me.js
const app = getApp();
const util = require('../../utils/util.js');
const utils_lc = require('../../utils/local_cloud.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    motto: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindViewTap: function () {
      // wx.navigateTo({
      //   url: '../logs/logs'
      // })
    },
    onLoad: function () {
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      } else if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }
      let upgradetime = wx.getStorageSync("upgradetime");
      if (upgradetime === '') {
        upgradetime = '暂无上传记录';
      }
      let motto = wx.getStorageSync("motto_for_yourself");
      if (motto === '') {
        motto = 'Hello World!';
      }
      this.setData({
        upgradetime: upgradetime,
        motto: motto,
      })
    },
    onShow: function () {
      // 如果第一次打开直接查看，这里是否会为空？
      // this.setData({
      //   vocabularyWordsLength: wx.getStorageSync('vocabularyWordsLength'),
      //   familiarWordsLength: wx.getStorageSync('familiarWordsLength'),
      // });
      
      // 由于已经使用了全局变量，可以每次动态获取而不是读其他页面缓存
      this.setData({
        vocabularyWordsLength: app.vocabularyTrie.number,
        familiarWordsLength: app.familiarTrie.number,
      })
      
    },
    getUserInfo: function (e) {
      console.log(e)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    },
    uploadfiles: function() {
      wx.showLoading({
        title: '加载中',
        duration: 3000
      });
      utils_lc.local_to_cloud();
      let datetime = parseInt(util.formatTime(new Date()).substring(11, 13));
      let condition;
      if (datetime < 12) {
        condition = '上午';
      } else if (datetime < 18) {
        condition = '下午';
      } else {
        condition = '晚上';
      }
      let upgradetime = '上次更新，今天'+condition+datetime+'点';
      wx.setStorage({
        key: 'upgradetime',
        data: upgradetime,
      })
      this.setData({
        upgradetime: upgradetime,
      })
    },
    downloadfiles: function () {
      wx.showLoading({
        title: '加载中',
        duration: 3000
      });
      utils_lc.cloud_to_local();
    },
    mottochange: function(e) {
      wx.setStorage({
        key: 'motto_for_yourself',
        data: this.data.motto,
      })
      this.setData({
        motto: e.detail.value
      })
    },
  }
})
