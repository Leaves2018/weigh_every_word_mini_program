const app = getApp();
const utils_word = require('./word2.js');
var filePaths = wx.env.USER_DATA_PATH;

const local_to_cloud = () => {
  var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
  var fam_trie_temp = fam_trie.getAllData();
  fam_trie_temp.splice(0, 0, "_id");
  var fam_trie_data = fam_trie_temp.join("\n");
  const fileSystemManager = wx.getFileSystemManager();
  fileSystemManager.writeFile({
    filePath: filePaths + "/" + app.globalData.openid + "_familiar.csv",
    data: fam_trie_data,
    success: res => {
      console.log("success");
      wx.cloud.uploadFile({
        filePath: filePaths + "/" + app.globalData.openid + "_familiar.csv",
        cloudPath: "backup/familiar/" + app.globalData.openid + '_familiar.csv', // 文件路径
      }).then(res => {
        // get resource ID
        console.log(res.fileID)
      }).catch(error => {
        console.log(error)
      })
    },
    fail: res => {
      console.log(res);
    }
  });
  var voc_trie = utils_word.getVocabulary(); // 从本地获取熟词库
  var voc_trie_temp = voc_trie.getAllData();
  voc_trie_temp.splice(0, 0, "_id");
  var voc_trie_data = voc_trie_temp.join("\n");
  fileSystemManager.writeFile({
    filePath: filePaths + "/" + app.globalData.openid + "_vocabulary.csv",
    data: voc_trie_data,
    success: res => {
      console.log("success");
      wx.cloud.uploadFile({
        filePath: filePaths + "/" + app.globalData.openid + "_vocabulary.csv",
        cloudPath: "backup/vocabulary/" + app.globalData.openid + '_vocabulary.csv', // 文件路径
      }).then(res => {
        // get resource ID
        console.log(res.fileID)
      }).catch(error => {
        console.log(error)
      })
    },
    fail: res => {
      console.log(res);
    }
  });

  var his_list = [];
}

const cloud_to_local = (passage) => {
  var word_familiar_list = [];
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/familiar/' + app.globalData.openid + '_familiar.csv', // 文件 ID
    success: res => {
      console.log(res.tempFilePath);
      // 返回临时文件路径
      wx.request({
        url: res.tempFilePath,
        success: function (res) {
          word_familiar_list = res.data.split("\n").slice(1);
          utils_word.appendFamiliar(word_familiar_list);
        }
      })
    },
    fail: console.error
  });
  var word_vocabulary_list = [];
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/vocabulary/' + app.globalData.openid + '_vocabulary.csv', // 文件 ID
    success: res => {
      console.log(res.tempFilePath);
      // 返回临时文件路径
      wx.request({
        url: res.tempFilePath,
        success: function (res) {
          word_vocabulary_list = res.data.split("\n").slice(1);
          utils_word.appendVocabulary(word_vocabulary_list);
        }
      })
    },
    fail: console.error
  });
}


module.exports = {
  local_to_cloud: local_to_cloud,
  cloud_to_local: cloud_to_local,
}