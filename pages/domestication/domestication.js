//search.js
const app = getApp()
const utils_word = require('../../utils/word2.js');
const papa = require('../../utils/papaparse.min.js'); 
var namearray = ['zk', 'gk', 'cet4', 'cet6', 'ky', 'toefl','ielts','gre'];
var names = [];
var i;
var famFilePath = wx.env.USER_DATA_PATH;
var lexicon_primary;
const fileSystemManager = wx.getFileSystemManager();

Page({
  data: {
    items: [
      { name: 'zk', value: '初中词汇'},
      { name: 'gk', value: '高中词汇'},
      { name: 'cet4', value: '四级词汇' },
      { name: 'cet6', value: '六级词汇'},
      { name: 'ky', value: '考研词汇' },
      { name: 'toefl', value: '托福词汇' },
      { name: 'ielts', value: '雅思词汇' },
      { name: 'gre', value: 'GRE词汇' },
    ],
    familiar_lexicon: [false, false, false, false, false, false, false, false],
    isDown:false,
    percent:0,
    nHidden:true,
  },

  onShow: function () {
    lexicon_primary = wx.getStorageSync('familiar_lexicon');
    if (typeof (lexicon_primary) === "string") {
      lexicon_primary = [false, false, false, false, false, false, false, false];
    }

    this.setData({
      familiar_lexicon: lexicon_primary,
    });
  },

  onUnload: function () {
    
  },

  checkboxChange: function (e) {
    names = e.detail.value;
  },

  checkbox_ensure: function () {
    var numbers = 0.0;
    let lexicon = [];
    for (var element of namearray) {
      if (names.indexOf(element) != -1) {
        lexicon.push(true);
        numbers += 1;
        continue;
      }
      lexicon.push(false);
    }

    let lexicon_second = wx.getStorageSync('familiar_lexicon');
    if (typeof (lexicon_second) === "string") {
      lexicon_second = [false, false, false, false, false, false, false, false];
    }

    var index_change_append = [];
    var index_change_delete = [];
    for (i = 0; i < lexicon.length; i++) {
      if ((lexicon[i] !== lexicon_second[i])&&lexicon[i]) {
        index_change_append.push(i);
      }
      if ((lexicon[i] !== lexicon_second[i]) && !lexicon[i]) {
        index_change_delete.push(i);
      }
      // if (lexicon[i]) {
      //   index_change_append.push(i);
      // }
    }
    index_change_append = [...new Set(index_change_append)];//单词去重

    this.setData({
      nHidden: false,
      isDown: true,
      percent: 99,
    });

    for (i = 0; i < index_change_delete.length; i++) {
      this.checkbox_download(lexicon[index_change_delete[i]], this.data.items[index_change_delete[i]].name)
    }
    for (i = 0; i < index_change_append.length; i++) {
      this.checkbox_download(lexicon[index_change_append[i]], this.data.items[index_change_append[i]].name)
    }

    this.setData({
      percent: 100,
    });



    wx.setStorage({
      key: "familiar_lexicon",
      data: lexicon
    })
  },

  checkbox_download: function(choose,add) {
    var word_familiar_list = [];
    wx.cloud.downloadFile({
      fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/lexicon/'+add+'.csv', // 文件 ID
      success: res => {
        console.log(res.tempFilePath);
        fileSystemManager.readFile({
          filePath: res.tempFilePath,
          encoding: 'utf8',
          success: res => {
            word_familiar_list = res.data.split("\n").slice(1);
            if (!choose) {
              utils_word.deleteFamiliarFromFamiliarTrie(word_familiar_list);
            }else{
              utils_word.appendFamiliar(word_familiar_list);
            }
          },
          fail: err => {
            console.log('readFile fail', err)
          }
        });
      },
      fail: console.error
    })
  },

  modalconfirm1: function () {
    this.setData({
      nHidden: true
    });
  },
})
