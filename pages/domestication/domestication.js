//search.js
const app = getApp()
const utils_word = require('../../utils/word2.js');
const papa = require('../../utils/papaparse.min.js'); 
var namearray = ['zk', 'gk', 'cet4', 'cet6', 'ky', 'toefl','ielts','gre'];
var names = [];
var i;
var famFilePath = wx.env.USER_DATA_PATH;
var lexicon_primary;

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

  onLoad: function () {
  
  },

  onShow: function () {
    lexicon_primary = wx.getStorageSync('familiar_lexicon');
    if (typeof (lexicon_primary) === "string") {
      lexicon_primary = [false, false, false, false, false, false, false, false];
    }
    // var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
    // var fam_trie_temp = fam_trie.getAllData();
    // fam_trie_temp.splice(0,0,"_id");
    // var fam_trie_data = fam_trie_temp.join("\n");
    // const fileSystemManager = wx.getFileSystemManager();
    // fileSystemManager.writeFile({
    //   filePath:famFilePath +"/"+ app.globalData.openId + "_familiar.csv",
    //   data: fam_trie_data,
    //   success:res=>{
    //     console.log("success");
    //     wx.cloud.uploadFile({
    //       filePath: famFilePath + "/" + app.globalData.openId + "_familiar.csv",
    //       cloudPath: "backup/familiar/" + app.globalData.openId + '_familiar.csv', // 文件路径
    //     }).then(res => {
    //       // get resource ID
    //       console.log(res.fileID)
    //     }).catch(error => {
    //       console.log(error)
    //     })
    //   },
    //   fail:res=>{
    //     console.log(res);
    //   }
    // });
    this.setData({
      familiar_lexicon: lexicon_primary,
    });
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
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
      if (lexicon[i]) {
        index_change_append.push(i);
      }
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
        // 返回临时文件路径
        wx.request({
          url: res.tempFilePath,
          success: function (res) {
            word_familiar_list = res.data.split("\n").slice(1);
            if (!choose) {
              utils_word.deleteFamiliar(word_familiar_list);
            }else{
              utils_word.appendFamiliar(word_familiar_list);
            }
          }
        })
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
