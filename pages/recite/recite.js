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
    if (true) {
      // 如果该记录已处理完成，不再进入背诵流程
      this.setData({
        startReciting: false,
        msg_type: "info",
        msg_title: "这篇文本已经处理完成",
        msg_extend: ["这篇文本的所有单词已经分类完毕", "所有归类为生词的单词您也已经背诵完成", "可以在 我/生词本 及 我/熟词本 查看"],
      });
    } else {
      // 否则进入背诵流程：首先尝试获取作为key的headline
      try {
        var history_choice = wx.getStorageSync('history_choice');
        if (history_choice === "") {
          throw "history_choice is undefined in storage.";
        } else if (typeof (history_choice) === "string") {
          // TODO 安全性检查：确保history_choice就是history_list中的某个headline
          headline = history_choice;
          // 如果前述没有抛出异常，则获取headline成功，进入背诵流程
          this.goToRecite();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // history_choice即用即废止，所存信息是一次性的
        wx.setStorage({
          key: 'history_choice',
          data: -1,
        })
      }
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
   * 生成标题
   * DELETE 没有必要随机挑选背诵，需求不存在
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
  */

  /**
   * 开始背诵流程
   */
  goToRecite: function () {
    // 渲染页面切换到背诵流程页面
    this.setData({
      startReciting: true,
    });
    // 尝试解析历史记录：解析成功即开始加载；解析失败则
    // new Promise(this.loadHistory).then(this.next).catch(this.onNoWordsToRecite);
    new Promise(this.loadHistory).then(this.next);
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
   * DELETE 随机背诵单词需求砍掉后，所有历史记录刷完的情况应该放在历史记录列表页面处理（静态页面）
  onNoWordsToRecite: function() {
    this.setData({
      showReciteDoneDialog: true,
      reciteDoneDialogTitle: "Congratulations！",
      reciteDoneDialogText: "历史记录已刷完，没有更多单词可以背诵了",
      reciteDoneDialogButtons: [{text: "知道了"}],
    });
  },
  */

  /**
   * 对话框提示没有单词背诵
   * DELETE 随机背诵单词需求砍掉后，对话框提示也丧失意义 
  tapReciteDoneDialogButton: function(e) {
    this.setData({
      showReciteDoneDialog: false,
    });
  },
  */


  /**
   * DELETE 随机背诵单词需求砍掉后，对话框提示也丧失意义
  tapReciteButton: function() {
    if (this.generateHeadline()) {
      // 如果headline生成成功，进入背诵流程
      this.goToRecite();
    } else {
      // 否则提示用户无单词可背
      this.onNoWordsToRecite();
    }
  },
  */

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