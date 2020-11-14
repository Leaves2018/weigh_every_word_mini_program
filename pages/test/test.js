// pages/test/test.js
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    connectDatabase(e) {
      wx.cloud.callFunction({
        name: 'mysqlDatabase',
        data: {
          action: 'addText',
          title: 'My name is Ritian Zhao.',
          body: 'My duty is to make a new world.'
        },
        success(res) {
          console.log(JSON.stringify(res))
        },
        fail(err) {
          console.error(JSON.stringify(err))
        }
      })
    },
    searchDatabase(e) {
      let that = this;
      wx.cloud.callFunction({
        name: 'mysqlDatabase',
        data: {
          action: 'searchCorpusByWord',
          word: 'test'
        },
        success(res) {
          console.log(JSON.stringify(res.result.data[0]))
          that.setData({
            databaseResult: res.result.data[0]
          })
        },
        fail(err) {
          console.error(JSON.stringify(err))
        }
      })
    }

  }
})
