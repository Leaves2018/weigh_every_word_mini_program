//search.js
const app = getApp()
const utils_word = require('../../utils/word2.js');
const papa = require('../../utils/papaparse.min.js');
var namearray = ['zk', 'gk', 'cet4', 'cet6', 'ky', 'toefl', 'ielts', 'gre'];
var names = [];
var i;
var famFilePath = wx.env.USER_DATA_PATH;
var lexiconCheckedInStorage;
const fileSystemManager = wx.getFileSystemManager();

Page({
  data: {
    items: [{
        name: 'zk',
        value: '初中词汇'
      },
      {
        name: 'gk',
        value: '高中词汇'
      },
      {
        name: 'cet4',
        value: '四级词汇'
      },
      {
        name: 'cet6',
        value: '六级词汇'
      },
      {
        name: 'ky',
        value: '考研词汇'
      },
      {
        name: 'toefl',
        value: '托福词汇'
      },
      {
        name: 'ielts',
        value: '雅思词汇'
      },
      {
        name: 'gre',
        value: 'GRE词汇'
      },
    ],
    familiar_lexicon: [false, false, false, false, false, false, false, false],
    isDown: false,
    percent: 0,
    nHidden: true,
  },

  onShow: function() {
    lexiconCheckedInStorage = wx.getStorageSync('familiar_lexicon');
    if (typeof (lexiconCheckedInStorage) !== "string") {
      this.setData({
        familiar_lexicon: lexiconCheckedInStorage,
      });
    }
  },

  onUnload: function() {

  },

  checkboxChange: function(e) {
    names = e.detail.value;
  },

  checkbox_ensure: function() {
    let lexicon = [];
    for (var element of namearray) {
      if (names.indexOf(element) !== -1) {
        lexicon.push(true);
      }else {
        lexicon.push(false);
      }
    }
    wx.setStorage({
      key: "familiar_lexicon",
      data: lexicon
    })

    var index_change_append = [];//增加的单词库
    var index_change_delete = [];//删除的单词库
    lexiconCheckedInStorage = wx.getStorageSync('familiar_lexicon');
    for (i = 0; i < lexicon.length; i++) {
      if ((lexicon[i] !== lexiconCheckedInStorage[i]) && !lexicon[i]) {
        index_change_delete.push(i);
      }else if (lexicon[i]) {
        index_change_append.push(i);
      }
    }

    this.setData({
      nHidden: false,
      isDown: true,//启动进度条
      percent: 99,
    });

    for (let item of index_change_delete) {
      let filename = this.file_name_get(this.data.items[item].name)
      this.deal_file_delete(filename);//删除要删除的
    }
    for (let item of index_change_append) {
      let filename = this.file_name_get(this.data.items[item].name)
      this.deal_file_add(filename);//添加新的，从而避免重复词被删除
    }

    this.setData({
      percent: 100,
    });
  },

  file_name_get: function(fileName) {
    var that = this;
    var dealFilePath;
    fileSystemManager.access({
      path: famFilePath + "/" + fileName + '.csv', // 文件 ID
      success: res => {
        dealFilePath = famFilePath + "/" + fileName + '.csv';
        console.log(dealFilePath);
        return dealFilePath;
      },
      fail: res => {
        wx.cloud.downloadFile({
          fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/lexicon/' + fileName + '.csv', // 文件 ID
          success: res1 => {
            fileSystemManager.copyFile({
              srcPath: res1.tempFilePath,
              destPath: famFilePath + "/" + fileName + '.csv', // 文件 ID
              success: res2 => {
                dealFilePath = famFilePath + "/" + fileName + '.csv';
                console.log(dealFilePath);
                return dealFilePath;
              },
              fail: console.err
            })
          },
          fail: console.error
        })
      },
    })
    return dealFilePath;
  },
  
  deal_file_add:(tempFilePath) => {
    console.log(tempFilePath);
    var word_familiar_list = [];
    fileSystemManager.readFile({
      filePath: tempFilePath,
      encoding: 'utf8',
      success: res => {
        word_familiar_list = res.data.split("\n").slice(1);
        utils_word.appendFamiliar(word_familiar_list);
      },
      fail: err => {
        console.log('readFile fail', err)
      }
    });
  },
  deal_file_delete: (tempFilePath) => {
    console.log(tempFilePath);
    var word_familiar_list = [];
    fileSystemManager.readFile({
      filePath: tempFilePath,
      encoding: 'utf8',
      success: res => {
        word_familiar_list = res.data.split("\n").slice(1);
        utils_word.deleteFamiliarFromFamiliarTrie(word_familiar_list);
      },
      fail: err => {
        console.log('readFile fail', err)
      }
    });
  },
  modalconfirm: function() {
    this.setData({
      nHidden: true
    });
  },
})