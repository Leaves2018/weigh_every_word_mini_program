const util_his = require('../../utils/history.js');
const util_trie = require('../../utils/trie.js');
const util_word = require('../../utils/word.js');


Page({
  data: {
    condition: true,
    // 非背诵流程页面数据
    msg_type: "",
    msg_title: "",
    msg_extend: [],
    showReciteDoneDialog: false,
    // 背诵流程页面数据
    progressOverall: 0,
    word_tag: "",
    progressThis: 100,
    progressThisActive: false,
    thisDuration: 30,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: true,
    loading: false
  },

  /**
   * 用于背诵流程的变量集合
   */
  otherdata: {
    thisword: null,
    words: [],
    cnt: -1,
    len: 0,
    vocabulary_words: [],
    unknown_words: [],
    headline: "",
    history: null,
    new_unknown_words: [],
    new_vocabulary_words: [],
    new_familiar_words: [],
  },

  /**
   * 清空背诵流程使用变量
   */
  clearOtherData: function () {
    this.otherdata = {
      thisword: null,
      words: [],
      cnt: -1,
      len: 0,
      vocabulary_words: [],
      unknown_words: [],
      headline: "",
      history: null,
      new_unknown_words: [],
      new_vocabulary_words: [],
      new_familiar_words: [],
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.initialRecitePage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    try {
      var history_choice = wx.getStorageSync('history_choice');
      if (history_choice === "") {
        throw "history_choice is undefined in storage.";
      } else if (typeof (history_choice) === "string") {
        // TODO 安全性检查：确保history_choice就是history_list中的某个headline
        this.otherdata.headline = history_choice;
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
   * 生成标题
   */
  generateHeadline: function () {
    // TODO 给历史记录列表每个选项添加一个"done"属性，标志其是否已经背完
    // TODO 并在没背完的部分中随机挑一个
    // TODO 如果全部背完，修改reciteDone对话框内容并弹出
    var history_list = util_his.getHistoryListFromStorage();
    var len = history_list.length;
    this.otherdata.headline = history_list[parseInt(Math.random() * len)];
  },  

   /**
   * 初始化背诵页面
   */
  initialRecitePage: function () {
    this.setData({
      condition: true,
      msg_type: "info",
      msg_title: "要背单词吗？",
      msg_extend: ["可以再来一组随机抽一组", "也可查看历史自己选择"],
    });
  },

  /**
   * 解析、加载历史记录
   */
  loadHistory: function(resolve, reject) {
    console.log("In loadHistory,")
    // var headline = "";
    // if (arguments.length > 0 && typeof(arguments[0]) === "string") {
    //   headline = arguments[0];
    // } else {
    //   headline = util_his.getHistoryListFromStorage().pop();
    // }
    // console.log(headline);
    this.otherdata.history = util_his.getHistoryFromStorage(this.otherdata.headline);
    console.log(this.otherdata.history);
    this.otherdata.vocabulary_words = this.otherdata.history.vocabulary;
    this.otherdata.unknown_words = this.otherdata.history.unknown;
    this.otherdata.words = this.otherdata.unknown_words.concat(this.otherdata.vocabulary_words);
    this.otherdata.len = this.otherdata.words.length;
    // console.log("In loadHistory:");
    // console.log(this.otherdata.words);
    if (this.otherdata.len > 0) {
      resolve();
    } else {
      reject();
    }
  },

  /**
   * 保存历史记录到本地缓存
   */
  saveHistory: function() {
    this.otherdata.history.vocabulary = this.otherdata.new_vocabulary_words;
    this.otherdata.history.unknown = this.otherdata.new_unknown_words;
    let nvw = this.otherdata.new_vocabulary_words;
    nvw = nvw.length > 0 ? nvw.map(word => word.name) : [];
    let nfw = this.otherdata.new_familiar_words;
    nfw = nfw.length > 0 ? nfw.map(word => word.name) : [];
    util_word.appendFamiliar(nfw);
    util_word.deleteFamiliar(nfw);
    util_word.appendVocabulary(nvw);
    util_word.deleteVocabulary(nvw);
    util_his.setHistoryInStorage(this.otherdata.history.headline, this.otherdata.history);
    // 背诵完成，清空过程变量
    this.clearOtherData();
  },

  /**
   * 背诵流程控制：切换页面数据到下一个单词
   */
  next: function () {
    if (this.otherdata.unknown_words.length>0) {
      this.setData({
        word_tag: "「未知」",
      })
      this.otherdata.thisword = this.otherdata.unknown_words.shift();
    } else if (this.otherdata.vocabulary_words.length>0) {
      this.otherdata.thisword = this.otherdata.vocabulary_words.shift();
      this.setData({
        word_tag: "「生词」",
      })
    } else {
      this.reciteDone();
      return;
    }
    util_word.getWord(this.otherdata.thisword.name).then(word => {
      // word.hesitateNum = 0;
      word.context = this.otherdata.history.body[this.otherdata.thisword.sentence];
      this.setData({
        progressOverall: Math.round((this.otherdata.cnt + 1) / this.otherdata.len * 100),
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
  onNoWordsToRecite: function () {
    console.log("No unknown words and vocabulary words to recite.");
    this.setData({
      showReciteDoneDialog: true,
    });
  },

  /**
   * 对话框提示没有单词背诵
   */
  tapReciteDoneDialogButton: function (e) {
    this.setData({
      showReciteDoneDialog: false,
    });
  },

  /**
   * 保存用户对单词的修改
   */
  // saveWord: function () {
  //   let word = this.otherdata.thisword;
  //   wx.setStorage({
  //     key: word._id,
  //     data: word,
  //   })
  // },

  /**
   * 再次开始背诵流程
   */
  goToRecite: function () {
    this.setData({
      condition: false,
    });
    new Promise(this.loadHistory).then(this.next).catch(this.onNoWordsToRecite);
  },

  tapReciteButton: function () {
    this.generateHeadline();
    this.goToRecite();
  },

  /**
   * 跳转历史记录页面
   */
  goToHistory: function () {
    wx.navigateTo({
      url: '../history/history',
    })
  },

  /**
   * 背诵流程控制：激活“记得”“忘了”“模糊”按钮
   */
  activateButtons: function () {
    this.setData({
      disabled: false,
      progressThisActive: false
    });
  },

  /**
   * 背诵流程控制：“模糊”按钮点击方法
   */
  tapHesitate: function () {
    // thisword.hesitateNum += 1;
    this.setData({
      disabled: true,
      progressThisActive: true
    })
  },

  /**
   * 背诵流程控制：“忘了”按钮点击方法
   */
  tapForget: function () {
    this.otherdata.new_vocabulary_words.push(this.otherdata.thisword);
    // this.saveWord();
    this.next();
  },

  /**
   * 背诵流程控制：“记得”按钮点击方法
   */
  tapRemember: function () {
    this.otherdata.new_familiar_words.push(this.otherdata.thisword);
    // this.saveWord();
    this.next();
  },

  /**
   * 背诵完成控制方法
   */
  reciteDone: function () {
    this.saveHistory();
    this.setData({
      condition: true,
      msg_type: "success",
      msg_title: "背诵完成",
      msg_extend: ["Congratulations!"],
    });
  },
});