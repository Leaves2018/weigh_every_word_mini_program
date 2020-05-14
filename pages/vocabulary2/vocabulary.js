const utilTrie = require('../../utils/trie2.js');
const utilWord = require('../../utils/word2.js');

const base64 = require("../../images/base64")
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 配置选项
   */
  options: {
    pureDataPattern: /^_/,
  },


  /**
   * 组件的初始数据
   */
  data: {
    showWordList: true,
    reciteDone: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      this.setData({
        search: this.search.bind(this),
        icon: base64.icon20,
        slideButtons: [{
          type: 'warn',
          text: '警示',
          extClass: 'test',
          src: '/images/icon_dui.svg', // icon的路径
        }],
      });
    },
    /**
     * 页面恢复到页面栈顶时，重新加载视图中单词列表数据
     */
    onShow: function() {
      this.setData({
        wordList: app.vocabularyTrie.getAllData(true), // 强制刷新
      })
    },
    /**
     * 页面离开页面栈时，缓存修改记录（仅保存Trie，不保存Array）
     */
    onUnload: function() {
      app.vocabularyTrie.save();
      app.familiarTrie.save();
    },
    /**
     * slideview点击方法：切换到单词详情视图，显示当前单词卡片
     */
    tapSlideView: function(e) {
      this.setData({
        _currentIndex: e.currentTarget.dataset.position,
      })
    },
    /**
     * slidebuttons点击方法：case0时从生词树删除当前单词，并添加到熟词树
     */
    tapSlideViewButtons: function(e) {
      var pos = e.currentTarget.dataset.position;
      switch (e.detail.index) {
        case 0:
          var _id = app.vocabularyTrie.getAllData()[pos];
          app.vocabularyTrie.deleteData(_id);
          app.vocabularyTrie.getAllData().splice(pos, 1);
          app.familiarTrie.insertData(_id);
          this.setData({
            wordList: app.vocabularyTrie.getAllData(),
          });
          break;
      }
    },
    /**
     * 搜索：将输入作为前缀搜索生词字典树
     */
    search: function(value) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(app.vocabularyTrie.findPrefix(value).map(ans => {
            return {
              text: ans
            };
          }));
        }, 200);
      })
    },
    /**
     * 搜索框聚焦：回到页面0位置处
     */
    searchFocus: function(e) {
      wx.pageScrollTo({
        scrollTop: 0,
      })
    },
    /**
     * 搜索框失去焦点：收起搜索结果显示
     */
    searchBlur: function(e) {
      this.setData({
        searchState: false,
      });
    },
    /**
     * 搜索框选择结果：页面滚动到选择结果位置
     */
    selectResult: function(e) {
      this.pageScrollToWord(e.detail.item.text);
    },
    /**
     * 页面滚动方法：滚动到指定的text所在位置
     */
    pageScrollToWord: function(text) {
      var indexHighlight = app.vocabularyTrie.getAllData().indexOf(text)
      this.setData({
        indexHighlight: indexHighlight,
      })
      const query = wx.createSelectorQuery();
      query.selectAll('.weui-slidecell').boundingClientRect();
      query.exec(res => {
        wx.pageScrollTo({
          scrollTop: res[0][indexHighlight].top - 100,
          duration: 300,
        });
      })
    },
    /**
     * 回到单词列表按钮点击方法
     */
    goBackToWordList: function (e) {
      this.setData({
        showWordList: true,
      })
      this.pageScrollToWord(this.data.thisWord);
    },
    /**
     * 左滑记得
     */
    swipeLeft: function (e) {
      let tempWord = app.vocabularyTrie.getAllData().splice(this.data._currentIndex, 1)[0]; // 从Array中删除（维护视图层）
      app.vocabularyTrie.deleteData(tempWord); // 从生词树删除
      app.familiarTrie.insertData(tempWord); // 添加到熟词树
      this.setData({
        wordList: app.vocabularyTrie.getAllData(), // 更新列表视图
        _currentIndex: this.data._currentIndex % app.vocabularyTrie.getAllData().length, // 由于数组变化，当前index无需变化
      })
    },
    /**
     * 右滑忘记
     */
    swipeRight: function (e) {
      // 还是生词，什么都不做；考虑记录频次
      this.setData({
        wordList: app.vocabularyTrie.getAllData(), // 更新列表视图
        _currentIndex: (this.data._currentIndex + 1) % app.vocabularyTrie.getAllData().length, // 取余，无限循环
      })
    },

  },

  /**
   * 数据监听器
   */
  observers: {
    'wordList': function(wordList) {
      // 设置wordList时触发，检测剩余数量是否不大于0
      if (wordList.length <= 0) {
        this.setData({
          showWordList: true,
          reciteDone: true,
        })
      }
    },
    '_currentIndex': function(currentIndex) {
      this.setData({
        showWordList: false,
        thisWord: app.vocabularyTrie.getAllData()[currentIndex],
        progressOverall: Math.round(currentIndex / app.vocabularyTrie.getAllData().length * 100),
      })
    },
  }
})