// 测试输入文本
var test_text = "In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.\n‘Whenever you feel like criticizing any one, ’ he told me, ‘just remember that all the people in this world haven’t had the advantages that you’ve had.’\nHe didn’t say any more but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.In consequence I’m inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon—for the intimate revelations of young men or at least the terms in which they express them are usually plagiaristic and marred by obvious suppressions.Reserving judgments is a matter of infinite hope.I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat a sense of the fundamental decencies is parcelled out unequally at birth."

// 测试熟词
var test_familiar_words = ['horizon', 'intimate', 'sleep', 'curious', 'politician', 'remember', 'marred', 'since', 'whenever', 'years', 'father', 'hostile', 'sign', 'men', 'person', 'secret', 'reserving', 'matter', 'plagiaristic', 'mind', 'feigned', 'reserve', 'unequally', 'sense', 'snobbishly', 'decencies', 'usually', 'attach', 'afraid', 'confidences', 'vulnerable', 'one', 'accused', 'deal', 'repeat', 'birth', 'consequence', 'suggested', 'griefs', 'understood', 'way', 'something', 'express', 'still', 'unjustly', 'gave', 'parcelled', 'detect', 'meant', 'hope', 'obvious', 'always', 'advice', 'great', 'ever', 'unmistakable', 'like', 'turning', 'unknown', 'unusually', 'quivering', 'suppressions', 'people', 'little', 'young', 'realized', 'opened', 'say', 'revelation', 'world', 'quality', 'levity', 'preoccupation', 'wild', 'revelations', 'least', 'advantages', 'veteran', 'frequently', 'privy', 'abnormal', 'made', 'victim', 'natures', 'quick', 'college', 'appears', 'infinite', 'habit', 'criticizing', 'communicative', 'inclined', 'terms', 'forget', 'reserved', 'told', 'judgments']

// 测试生词
var test_vocabulary_words = ['consequence', 'privy', 'unjustly', 'griefs', 'feigned', 'levity', 'unmistakable', 'hostile', 'plagiaristic', 'quivering']

// 测试未知词
var test_unknown_words = ['bores', 'normal', 'fundamental', 'unsought', 'younger', 'missing', 'many', 'came', 'feel', 'also']

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

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
  globalData: {
    userInfo: null
  }
})


