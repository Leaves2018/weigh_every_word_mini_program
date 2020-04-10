//search.js
const app = getApp()
const utils_word = require('../../utils/word.js');
var namearray = ['primary','junior','high','CET'];
var primary_word = [];
var junior_word = [];
var high_word = [];
var cet_word = [];
var names = [];

Page({
  data: {
    items: [
      { name: 'primary', value: '小学词汇'},
      { name: 'junior', value: '初中词汇'},
      { name: 'high', value: '高中词汇' },
      { name: 'CET', value: '四六级词汇'},
    ],
    familiar_lexicon: [false, false, false, false]
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    names = e.detail.value;
  },

  checkbox_ensure: function () {
    var that = this;
    let lexicon = [];
    for (var element of namearray) {
      if (names.indexOf(element) != -1) {
        lexicon.push(true);
        continue;
      }
      lexicon.push(false);
    }
    let fileflag = wx.getStorageSync('fileflag');
    if (typeof (fileflag) === "string") {
      fileflag = [false, false, false, false];
    }
    //下载小学单词
    if (!fileflag[0]&&lexicon[0]) {
      fileflag[0] = true;
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/primary.json', // 文件 ID
        success: res => {
          // 返回临时文件路径
          console.log(res.tempFilePath)
          wx.request({
            url: res.tempFilePath,
            success: function (res) {
              var temp = res.data.split('\n');
              for (var element of temp) {
                var word = JSON.parse(element);
                utils_word.setWord(word);
                primary_word.push(word._id);
              }
              utils_word.appendFamiliar(primary_word);
            }
          })
        },
        fail: console.error
      })
    }
    //下载初中单词
    if (!fileflag[1]&&lexicon[1]) {
      fileflag[1] = true;
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/junior.json', // 文件 ID
        success: res => {
          // 返回临时文件路径
          console.log(res.tempFilePath)
          wx.request({
            url: res.tempFilePath,
            success: function (res) {
              var temp = res.data.split('\n');
              for (var element of temp) {
                var word = JSON.parse(element);
                utils_word.setWord(word);
                junior_word.push(word._id);
              }
              utils_word.appendFamiliar(junior_word);
            }
          })
        },
        fail: console.error
      })
    }
    //下载高中单词
    if (!fileflag[2]&&lexicon[2]) {
      fileflag[2] = true;
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/senior.json', // 文件 ID
        success: res => {
          // 返回临时文件路径
          console.log(res.tempFilePath)
          wx.request({
            url: res.tempFilePath,
            success: function (res) {
              var temp = res.data.split('\n');
              for (var element of temp) {
                var word = JSON.parse(element);
                utils_word.setWord(word);
                high_word.push(word._id);
              }
              utils_word.appendFamiliar(high_word);
            }
          })
        },
        fail: console.error
      })
    }
    //下载四六级单词
    if (!fileflag[3]&&lexicon[3]) {
      fileflag[3] = true; 
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/CET.json', // 文件 ID
        success: res => {
          // 返回临时文件路径
          console.log(res.tempFilePath)
          wx.request({
            url: res.tempFilePath,
            success: function (res) {
              var temp = res.data.split('\n');
              for (var element of temp) {
                var word = JSON.parse(element);
                utils_word.setWord(word);
                cet_word.push(word._id);
              }
              utils_word.appendFamiliar(cet_word);
            }
          })
        },
        fail: console.error
      })
    }
    if (lexicon[0]) {
      utils_word.deleteFamiliar(primary_word);
    }
    if (lexicon[1]) {
      utils_word.deleteFamiliar(junior_word);
    }
    if (lexicon[2]) {
      utils_word.deleteFamiliar(high_word);
    }
    if (lexicon[3]) {
      utils_word.deleteFamiliar(cet_word);
    }
    primary_word = [];
    junior_word = [];
    high_word = [];
    cet_word = [];
    wx.setStorage({
      key: "familiar_lexicon",
      data: lexicon
    })
    wx.setStorage({
      key: "fileflag",
      data: fileflag
    })
  },

  onLoad: function () {
  
  },

  onShow: function () {
    let lexicon = wx.getStorageSync('familiar_lexicon');
    if (typeof (lexicon) === "string") {
      lexicon = [false, false, false, false];
    }
  
    this.setData({
      familiar_lexicon: lexicon,
    });

    
  },
  
})
