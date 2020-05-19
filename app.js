//app.js
App({
  globalData: {
    userInfo: null,
    openid: null,
    todayArticle:'',
  },
  onLaunch: function () {
    // 展示本地存储能力
    wx.cloud.init({
      env: "xingxi-p57mz",
      traceUser: true
    })
    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    const utilTrie = require('./utils/trie2.js');
    this.familiarTrie = utilTrie.getFamiliarTrie();
    this.vocabularyTrie = utilTrie.getVocabularyTrie();
    this.getOpenid();
    this.getWindowSize();
    this.clipboardData = '';
  },
  onShow: function() {
    var that = this;
    wx.getClipboardData({
      success(res) {
        if (that.clipboardData === res.data) {
          return;
        } else {
          that.clipboardData = res.data;
          wx.showModal({
            title: '是否录入当前剪贴板信息？',
            content: res.data,
            success: function (res1) {
              if (res1.confirm) {
                //点击确定
                wx.setStorage({
                  key: 'input_passage_information',
                  data: [res.data],
                  success: (res) => {
                    wx.navigateTo({
                      url: '/pages/draft/draft',
                    })
                  }
                })
              }
            },
          })
        }
      }
    })
  },
  onHide: function() {
    console.log("App onHide() called")
    this.familiarTrie.save();
    this.vocabularyTrie.save();
    wx.setStorage({
      key: 'last_num_of_words',
      data: this.familiarTrie.getAllData(true).length + this.vocabularyTrie.getAllData(true).length,
    })
    const util = require('./utils/util.js');
    wx.setStorage({
      key: 'last_launch_date',
      data: util.formatTime(new Date()).substring(0, 10),
    })
  },
  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenId',
      complete: res => {
        that.globalData.openid = res.result.openid;
      }
    })
  },
  getWindowSize() {
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.windowHeight = res.windowHeight;
        that.globalData.windowWidth = res.windowWidth;
        that.globalData.pixelRatio = res.pixelRatio;
      },
    })
  },
  towxml: require('/towxml/index'),
})


