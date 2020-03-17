//search.js
const app = getApp()
var s = ""
var sentences = []
var words = []
var stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"]
var vocabulary = []
var vocabulary_words = [] 

function word(name, chinese, sentence) {
  this.name = name
  this.chinese = chinese
  this.sentence = sentence
}
Page({
  data: {
    height: 30,
    focus: false,
    inputValue: '',
    mHidden: true,
    nHidden: true
  },

  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
    s = e.detail.value
    sentences = s.split(/[\.|\?|\!|\,|\;|\`]/g)
    sentences = sentences.filter(function (x) { return x && x.trim(); });
    console.log(sentences)
    s = s.toLowerCase()
    words = s.split(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\‘|\’]/g); 
    words = [...new Set(words)]
    words = words.filter(function (x) { return x && x.trim(); });
    words = words.filter(function (x) { return x.length > 1; });
    for (var element of words) {
      if(stop_words.indexOf(element) < 0){
        vocabulary.push(element)
      }
    }
    console.log(vocabulary)
    for (var element of vocabulary) {
      for (var i = 0; i < sentences.length; i++) {
        sentences[i].toLowerCase()
        if (sentences[i].indexOf(element) != -1) {
          var word_example = new word(element, "", i)
          vocabulary_words.push(word_example)
          break
        }
        sentences[i].toUpperCase()
      }
    }
    console.log(vocabulary_words)
    
  },
  bindFormSubmit: function (e) {
    console.log(e.detail.value.textarea)
  },

  search: function (e) {
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
