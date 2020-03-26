// 查询传入的单词，返回单词对象
const db = wx.cloud.database();
const dictionary = db.collection('dictionary');
const _ = db.command;

// const getWordFromStorage = id => {
//   var word = null;
//   try {
//     word = wx.getStorageSync(id);
//     if (typeof(word) === "string") {
//       throw id + " is undefined in storage."
//     }
//     return word;
//   } catch (e) {
//     console.log(e);
//     dictionary.doc(id).get().then(res => {

//       word = res.data;
//       wx.setStorage({
//         key: id,
//         data: word,
//       })
//     }).catch(reason => {
//       console.log(reason);
//     })
//   }
//   return word;
// }

function getWordFromStorage(id) {
  var word = null;
  try {
    word = wx.getStorageSync(id);
    if (typeof (word) === "string") {
      throw id + " is undefined in storage."
    }
  } catch (e) {
    console.warn(e);
  }
  return word;
}

// function getWordFromCloudDatabase(id) {
//   var word = null;
//   dictionary.doc(id).get().then(res => {
//     word = res.data;
//     wx.setStorage({
//       key: id,
//       data: word,
//     })
//   }).catch(reason => {
//     console.log(reason);
//     word = { _id: id, chinese: "暂缺该单词" };
//   })
//   return word;
// }

function getWordFromStorageOrDatabase(id) {
  var word = getWordFromStorage(id);
  return new Promise(function (resolve, reject) {
    if (typeof (word) === "string") {
      reject(getWordFromCloudDatabase(id));
    } else {
      resolve(word);
    }
  });
}

function getWord(id) {
  var word = null;
  var p = getWordFromStorageOrDatabase(id);
  p.then(function (local_word) {
    word = local_word;
  }).catch(function () {
    dictionary.doc(id).get().then(res => {
      word = res.data;
      wx.setStorage({
        key: id,
        data: word,
      })
    }).catch(reason => {
      console.log(reason);
      word = { _id: id, chinese: "暂缺该单词" };
    })
  })
  return word;
}

module.exports = {
  getWord: getWord,
}