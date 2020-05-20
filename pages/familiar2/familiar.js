const utilWord = require('../../utils/word2.js');
const utilTrie = require('../../utils/trie2.js');

const base64 = require("../../images/base64");
const app = getApp();

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
    buttons: [{
      text: "忘了"
    }, {
      text: "记得"
    }],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      wx.setNavigationBarTitle({
        title: '熟词本',
      })
      // 每次取树的一个子节点创建新树，利用新树的getAllData()方法获取首字母相同的单词数组
      // 考虑封装到Trie类结构中，或者修改Trie的定义
      // 在这里设计刷新app.familiarTrie的allData和number属性
      this.initials = [];
      this.familiarWordList = [];
      app.familiarTrie.allData = [];
      // 遍历第一层子节点（单词首字母）
      for (let key in app.familiarTrie.root.children) {
        this.initials.push(key); // 记录首字母数组
        let tempData = app.familiarTrie.findPrefix(key);
        this.familiarWordList.push(tempData); // 前缀查找，获取同样该首字母开头的所有单词
        app.familiarTrie.allData = app.familiarTrie.allData.concat(tempData); // 分多次填充allData（而不是用getAllData）
      }
      app.familiarTrie.number = app.familiarTrie.allData.length; // 校正单词数目
      this.setData({
        search: this.search.bind(this),
        initials: this.initials,
        wordList: this.familiarWordList,
      });
    },
    /**
     * 页面卸载时，保存修改记录
     */
    onUnload: function() {
      app.vocabularyTrie.save();
      app.familiarTrie.save();
    },

    /**
     * 搜索框：前缀查找
     */
    search: function(value) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(app.familiarTrie.findPrefix(value).map(ans => {
            return {
              text: ans
            };
          }));
        }, 200);
      });
    },
    /**
     * 搜索框聚焦：滚动到0位置
     */
    searchFocus: function(e) {
      wx.pageScrollTo({
        scrollTop: 0,
      })
    },
    /**
     * 搜索框失去焦点：收起搜索结果
     */
    searchBlur: function(e) {
      this.setData({
        searchState: false,
      });
    },
    /**
     * 搜索框选择结果：滚动到选择结果位置
     */
    selectResult: function(e) {
      let tempword = e.detail.item.text;
      let currentInitialIndex = this.initials.indexOf(tempword[0]);
      let currentWordIndex = this.familiarWordList[currentInitialIndex].indexOf(tempword);
      this.setData({
        initialHighlight: currentInitialIndex,
        indexHighlight: currentWordIndex,
      })
      // 通过首字母大致定位，然后根据单词在首字母中的坐标以及单词view所占高度计算具体位置
      const query = wx.createSelectorQuery();
      query.selectAll('.initial').boundingClientRect();
      query.selectAll('.item').boundingClientRect();
      query.exec(res => {
        console.log(res);
        wx.pageScrollTo({
          scrollTop: res[0][currentInitialIndex].top + res[1][0].height * Math.floor(currentWordIndex / 3) - 100,
          duration: 300,
        })
      })
    },
    /**
     * 显示单词卡片
     */
    showWordCard: function(e) {
      [this.currentInitialIndex, this.currentWordIndex] = e.currentTarget.dataset.position.split('.');
      let _id = this.familiarWordList[this.currentInitialIndex][this.currentWordIndex];
      this.setData({
        thisWord: _id,
        dialogShow: true
      })
    },
    /**
     * 对话框按钮的点击方法
     */
    tapDialogButtons: function(e) {
      switch (e.detail.index) {
        case 0:
          let _id = this.data.thisWord;
          this.familiarWordList[this.currentInitialIndex].splice(this.currentWordIndex, 1);
          app.familiarTrie.deleteData(_id);
          app.vocabularyTrie.insertData(_id);
          break;
        case 1:
          break;
      }
      this.setData({
        dialogShow: false,
        wordList: this.familiarWordList,
      });
    },
  }
})