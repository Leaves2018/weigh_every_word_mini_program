// components/word-card/word-card.js
const utilWord = require('../../utils/word2.js')
const util = require('../../utils/tomd.js')
const app = getApp();
const db = wx.cloud.database({
  env: 'xingxi-p57mz'
})
const dictionaryQueryRecord = db.collection('dictionary_query_record');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    word: {
      type: String,
      value: "",
    },
    showFront: {
      type: Boolean,
      value: true,
    },
    detail: {
      type: String,
      value: "",
    },
    autoplayAudio: {
      type: Boolean,
      value: true,
    },
    showButtons: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    wordcard: {}, // 用于展示在页面上的单词数据
    showTranslation: true,
  },

  /**
   * 选项
   */
  options: {
    styleIsolation: 'isolated',
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      // this.setData({
      //   wordCardHeight: app.globalData.windowHeight * 0.618,
      // })
    },
    detached: function() {
      // console.log('word-card detached')
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    scrollToItem: function(res) {
      console.log('In word-card, selector=' + res.selector)
    },
    /**
     * 播放单词音频
     */
    playAudio: function() {
      if (!(this.original || this.front)) {
        this.setData({
          front: true,
          autoplayAudio: true,
        })
      } else {
        this.original.playAudio();
      }
    },
    /**
     * 中英文解释切换
     */
    ecSwitch: function() {
      this.setData({
        showTranslation: !this.data.showTranslation,
      })
    },

    /**
     * 翻转卡片
     */
    flipCard: function() {
      if (this.data.detail === '') return; // 如果detail为空，则不允许翻面
      var that = this;
      this.animate('.word-card', [{
          opacity: 1.0
        },
        {
          opacity: 0.5,
        },
        {
          opacity: 0.0,
        }
      ], 500, function() {
        that.setData({
          front: !this.data.front,
        });
        that.animate('.word-card', [{
          opacity: 0.0,
        }, {
          opacity: 0.5,
        }, {
          opacity: 1.0,
        }], 500, function() {
          that.clearAnimation('.wordcard', {
            opacity: true,
            rotate: true
          }, function() {
            console.log("清除了.wordcard上的opacity和rotate属性")
          })
        }.bind(that))
      }.bind(this))
    },
    /**
     * 按钮点击方法
     */
    buttonTap: function buttonTap(e) {
      var index = e.currentTarget.dataset.index;

      this.triggerEvent('buttontap', {
        index: index,
        item: this.data.buttons[index]
      }, {});
    },
  },

  /**
   * 数据监听器
   */
  observers: {
    'word': function(word) { // 新word设置时触发
      if (word) { // 检测新word不为空
        if (this.data.showFront) { // 且要求显示正面，则触发front监听器请求数据
          this.setData({
            front: true, // 手动触发front的observer
          })
        } else { // 要求显示背面时，仅设置单词ID（例句已通过property自动赋值）
          this.setData({
            wordcard: {
              _id: this.data.word
            },
          })
        }
      }
    },
    'front': function(front) { // 要求显示正面
      if (front) {
        if (this.data._hasFront && this.original._id === this.data.word) { // 如果有正面，而且word没有赋新值，直接加载原有数据
          if (this.data.autoplayAudio) {
            this.original.playAudio();
          }
        } else { // 否则查询新word再赋值          
          var that = this;
          utilWord.getWord(that.data.word).then(wordRes => {
            that.original = wordRes;
            that.setData({
              _hasFront: true, // 现在有正面了
              wordcard: that.original,
              definitionKeys: Object.keys(that.original.definition),
              translationKeys: Object.keys(that.original.translation),
            })
            if (that.data.autoplayAudio) {
              that.original.playAudio();
            }
          })
          // 仅当第一次要求显示单词正面时，认为查询了一次词典
          console.log('添加查询记录成功')
          dictionaryQueryRecord.add({
            data: {
              wordid: that.data.word,
              timestamp: new Date().valueOf()
            }
          })
        }
      }
    },
    'detail': function(detail) { // 转为html格式再赋值
      if (detail) {
        let word = this.data.word;
        // detail = detail.replace(new RegExp(word, 'gi'), `<b>&nbsp;${word}</b>`)
        // let htmlDetail = `<div class="div_class">
        // <p class="p">&nbsp;<i>${detail}</i>&nbsp;</p>
        // </div>`;
        // console.log(htmlDetail)
        let that = this;
        wx.cloud.callFunction({
          name: 'mysqlDatabase',
          data: {
            action: 'searchCorpusByWord',
            word: word,
          },
          success(res) {
            console.log(JSON.stringify(res.result.data[0]))
            let bodies = res.result.data[0].map(x => x.body);
            let markedBodies = bodies.map(x => util.markText(x, word, '**'));
            that.setData({
              wxmlDetails: markedBodies.map(x => app.towxml(`*${x}*`, 'markdown'))
            })
          },
          fail(err) {
            console.error(JSON.stringify(err))
          }
        })
        // detail = util.markText(detail, word, '**');
        // this.setData({
        //   wxmlDetail: app.towxml(`*${detail}*`, 'markdown'),
        // })
      }
    }
  },
})