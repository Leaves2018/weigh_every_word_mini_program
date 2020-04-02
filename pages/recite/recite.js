const utilHis = require('../../utils/history.js');
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word.js');

var currentIndex = 0;        // 当前显示单词位于总体位置的下标

var wordList = [];            // 解析得到的单词列表

var vocabularyWordList = [];  // 记录用户修改得到的生熟词
var familiarWordList = [];

Page({
  data: {
    // 背诵流程页面数据
    progressOverall: 0,
    progressThis: 100,
    thisDuration: 30,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: true,
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    try {
      var reciteInfo = wx.getStorageSync('reciteInfo');
      if (reciteInfo === "") {
        throw "reciteInfo is undefined in storage.";
      } else {
        switch (reciteInfo.type) {
          case "trie":
            this.parseTrieInfo(new utilTrie.Trie(reciteInfo.trie.root));
            currentIndex = reciteInfo.currentIndex;
            break;
          case "history":
            this.parseHistoryInfo(reciteInfo.headline);
            currentIndex = 0;
            break;
        }
      } 
    } catch (e) {
      console.warn(e);
    } finally {
      // reciteInfo即用即废止，所存信息是一次性的
      wx.setStorage({
        key: 'reciteInfo',
        data: -1,
      });
      this.startReciting();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面第一次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面被销毁
   */
  onUnload: function () {

  },

  /**
   * 解析字典树
   */
  parseTrieInfo: function (trie) {
    wordList = trie.getAllData();
  },

  /**
   * 解析历史记录
   */
  parseHistoryInfo: function (headline) {
    var history = utilHis.getHistoryFromStorage(headline);
    wordList = history.unknown.concat(history.vocabulary);
  },

  /**
   * 开始背诵流程
   */
  startReciting: function () {
    this.setData({
      startReciting: true,
    });
    this.loadIndexWord();
  },

  /**
   * 加载wordList[currentIndex]指定的单词
   */
  loadIndexWord: function () {
    if (currentIndex < 0) {
      currentIndex = 0;
      wx.showToast({
        title: '前面没有啦',
        icon: 'info',
        duration: 2000,
      });
    } else if (currentIndex >= wordList.length) {
      currentIndex = wordList.length - 1;
      wx.showToast({
        title: '后面没有啦',
        icon: 'info',
        duration: 2000,
      })
    }
    util_word.getWord(wordList[currentIndex]).then(word => {
      this.setData({
        word_level: word.level,
        word_id: word._id,
        word_phonetic: word.phonetic,
        word_chinese: word.chinese,
        word_context: word.context,
        // word_english: word.english,
      });
    })
  },

  /**
   * 保存历史记录到本地缓存
   * DELETE 逻辑应改为将处理结果写回缓存，谁调用谁保存
  saveHistory: function() {
    history.vocabulary = vocabularyWordList;
    history.unknown = new_unknown_words;
    let nvw = vocabularyWordList;
    nvw = nvw.length > 0 ? nvw.map(word => word.name) : [];
    let nfw = familiarWordList;
    nfw = nfw.length > 0 ? nfw.map(word => word.name) : [];
    utilWord.appendFamiliar(nfw);
    utilWord.deleteFamiliar(nfw);
    utilWord.appendVocabulary(nvw);
    utilWord.deleteVocabulary(nvw);
    utilHis.setHistoryInStorage(history.headline, history);
  },
  /

  /**
   * 背诵流程控制：切换页面数据到下一个单词
   * DELETE 换用loadIndexWord实现
  next: function() {
    if (unknown_words.length > 0) {
      this.setData({
        word_tag: "「未知」",
      })
      thisword = unknown_words.shift();
    } else if (vocabulary_words.length > 0) {
      thisword = vocabulary_words.shift();
      this.setData({
        word_tag: "「生词」",
      })
    } else {
      this.reciteDone();
      return;
    }
    cnt += 1;
    utilWord.getWord(thisword.name).then(word => {
      word.context = history.body[thisword.sentence];
      this.setData({
        progressOverall: Math.round((cnt) / len * 100),
        word_level: word.level,
        word_id: word._id,
        word_phonetic: word.phonetic,
        word_chinese: word.chinese,
        word_context: word.context,
        word_english: word.english,
      });
    });
  },
  /

  /**
   * 跳转上一级页面（历史记录）
   */
  goToHistory: function() {
    wx.navigateBack({
      delta: 1,
    })
  },

  /**
   * 前往背诵页面
   */
  goToInput: function () {
    wx.switchTab({
      url: '/pages/input/input',
    })
  },

  /**
   * 背诵流程控制：激活“记得”“忘了”“模糊”按钮
   */
  activateButtons: function() {
    this.setData({
      disabled: false,
      progressThisActive: false
    });
  },

  /**
   * 背诵流程控制：“模糊”按钮点击方法
   */
  tapHesitate: function() {
    // thisword.hesitateNum += 1;
    this.setData({
      disabled: true,
      progressThisActive: true
    })
  },

  /**
   * 背诵流程控制：“忘了”按钮点击方法
   */
  tapForget: function() {
    vocabularyWordList.push(thisword);
    // this.saveWord();
    this.next();
  },

  /**
   * 背诵流程控制：“记得”按钮点击方法
   */
  tapRemember: function() {
    familiarWordList.push(thisword);
    // this.saveWord();
    this.next();
  },

  /**
   * 背诵完成控制方法
   */
  reciteDone: function() {
    this.saveHistory();
    this.setData({
      startReciting: false,
      msg_type: "success",
      msg_title: "背诵完成",
      msg_extend: ["Congratulations!"],
    });
  },
});