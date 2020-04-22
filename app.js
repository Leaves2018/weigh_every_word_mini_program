//app.js
App({
  globalData: {
    userInfo: null,
    openid: null,
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
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

    wx.cloud.init({
      env: "xingxi-p57mz",
      traceUser: true
    })

    // wx.setStorage({
    //   key: 'test_familiar',
    //   data: test_familiar_words,
    // })

    // wx.setStorage({
    //   key: 'test_vocabulary',
    //   data: test_vocabulary_words,
    // })
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


