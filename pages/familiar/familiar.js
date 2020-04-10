const utilWord = require('../../utils/word.js');
const utilTrie = require('../../utils/trie.js');
var base64 = require("../../images/base64");
var familiarTrie = null;
var familiarWords = [];
var currentInitialIndex = 0;
var currentWordIndex = 0;
var vocabularyWords = [];
var initials = [];
Page({
  data: { 
    numOfWords: 0,
    inputShowed: false,
    inputVal: "",
    dialogShow: false,
    dialogTitle: "",
    dialogContent: "",
    buttons: [{text: "忘了"}, {text: "记得"}],
  },
  onLoad: function () {
    familiarTrie = utilWord.getFamiliar();
    // familiarWords = familiarTrie.getAllData();
    // 每次取树的一个子节点创建新树，利用新树的getAllData()方法获取首字母相同的单词数组
    // 考虑封装到Trie类结构中，或者修改Trie的定义
    for (let child of familiarTrie.root.children) {
      initials.push(child.key.toUpperCase());
      var tempTrie = new utilTrie.Trie();
      tempTrie.root.children[0] = child;
      var tempData = tempTrie.getAllData();
      this.data.numOfWords += tempData.length;
      familiarWords.push(tempData);
    }
    this.setData({
      search: this.search.bind(this),
      initials: initials,
      words: familiarWords,
    });
  },
  onUnload: function () {
    utilWord.setFamiliar(familiarTrie);
    utilWord.appendVocabulary(vocabularyWords);
    // 存储熟词本中单词数量
    wx.setStorage({
      key: 'familiarWordsLength',
      data: this.data.numOfWords,
    });
    // 手动清空
    familiarTrie = null;
    familiarWords = [];
    currentInitialIndex = 0;
    currentWordIndex = 0;
    vocabularyWords = [];
    initials = [];
  },
  search: function (value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([{ text: value, value: value }])
      }, 200);
      if (familiarTrie.search(value)) {
        resolve([{ text: value, value: 1 }]);
      } else {
        reject(value+" is not found.");
      }
    })
  },
  selectResult: function (e) {
    console.log('select result', e.detail);
  },
  showDetail: function (e) {
    [currentInitialIndex, currentWordIndex] = e.currentTarget.dataset.position.split('.');
    let _id = this.data.words[currentInitialIndex][currentWordIndex];
    utilWord.getWord(_id).then(word => {
      this.setData({
        dialogTitle: word._id,
        dialogContent: word.chinese,
        dialogShow: true
      })
    });
  },
  tapDialogButton: function (e) {
    switch (e.detail.index) {
      case 0:
        let _id = familiarWords[currentInitialIndex][currentWordIndex];
        familiarWords[currentInitialIndex].splice(currentWordIndex, 1);
        familiarTrie.deleteData(_id);
        vocabularyWords.push(_id);
        break;
      case 1:
        break;
    }
    this.setData({
      dialogShow: false,
      words: familiarWords,
    });
  },
});



