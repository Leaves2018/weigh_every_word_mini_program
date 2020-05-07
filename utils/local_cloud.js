const app = getApp();
const utils_word = require('./word2.js');
const utils_his = require('./history.js');
var filePaths = wx.env.USER_DATA_PATH;
const fileSystemManager = wx.getFileSystemManager();

const local_to_cloud = () => {
  var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
  var fam_trie_temp = fam_trie.getAllData();
  var fam_trie_data = fam_trie_temp.join("\n");
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
  var his_list = utils_his.getHistoryListFromStorage();
  var his_detail_list = [];
  for (let element in his_list.items) {
    let eletmp = utils_his.getHistoryFromStorage(element);
    his_detail_list.push(eletmp);
  }
  let his_detail_list_json = JSON.stringify(his_detail_list);
  fileSystemManager.writeFile({
    filePath: filePaths + "/" + app.globalData.openid + "_history_detail_list.json",
    data: his_detail_list_json,
    success: res => {
      console.log("success");
      wx.cloud.uploadFile({
        filePath: filePaths + "/" + app.globalData.openid + "_history_detail_list.json",
        cloudPath: "backup/history/" + app.globalData.openid + '_history_detail_list.json', // 文件路径
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
}

const cloud_to_local = (passage) => {
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/familiar/' + app.globalData.openid + '_familiar.csv', // 文件 ID
    success: res => {
      fileSystemManager.readFile({
        filePath: res.tempFilePath,
        encoding: 'utf8',
        success: res => {
          let word_familiar_list = res.data.split("\n");
          utils_word.appendFamiliar(word_familiar_list);
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
    fail: console.error
  });
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/vocabulary/' + app.globalData.openid + '_vocabulary.csv', // 文件 ID
    success: res => {
      fileSystemManager.readFile({
        filePath: res.tempFilePath,
        encoding: 'utf8',
        success: res => {
          let word_vocabulary_list = res.data.split("\n");
          utils_word.appendVocabulary(word_vocabulary_list);
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
    fail: console.error
  });
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/history/' + app.globalData.openid + '_history_detail_list.json', // 文件 ID
    success: res => {
      fileSystemManager.readFile({
        filePath: res.tempFilePath,
        encoding: 'utf8',
        success: res => {
          let temp = JSON.parse(res.data);
          for (let element of temp) {
            var history = new utils_his.History(element);
          };
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
    fail: console.error
  });
}

module.exports = {
  local_to_cloud: local_to_cloud,
  cloud_to_local: cloud_to_local,
}