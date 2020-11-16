// components/corpus-list/corpus-list.js
const app = getApp();
const tomd = require('../../utils/tomd.js');
const base64 = require("../../images/base64")
const db = wx.cloud.database({
  env: 'xingxi-p57mz'
});
const corpusQueryRecord = db.collection('corpus_query_record');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    word: {
      type: String,
      value: "",
    },
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

  },

  /**
   * 数据监听器
   */
  observers: {
    // 传入或设置word参数时触发
    'word': function(word) { 
      let that = this;
      // 调用云函数mysql，进行语料库搜索
      wx.cloud.callFunction({
        name: 'mysql',
        data: {
          action: 'searchCorpusByWord',
          word,
        },
        // 搜索成功，将返回内容显示到视图中
        success(res) {
          // 打印语料库搜索结果
          console.log(JSON.stringify(res.result.data[0]))
          that.corpusList = res.result.data[0]
          // 抽取每条搜索结果的正文内容，并用**进行标记
          that.markdownBodies = that.corpusList.map(x => tomd.markText(x.body, word, '**'));
          console.log(that.markdownBodies)
          let wxmlBodies = that.markdownBodies.map(x => app.towxml(`${x}`, 'markdown'));
          console.log(JSON.stringify(wxmlBodies))
          that.setData({
            wxmlBodies,
          })
        },
        fail(err) {
          console.error(JSON.stringify(err))
        }
      })
    },
  }
})
