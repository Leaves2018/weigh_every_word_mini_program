const util = require('../../utils/util.js');
const utilHis = require('../../utils/history.js');
const utilTrie = require('../../utils/trie.js');
const utilWord = require('../../utils/word2.js');
const utilTomd = require('../../utils/tomd.js');

const app = getApp();

// 用于解析历史记录/单词
var currentIndex = 0;         // 当前显示单词位于总体位置的下标
var history = {};             // 当输入参数为历史记录时使用
var wordList = [];            // 解析得到的单词列表

var vocabularyWordList = [];  // 记录用户修改得到的生熟词
var familiarWordList = [];

// 用于进度条计算
var len = 0;

// 用于实现滑动手势操作
var minOffset = 30;
var minTime = 60;
var startX = 0;
var startY = 0;
var startTime = 0;

// 获取屏幕宽度和高度，用于动画效果
var windowWidth = 0;
var windowHeight = 0;
wx.getSystemInfo({
  success: function(res) {
    windowWidth = res.windowWidth;
    windowHeight = res.windowHeight;
  },
});

var animation = wx.createAnimation({
  duration: 50,
  timingFunction: 'ease-in-out',
})

Page({
  data: {
    // 背诵流程页面数据
    progressOverall: 0,
    progressThis: 100,
    thisDuration: 30,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    try {
      var reciteInfo = wx.getStorageSync('recite_info');
      if (reciteInfo === "") {
        throw "recite_info is undefined in storage.";
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
      // recite_info即用即废止，所存信息是一次性的
      wx.setStorage({
        key: 'recite_info',
        data: -1,
      });
      if (wordList.length === 0) {
        this.reciteDone();
      } else {
        this.startReciting();
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
    this.saveChanges();
    console.log('history.vocabulary is ')
    console.log(history.vocabulary);
    this.clearOtherData();
  },

  /**
   * 清理使用参数
   */
  clearOtherData: function () {
    currentIndex = 0;         // 当前显示单词位于总体位置的下标
    history = {};             // 当输入参数为历史记录时使用
    wordList = [];            // 解析得到的单词列表

    vocabularyWordList = [];  // 记录用户修改得到的生熟词
    familiarWordList = [];
    animation = wx.createAnimation({
      duration: 50,
      timingFunction: 'ease',
    });
    len = 0;
  },

  /**
   * 解析字典树
   */
  parseTrieInfo: function (trie) {
    wordList = trie.getAllData();
    len = wordList.length;
  },

  /**
   * 解析历史记录
   */
  parseHistoryInfo: function (headline) {
    history = utilHis.getHistoryFromStorage(headline);
    history.isHistory = true;
    history.hisSenLocMap = new Map();
    history.unknown.concat(history.vocabulary).map(word => {
      wordList.push(word.name);
      history.hisSenLocMap.set(word.name, word.sentence);
    });
    len = wordList.length;
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
    // 数据处理
    utilWord.getWord(wordList[currentIndex]).then(word => {
      if (history.isHistory) {
        word.context = history.body[history.hisSenLocMap.get(wordList[currentIndex])];
        word.context = utilTomd.markText(word.context, word._id, '**');
        // 处理历史记录过程中存储context（已标记版本）
        wx.setStorage({
          key: `${word._id}_context`,
          data: word.context,
        })
      } else {
        // 处理trie过程中读取context
        word.context = wx.getStorageSync(`${word._id}_context`);
      }
      // 需要手动分割再重连才能实现换行效果，原因未知
      word.translation = word.translation.split(/\\n/);
      word.definition = word.definition.split(/\\n/);

      let wordContextWXML = app.towxml(word.context, 'markdown');
      
      this.setData({
        progressOverall: Math.round(currentIndex / len * 100),
        word: word,
        wordContextWXML: wordContextWXML,
      });
    });

    // 动画处理
    animation.translateY(0).step({duration: 300});
    this.setData({
      animationData: animation.export(),
    });
  },

  touchStart: function (e) {
    // console.log("touchStart", e);
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    startTime = new Date().getTime();
  },

  touchCancel: function (e) {
    startX = 0;
    startY = 0;
    startTime = 0;
  },

  /**
   * 触摸结束事件：主要的判断流程
   */
  touchEnd: function (e) {
    // console.log("touchEnd", e);
    var endX = e.changedTouches[0].pageX;
    var endY = e.changedTouches[0].pageY;
    var touchTime = new Date().getTime() - startTime;

    // 开始判断
    // 1. 时间是否达到阈值
    if (touchTime >= minTime) {
      // 2. 偏移量是否达到阈值
      var xOffset = endX - startX;
      var yOffset = endY - startY;
      // 判断左右滑动还是上下滑动
      if (Math.abs(xOffset) >= Math.abs(yOffset) && Math.abs(xOffset) >= minOffset) {
        // 判断向左滑动还是向右滑动
        if (xOffset < 0) {
          this.swipeLeft();
        } else {
          this.swipeRight();
        }
      } else if (Math.abs(xOffset) < Math.abs(yOffset) && Math.abs(yOffset) >= minOffset) {
        // 判断向上滑动还是向下滑动
        if (yOffset < 0) {
          // this.swipeUp();
        } else {
          // this.swipeDown();
        }
      }
    } else {
      console.log("滑动时间过短", touchTime);
    }
  },

  isOutOfBounds: function () {
    currentIndex += 1;
    // 越界逻辑判断在此进行
    if (currentIndex >= wordList.length) {
      if (history.isHistory) {
        this.reciteDone();
        return;
      }
      currentIndex = currentIndex % wordList.length;
    }
    setTimeout(this.loadIndexWord, 200);
  },
  /**
   * 向左滑动处理方法
   */
  swipeLeft: function () {
    // 动画处理
    animation.translateX(-windowWidth).step();  //  向左移出窗口
    animation.translateY(windowHeight).step();
    animation.translateX(0).step(); // 移动到窗口正下方
    this.setData({
      animationData: animation.export(),
    });
    // 数据处理
    familiarWordList.push(wordList[currentIndex]);  // 左滑记作熟词
    this.isOutOfBounds();
  },

  /**
   * 向右滑动处理方法
   */
  swipeRight: function () {
    // 动画处理
    animation.translateX(windowWidth).step(); // 向右移出窗口
    animation.translateY(windowHeight).step();
    animation.translateX(0).step(); // 移动到窗口正下方
    this.setData({
      animationData: animation.export(),
    });
    // 数据处理
    vocabularyWordList.push(wordList[currentIndex]);
    this.isOutOfBounds();
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * 下拉则清空原有数据直接拉取新数据
   */
  onPullDownRefresh: function () {
    wx.removeStorage({
      key: wordList[currentIndex],
      success: function(res) {
        utilWord.getWord(wordList[currentIndex]).then(word => {
          console.log(word);
          console.log("refresh successifully.");
          this.setData({
            word: word,
          });
        });
      },
    })
  },

  /**
   * 将用户修改保存到用户本地的生熟词本
   * 并将结果保存到key为recite_info的本地缓存，供调用recite页面的页面进行数据处理
   */
  saveChanges: function () {
    if (history.isHistory) {
      wx.setStorage({
        key: 'recite_info',
        data: {
          type: "done",
          headline: history.headline,
          done: familiarWordList.length === wordList.length,
        },
      });
      // 处理unknown单词：本次未处理单词-生词-熟词
      let remainingWordList = util.arrSub(wordList, vocabularyWordList.concat(familiarWordList));
      let unknownWordList = util.arrSub(remainingWordList, history.vocabulary.map(value => value.name));
      
      history.unknown = unknownWordList.map(_id => {
        return {
          name: _id,
          sentence: history.hisSenLocMap.get(_id),
        }
      });
      // 处理vocabulary单词：原来已经标记为生词的单词+本次标记为生词的单词-重复
      vocabularyWordList.concat(util.arrSub(remainingWordList, unknownWordList)).filter((value, index, array) => {
        return array.indexOf(value) === index;
      });
      history.vocabulary = vocabularyWordList.map(_id => {
        return {
          name: _id,
          sentence: history.hisSenLocMap.get(_id),
        }
      })
      // 存储历史记录修改结果
      wx.setStorage({
        key: history.headline,
        data: history,
      });
    }
    // 修改本地生词树与熟词树
    if (familiarWordList.length !== 0) {
      utilWord.appendFamiliar(familiarWordList);
      utilWord.deleteFamiliar(familiarWordList);
    }
    if (vocabularyWordList.length !== 0) {
      utilWord.appendVocabulary(vocabularyWordList);
      utilWord.deleteVocabulary(vocabularyWordList);
    }
  },

  /**
   * 背诵完成控制方法
   */
  reciteDone: function() {
    this.setData({
      startReciting: false,
      msg_type: "success",
      msg_title: "背诵完成",
      msg_extend: ["Congratulations!"],
    });
  },

  /**
   * 跳转上一级页面（历史记录）
  */
  goBack: function () {
    if (history.isHistory) {
      // 如果读取数据来自历史，背诵完后返回历史记录列表页面
      wx.setStorage({
        key: 'history_detail',
        data: history.headline,
      })
      wx.redirectTo({
        url: '../history_detail/history_detail',
      });
    } else {
      wx.navigateBack({
        delta: 1,
      });
    }
  },
});