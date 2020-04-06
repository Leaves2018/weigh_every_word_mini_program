//deal_passage.js
const utils_word = require('../../utils/word.js');
const utils_his = require('../../utils/history.js');

const app = getApp()
var sentences = [];
var words = [];
var passage = "";
var stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];
var vocabulary = [];
var vocabulary_words = [];
var unknown_words = [];

function word(name, sentence) {
  this.name = name;
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
  },

  onLoad: function() {

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
  //添加图片进行OCR识别
  addpicture: function () {
    wx.chooseImage({
      count: 1,
      success: async function (res) {
        try {
          const invokeRes = await wx.serviceMarket.invokeService({
            service: 'wx79ac3de8be320b71',
            api: 'OcrAllInOne',
            data: {
              // 用 CDN 方法标记要上传并转换成 HTTP URL 的文件
              img_url: new wx.serviceMarket.CDN({
                type: 'filePath',
                filePath: res.tempFilePaths[0],
              }),
              data_type: 3,
              ocr_type: 8
            },
          })

          console.log('invokeService success', invokeRes)
          passage = "";
          var informations = invokeRes.data.ocr_comm_res.items;
          for (var element of informations) {
            passage += element.text;
          }
          wx.showModal({
            title: 'success',
            content: passage,
            showCancel: true,//是否显示取消按钮
            cancelText: "取消",//默认是“取消”
            cancelColor: 'black',//取消文字的颜色
            confirmText: "处理",//默认是“确定”
            confirmColor: 'green',//确定文字的颜色
            success: function (res) {
              if (res.cancel) {
                //点击取消,默认隐藏弹框
              } else {
                //点击确定
                this.deal_passage();
              }
            },
          })
        } catch (err) {
          console.error('invokeService fail', err)
          wx.showModal({
            title: 'fail',
            content: err,
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //处理文本
  deal_passage: function () {
    if(passage === ""){
      passage = this.data.s;
    }
    if (passage === "") {
      return;
    }
    sentences = passage.split(/[\.|\?|\!|\,|\;|\`]/g); //获取例句
    sentences = sentences.filter(function (x) { return x && x.trim(); }); //例句去空
    passage = passage.toLowerCase();//文本转小写
    words = passage.split(/[\r\n|\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\：|\“|\”|\——|\"|\'|\,|\<|\.|\>|\/|\?|\‘|\’|\u4e00-\u9fa5|\^0-9]/g); //获取单词
    words = [...new Set(words)];//单词去重
    words = words.filter(function (x) { return x && x.trim(); });//单词去空
    words = words.filter(function (x) { return x.length > 1; }); 
    for (var element of words) {
      if (stop_words.indexOf(element) === -1) {//过滤停止词
        vocabulary.push(element);
      }
    }
    
    var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
    var voc_trie = utils_word.getVocabulary(); // 从本地获取生词库
    var voc_temp = [];
    var voc_really = [];
    for (var v_word of vocabulary) {
      if ((fam_trie.search(v_word)) === false) {
        voc_temp.push(v_word)
      }
    }
    for (var t_word of voc_temp) {
      if ((voc_trie.search(t_word)) === false) {
        unknown_words.push(t_word) // 筛选出未知词
      }else{
        voc_really.push(t_word);
      }
    }
    var voc_result = [];
    for (var element of voc_really) {
      for (var i = 0; i < sentences.length; i++) {
        let lows = sentences[i].toLowerCase();
        if (lows.indexOf(element) != -1) {
          var word_example = new word(element, i);
          voc_result.push(word_example); // 初步形成文章的生词列表
          break;
        }
      }
    }

    var unknown_result = [];
    for (var element of unknown_words) {
      for (var i = 0; i < sentences.length; i++) {
        let lows = sentences[i].toLowerCase();
        if (lows.indexOf(element) != -1) {
          var word_example = new word(element, i);
          unknown_result.push(word_example); // 初步形成文章的“未知词”列表
          break;
        }
      }
    }

    // history存入本地
    var mydate = new Date();
    var history_example = new history(sentences[0], sentences, voc_result, unknown_result, mydate);
    utils_his.setHistoryInStorage(sentences[0], history_example);
    var history_list = utils_his.getHistoryListFromStorage();
    history_list.push(sentences[0]);
    history_list = [...new Set(history_list)];
    utils_his.setHistoryListInStorage(history_list);
    var history_done_list = utils_his.getHistoryListDoneFromStorage();
    history_done_list.push('info');
    utils_his.setHistoryListDoneInStorage(history_done_list);

    vocabulary = [];
    vocabulary_words = [];
    voc_temp = [];
    voc_really = [];
    unknown_words = [];
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
    wx.setStorage({
      key: 'reciteInfo',
      data: {
        type: 'history',
        headline: sentences[0],
      },
      success: function () {
        wx.navigateTo({
          url: '/pages/recite/recite',
        });
      }
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
