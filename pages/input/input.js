//search.js
const utils_trie = require('../../utils/trie.js');
const utils_his = require('../../utils/history.js');

const app = getApp()
var sentences = [];
var words = [];
var passage = "";
var stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];
var vocabulary = [];
var vocabulary_words = [];
var unknown_words = [];

function word(name, chinese, sentence) {
  this.name = name;
  this.chinese = chinese;
  this.sentence = sentence;
}
function history(headline, body, vocabulary, unknown, date) {
  this.headline = headline;
  this.body = body;
  this.vocabulary = vocabulary;
  this.unknown = unknown;
  this.date = date;
}

Page({
  data: {
    height: 30,
    focus: false,
    inputValue: '',
    mHidden: true,
    nHidden: true,
    s: '',
    s1: ''
  },

  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindFormSubmit: function (e) {
    this.setData({
      s: e.detail.value
    })
  },

  search: function (e) {
    console.log(this.data.s);
    passage = this.data.s;
    var passage_temp = this.data.s;
    sentences = passage.split(/[\.|\?|\!|\,|\;|\`]/g); //获取例句
    sentences = sentences.filter(function (x) { return x && x.trim(); }); //例句去空
    console.log(sentences);
    passage = passage.toLowerCase();//文本转小写
    words = passage.split(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\‘|\’]/g); //获取单词
    words = [...new Set(words)];//单词去重
    words = words.filter(function (x) { return x && x.trim(); });//单词去空
    for (var element of words) {
      if (stop_words.indexOf(element) === -1) {//过滤停止词
        vocabulary.push(element);
      }
    }
    console.log(vocabulary);
    for (var element of vocabulary) {
      for (var i = 0; i < sentences.length; i++) {
        let lows = sentences[i].toLowerCase();
        if (lows.indexOf(element) != -1) {
          var word_example = new word(element, "", i);
          vocabulary_words.push(word_example);
          break;
        }
      }
    }
    console.log(vocabulary_words)

    var fam_trie = utils_trie.getTrieFromStorage('familiar');
    var voc_trie = utils_trie.getTrieFromStorage('vocabulary');
    var voc_temp = [];
    for (var v_word of vocabulary_words) {
      if ((fam_trie.search(v_word)) === false) {
        voc_temp.push(v_word)
      }
    }
    for (var t_word of voc_temp) {
      if ((voc_trie.search(t_word)) === false) {
        unknown_words.push(t_word)
      }
    }
    var voc_really = [];
    for (var element of voc_temp) {
      if (unknown_words.indexOf(element) === -1) {
        voc_really.push(element);
        break;
      }
    }

    // history存入本地
    var mydate = new Date();
    var history_example = new history(sentences[0], passage_temp, voc_really, unknown_words, mydate);
    wx.setStorage({
      key: sentences[0],
      data: history_example
    })
    try {
      wx.setStorageSync(sentences[0], history_example)
    } catch (e) {
    }
    var history_list = utils_his.getHistoryListFromStorage();
    var getType = Object.prototype.toString;
    var res = getType.call(history_list);
    console.log(res)
    history_list.push(sentences[0]);
    utils_his.setHistoryListInStorage(history_list);
    this.setData({
      mHidden: false
    });

  },

  modalconfirm: function () {
    this.setData({
      mHidden: true
    });
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 1500
    })
    wx.switchTab({
      url: '../recite/recite',
    })
  },

  modalcancel: function () {
    this.setData({
      mHidden: true,
      nHidden: false
    });
  },

  modalconfirm1: function () {
    this.setData({
      nHidden: true
    });
  }
})
