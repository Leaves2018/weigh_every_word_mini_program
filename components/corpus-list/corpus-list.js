// components/corpus-list/corpus-list.js
const app = getApp();
const util = require('../../utils/util.js');
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
          let corpusList = res.result.data[0]
          let corpusTimeList = corpusList.map(x => new Date(x.time).toLocaleString());
          console.log(corpusList)
          // 抽取每条搜索结果的正文内容中包括目标单词word的句子，并用**标记（表示加粗）
          let sentences = corpusList.map(x => util.findTheSentenceWhereTheWordIs(x.body, word));
          let markdownSentences = sentences.map(x => tomd.markText(x, word, '**'));
          that.setData({
            corpusSentenceList: markdownSentences.map(x => app.towxml(`*${x}*`, 'markdown')),
            corpusList,
            corpusTimeList,
          })
        },
        fail(err) {
          console.error(JSON.stringify(err))
        }
      })
    },
  }
})
