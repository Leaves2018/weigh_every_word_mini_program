//app.js
App({
  globalData: {
    userInfo: null,
    openid: null,
    todayArticle:'',
  },
  onLaunch: function () {
    var launch_message = wx.getLaunchOptionsSync();
    let todayArticle = launch_message.query.filename;
    wx.setStorage({
      key: 'todayArticleAddress',
      data: todayArticle,
    });
    // 展示本地存储能力
    wx.cloud.init({
      env: "xingxi-p57mz",
      traceUser: true
    })
    this.getOpenid();
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
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
    const utilWord = require('./utils/word2.js');
    this.familiarTrie = utilWord.getFamiliar();
    console.log("FBI,open the door")
    this.vocabularyTrie = utilWord.getVocabulary();
    const utilHistory = require('./utils/history.js');
    this.hisotryList = utilHistory.getHistoryListFromStorage();
  },
  onHide: function() {
    const utilWord = require('./utils/word2.js');
    utilWord.setFamiliar();
    utilWord.setVocabulary();
    this.hisotryList.save();
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
  towxml: require('/towxml/index'),
})


