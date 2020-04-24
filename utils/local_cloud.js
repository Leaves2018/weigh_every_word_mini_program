const app = getApp();
const utils_word = require('./word2.js');
const utils_his = require('./history.js');
var filePaths = wx.env.USER_DATA_PATH;
const fileSystemManager = wx.getFileSystemManager();

const local_to_cloud = () => {
  var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
  var fam_trie_temp = fam_trie.getAllData();
  fam_trie_temp.splice(0, 0, "_id");
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
  var his_list = utils_his.getHistoryListFromStorage();
  let his_list_json = JSON.stringify(his_list);
  fileSystemManager.writeFile({
    filePath: filePaths + "/" + app.globalData.openid + "_history_list.json",
    data: his_list_json,
    success: res => {
      console.log("success");
      wx.cloud.uploadFile({
        filePath: filePaths + "/" + app.globalData.openid + "_history_list.json",
        cloudPath: "backup/history/history_list/" + app.globalData.openid + '_history_list.json', // 文件路径
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
  var his_done_list = utils_his.getHistoryListDoneFromStorage();
  let his_done_list_json = JSON.stringify(his_done_list);
  fileSystemManager.writeFile({
    filePath: filePaths + "/" + app.globalData.openid + "_history_done_list.json",
    data: his_done_list_json,
    success: res => {
      console.log("success");
      wx.cloud.uploadFile({
        filePath: filePaths + "/" + app.globalData.openid + "_history_done_list.json",
        cloudPath: "backup/history/history_done_list/" + app.globalData.openid + '_history_done_list.json', // 文件路径
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
  var his_detail_list = [];
  for (var element of his_list) {
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
        cloudPath: "backup/history/history_detail_list/" + app.globalData.openid + '_history_detail_list.json', // 文件路径
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
          let word_familiar_list = res.data.split("\n").slice(1);
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
          let word_vocabulary_list = res.data.split("\n").slice(1);
          utils_word.appendVocabulary(word_vocabulary_list);
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
    fail: console.error
  });
  var his_list = [];
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/history/history_list/' + app.globalData.openid + '_history_list.json', // 文件 ID
    success: res => {
      fileSystemManager.readFile({
        filePath: res.tempFilePath,
        encoding: 'utf8',
        success: res => {
          his_list = JSON.parse(res.data);
          utils_his.setHistoryListInStorage(his_list);
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
    fail: console.error
  });
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/history/history_done_list/' + app.globalData.openid + '_history_done_list.json', // 文件 ID
    success: res => {
      fileSystemManager.readFile({
        filePath: res.tempFilePath,
        encoding: 'utf8',
        success: res => {
          let his_done_list = JSON.parse(res.data);
          utils_his.setHistoryListDoneInStorage(his_done_list);
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
    fail: console.error
  });
  wx.cloud.downloadFile({
    fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/backup/history/history_detail_list/' + app.globalData.openid + '_history_detail_list.json', // 文件 ID
    success: res => {
      fileSystemManager.readFile({
        filePath: res.tempFilePath,
        encoding: 'utf8',
        success: res => {
          let temp = JSON.parse(res.data);
          for (var i = 0; i < his_list.length; i++) {
            utils_his.setHistoryInStorage(his_list[i], temp[i]);
          }
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