//search.js
const app = getApp()
const utils_word = require('../../utils/word2.js');
var namearray = ['dictionary_zk', 'dictionary_gk', 'dictionary_cet4', 'dictionary_cet6', 'dictionary_ky', 'dictionary_toefl','dictionary_ielts','dictionary_gre'];
var names = [];
var fileflag;
var i;

Page({
  data: {
    items: [
      { name: 'dictionary_zk', value: '初中词汇'},
      { name: 'dictionary_gk', value: '高中词汇'},
      { name: 'dictionary_cet4', value: '四级词汇' },
      { name: 'dictionary_cet6', value: '六级词汇'},
      { name: 'dictionary_ky', value: '考研词汇' },
      { name: 'dictionary_toefl', value: '托福词汇' },
      { name: 'dictionary_ielts', value: '雅思词汇' },
      { name: 'dictionary_gre', value: 'GRE词汇' },
    ],
    familiar_lexicon: [false, false, false, false, false, false, false, false],
    isDown:false,
    percent:0,
    nHidden:true,
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
    fileflag = wx.getStorageSync('fileflag');
    if (typeof (fileflag) === "string") {
      fileflag = [false, false, false, false, false, false, false, false];
    }

    this.setData({
      nHidden: false,
      isDown: true,
      percent: 99,
    });

    for (i = 0; i < fileflag.length; i++) {
      this.checkbox_download(fileflag[i],lexicon[i],this.data.items[i].name)
    }
    this.setData({
      percent: 100,
    });

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
      lexicon = [false, false, false, false, false, false, false, false];
    }
  
    this.setData({
      familiar_lexicon: lexicon,
    });
  },
  modalconfirm1: function () {
    this.setData({
      nHidden: true
    });
  },
  checkbox_download: function(alreadyload,choose,add) {
    var word_familiar_list = [];
    if (!alreadyload && choose) {
      fileflag[i] = true; 
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/'+add+'.json', // 文件 ID
        success: res => {
          console.log(res.tempFilePath);
          // 返回临时文件路径
          wx.request({
            url: res.tempFilePath,
            success: function (res) {
              for (var element of res.data) {
                //utils_word.setWord(element);
                word_familiar_list.push(element._id);
              }
              utils_word.appendFamiliar(word_familiar_list);
            }
          })
        },
        fail: console.error
      })
    }
    if (!choose) {
      utils_word.deleteFamiliar(word_familiar_list);
    }
  },
})
