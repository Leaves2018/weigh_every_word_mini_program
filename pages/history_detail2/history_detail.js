// pages/history_detail2/history_detail.js
const utilsHis = require('../../utils/history.js');
const utilsTomd = require('../../utils/tomd.js');
const utilsWord = require('../../utils/word2.js');
const utilsTrie = require('../../utils/trie2.js');
const utilsDeal = require('../../utils/deal.js');
const util = require('../../utils/util.js');
const app = getApp();

const wxss = {
  fa: {
    "border": "none"
  },
  vo: {
    "background": "rgba(2, 194, 97);"
  },
  un: {
    "background": "rgb(255, 196, 107)"
  },
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    historyuuid: {
      type: String,
      value: ''
    },
    storageKey: {
      type: String,
      value: ''
    },
    showallwords: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialogShow: false,
    his_headline: '',
    numberOfUn: 0,
    numberOfVo: 0,
    reciteWords: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      wx.setNavigationBarTitle({
        title: '详情',
      })
      let that = this;
      // 获取系统信息
      wx.getSystemInfo({
        success: function(res) {
          // 获取可使用窗口宽度
          let clientHeight = res.windowHeight;
          // 获取可使用窗口高度
          let clientWidth = res.windowWidth;
          // 算出比例
          let ratio = 750 / clientWidth;
          // 算出高度(单位rpx)
          let height = clientHeight * ratio;
          // 设置高度
          that.setData({
            passage_height: height - 160 + "rpx",
          });
        }
      });
    },
    //将修改存至本地
    onUnload: function() {
      if (this.before_headline !== this.data.his_headline){
        this.history = new utilsHis.History(this.history, this.data.his_headline);
      }
      this.history.save(true); 
      app.familiarTrie.save();
      app.vocabularyTrie.save();
    },

    //背诵
    showallvowords: function() {
      wx.showLoading({
        title: '加载中',
      })
      let vocabularytemp = [];
      let allWords = this.history.words;
      for (let _id in allWords) {
        let word = allWords[_id];
        switch (word.tag) {
          case 'vo':
            vocabularytemp.push({
              '_id': _id,
              'tag': word.tag,
              'location': word.location.split('.'),
            });
            break;
        }
      }
      this.setData({
        recitePassageFragments: this.history.passageFragments,
        reciteWords: vocabularytemp,
        reciteShow: true,
      })
    },
    showallunwords: function() {
      wx.showLoading({
        title: '加载中',
      })
      let unknowntemp = [];
      let allWords = this.history.words;
      for (let _id in allWords) {
        let word = allWords[_id];
        switch (word.tag) {
          case 'un':
            unknowntemp.push({
              '_id': _id,
              'tag': word.tag,
              'location': word.location.split('.'),
            });
            break;
        }
      }
      this.setData({
        recitePassageFragments: this.history.passageFragments,
        reciteWords: unknowntemp,
        reciteShow: true,
      })
    },
    headline_bindFormSubmit: function(e) {
      this.setData({
        his_headline: e.detail.value
      })
    },
    tapWord: function(e) {
      if (/^[A-Za-z]+[\-\']?[a-zA-Z]+$/.test(e.detail.text)) {
        this.deal_word = e.detail.text;
        this.deal_word_location = e.detail.location;
        let [para, sent] = e.detail.location.split('.');

        this.setData({
          dialogContent: this.deal_word,
          dialogShow: true,
        })
      }
    },
    longpressword: function(e) {
      console.log(e);
      wx.redirectTo({
        url: `/pages/deal_input2/deal_input?uuid_para_sent=${this.data.historyuuid + '!!!' + e.detail.para+'!!!'+e.detail.sent}`,
      })
    },

    /**
     * “忘记”和“记得”按钮的处理逻辑
     * 同时接收word-card-dialog和recite两个组件的调用
     * 
     */
    dealRememberAndForget(e) {
      // console.log("In history_detail, dealRememberAndForget() is called")
      console.log(e)
      let key = e.detail._id;
      let word = this.history.words[key];
      switch (e.detail.index) {
        case 0:
          if (word === undefined) {
            this.history.words[key] = new utilsHis.Word('vo', this.deal_word_location);
          } else if (word.tag === 'vo') {
            break;
          } else if (word.tag === 'un') {
            this.numberOfUn -= 1;
          }
          app.vocabularyTrie.insertData(key);
          app.familiarTrie.deleteData(key);
          this.history.words[key].tag = 'vo';
          this.numberOfVo += 1;
          break;
        case 1:
          if (word === undefined || word.tag === 'fa') {
            break;
          } else if (word.tag === 'vo') {
            this.history.plus += 1;
            this.numberOfVo -= 1;
          } else {
            this.history.plus += 1;
            this.numberOfUn -= 1;
          }
          app.familiarTrie.insertData(key);
          app.vocabularyTrie.deleteData(key);
          word.tag = 'fa';
          break;
        default:
          app.familiarTrie.deleteData(key);
          app.vocabularyTrie.deleteData(key);
          word.tag = 'un';
      }
      this.setData({
        thisword: {
          word: key.toLowerCase(), // 转小写再标记（class名已全转小写）
          style: this.history.words[key] ? wxss[this.history.words[key].tag] : wxss.fa, // 如果history.words没有记录，则认为是熟词
        },
        dialogShow: false,
        numberOfUn: this.numberOfUn,
        numberOfVo: this.numberOfVo,
      })
    },
    // dealRememberAndForget(index, key, location=this.history.words[key].location) {
    //   let word = this.history.words[key];
    //   switch (index) {
    //     case 0:
    //       if (word === undefined) {
    //         this.history.words[key] = new utilsHis.Word('vo', location);
    //       } else if (word.tag === 'vo') {
    //         break;
    //       }
    //       app.vocabularyTrie.insertData(key);
    //       app.familiarTrie.deleteData(key);
    //       this.history.words[key].tag = 'vo';
    //       break;
    //     case 1:
    //       if (word === undefined || word.tag === 'fa') {
    //         break;
    //       } else {
    //         this.history.plus += 1;
    //       }
    //       app.familiarTrie.insertData(key);
    //       app.vocabularyTrie.deleteData(key);
    //       word.tag = 'fa';
    //       break;
    //     default:
    //       app.familiarTrie.deleteData(key);
    //       app.vocabularyTrie.deleteData(key);
    //       word.tag = 'un';
    //   }
    //   this.setData({
    //     thisword: {
    //       word: this.deal_word,
    //       style: this.history.words[key] ? wxss[this.history.words[key].tag] : wxss.fa, // 如果history.words没有记录，则认为是熟词
    //     },
    //     dialogShow: false,
    //   })
    // },
    /**
     * 响应对话框按钮的点击方法
     */
    tapDialogButton: function(e) {
      console.log("In tapDialogButton(), e=" + e)
      this.dealRememberAndForget({
        index: e.detail.index,
        key: e.detail._id,
        location: this.deal_word_location,
      });
    },
    /**
     * 响应recite组件按钮的点击方法
     */
    tapReciteButton: function(e) {
      let index = e.detail.index;
      let _id = e.detail._id;
      this.dealRememberAndForget({
        index: index,
        key: _id
      })
    },
  },

  observers: {
    /**
     * 接收到uuid时，从缓存中获取该条历史记录
     */
    'historyuuid': function(historyuuid) {
      console.log(`historyuuid: ${historyuuid}`);
      this.history = new utilsHis.History(wx.getStorageSync(historyuuid));
      var passage = util.joinPassage(this.history.passageFragments);
      var vocabulary = [];
      var unknown = [];
      this.numberOfUn = 0;
      this.numberOfVo = 0;
      for (let word in this.history.words) {
        switch (this.history.words[word].tag) {
          case 'vo':
            vocabulary.push(word);
            this.numberOfVo += 1;
            break;
          case 'un':
            unknown.push(word);
            this.numberOfUn += 1;
            break;
        }
      }
      this.before_headline = this.history.headline;
      // 页面第一次渲染
      this.setData({
        passage: passage,
        highlight: [{
          words: unknown,
          style: wxss.un,
        }, {
          words: vocabulary,
          style: wxss.vo,
        }],
        his_headline: this.history.headline,
        numberOfUn: this.numberOfUn,
        numberOfVo: this.numberOfVo,
      })
    },
    'storageKey': function (storageKey) {
      var that = this;
      if (storageKey) {
        wx.getStorage({
          key: storageKey,
          success: function (res) {
            that.history = new utilsHis.History(wx.getStorageSync(res.data));
            var passage = util.joinPassage(that.history.passageFragments);
            var vocabulary = [];
            var unknown = [];
            that.numberOfUn = 0;
            that.numberOfVo = 0;
            for (let word in that.history.words) {
              switch (that.history.words[word].tag) {
                case 'vo':
                  vocabulary.push(word);
                  that.numberOfVo += 1;
                  break;
                case 'un':
                  unknown.push(word);
                  that.numberOfUn += 1;
                  break;
              }
            }
            that.before_headline = that.history.headline;
            // 页面第一次渲染
            that.setData({
              passage: passage,
              highlight: [{
                words: unknown,
                style: wxss.un,
              }, {
                words: vocabulary,
                style: wxss.vo,
              }],
              his_headline: that.history.headline,
              numberOfUn: that.numberOfUn,
              numberOfVo: that.numberOfVo,
            })
          },
        })
      }
    },
    'showallwords': function (showallwords) {
      if (showallwords){
        this.showallunwords();
      }
    }
  }
})