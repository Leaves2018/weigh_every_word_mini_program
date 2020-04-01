const util_his = require('../../utils/history.js');
const util_trie = require('../../utils/trie.js');
const util_word = require('../../utils/word.js');

var thisword = null;
var words = [];
var cnt = -1;
var len = 0;
var vocabulary_words = [];
var unknown_words = [];
var headline = "";
var history = null;
var new_unknown_words = [];
var new_vocabulary_words = [];
var new_familiar_words = [];


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
   * 清空背诵流程使用变量
   */
  clearOtherData: function() {
    thisword = null;
    words = [];
    cnt = -1;
    len = 0;
    vocabulary_words = [];
    unknown_words = [];
    headline = "";
    history = null;
    new_unknown_words = [];
    new_vocabulary_words = [];
    new_familiar_words = [];
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.initialRecitePage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    try {
      var history_choice = wx.getStorageSync('history_choice');
      if (history_choice === "") {
        throw "history_choice is undefined in storage.";
      } else if (typeof(history_choice) === "string") {
        // TODO 安全性检查：确保history_choice就是history_list中的某个headline
        headline = history_choice;
        this.goToRecite();
      }
    } catch (e) {
      console.warn(e);
    } finally {
      wx.setStorage({
        key: 'history_choice',
        data: -1,
      })
    }
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
   * 生成标题
   */
  generateHeadline: function() {
    // TODO 给历史记录列表每个选项添加一个"done"属性，标志其是否已经背完
    // TODO 并在没背完的部分中随机挑一个
    // TODO 如果全部背完，修改reciteDone对话框内容并弹出
    var history_list = util_his.getHistoryListFromStorage();
    var len = history_list.length;
    var flag = true;
    if (len === 0) {
      flag = false;
    } else {
      headline = history_list[parseInt(Math.random() * len)];
    }
    return flag;
  },

  /**
   * 初始化背诵页面
   */
  initialRecitePage: function() {
    this.setData({
      startReciting: false,
      msg_type: "info",
      msg_title: "要背单词吗？",
      msg_extend: ["可以再来一组随机抽一组", "也可查看历史自己选择"],
    });
  },

  /**
   * 解析、加载历史记录
   */
  loadHistory: function(resolve, reject) {
    history = util_his.getHistoryFromStorage(headline);
    console.log(history);
    vocabulary_words = history.vocabulary;
    unknown_words = history.unknown;
    words = unknown_words.concat(vocabulary_words);
    len = words.length;
    if (len > 0) {
      resolve();
    } else {
      reject();
    }
  },

  /**
   * 保存历史记录到本地缓存
   */
  saveHistory: function() {
    history.vocabulary = new_vocabulary_words;
    history.unknown = new_unknown_words;
    let nvw = new_vocabulary_words;
    nvw = nvw.length > 0 ? nvw.map(word => word.name) : [];
    let nfw = new_familiar_words;
    nfw = nfw.length > 0 ? nfw.map(word => word.name) : [];
    util_word.appendFamiliar(nfw);
    util_word.deleteFamiliar(nfw);
    util_word.appendVocabulary(nvw);
    util_word.deleteVocabulary(nvw);
    util_his.setHistoryInStorage(history.headline, history);
    // 背诵完成，清空过程变量
    this.clearOtherData();
  },

  /**
   * 背诵流程控制：切换页面数据到下一个单词
   */
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
    util_word.getWord(thisword.name).then(word => {
      // word.hesitateNum = 0;
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

  /**
   * 没有单词背诵的处理方法
   */
  onNoWordsToRecite: function() {
    this.setData({
      showReciteDoneDialog: true,
      reciteDoneDialogTitle: "Congratulations！",
      reciteDoneDialogText: "历史记录已刷完，没有更多单词可以背诵了",
      reciteDoneDialogButtons: [{text: "知道了"}],
    });
  },

  /**
   * 对话框提示没有单词背诵
   */
  tapReciteDoneDialogButton: function(e) {
    this.setData({
      showReciteDoneDialog: false,
    });
  },

  /**
   * 再次开始背诵流程
   */
  goToRecite: function() {
    this.setData({
      startReciting: true,
    });
    new Promise(this.loadHistory).then(this.next).catch(this.onNoWordsToRecite);
  },

  tapReciteButton: function() {
    if (this.generateHeadline()) {
      // 如果headline生成成功，进入背诵流程
      this.goToRecite();
    } else {
      // 否则提示用户无单词可背
      this.onNoWordsToRecite();
    }
  },

  /**
   * 跳转历史记录页面
   */
  goToHistory: function() {
    wx.navigateTo({
      url: '../history/history',
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
    new_vocabulary_words.push(thisword);
    // this.saveWord();
    this.next();
  },

  /**
   * 背诵流程控制：“记得”按钮点击方法
   */
  tapRemember: function() {
    new_familiar_words.push(thisword);
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