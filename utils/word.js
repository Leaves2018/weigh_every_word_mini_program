// 查询传入的单词，返回单词对象
const db = wx.cloud.database();
const dictionary = db.collection('dictionary');
const _ = db.command;
// const getWordFromStorage = name => {
//   var word = null;
//   try {
//     word = wx.getStorageSync(name);
//   } catch (e) {
//     dictionary.where({
//       name: _.eq(name)
//     }).get().then(res => {
//       // 查询云数据库并将结果存到本地
//       word = JSON.parse(res.data);
//       wx.setStorage({
//         key: name,
//         data: word,
//       })
//     });
//   } finally {
//     return word;
//   }
// }

// const getWordFromStorage = id => {
//   var word = null;
//   try {
//     word = wx.getStorageSync(id);
//     if (word === "") {
//       console.log(id + " is undefined in storage.");
//       dictionary.doc(id).get().then(res => {
//         word = res.data;
//         wx.setStorage({
//           key: id,
//           data: word,
//         })
//       }).catch(reason => {
//         console.log(reason);
//       })
//     }
//   } catch (e) {
//     console.log(e);
//   }
//   return word;
// }
const getWordFromStorage = id => {
  var word = null;
  try {
    word = wx.getStorageSync(id);
    if (typeof(word) === "string") {
      throw id + " is undefined in storage."
    }
  } catch (e) {
    console.log(e);
    dictionary.doc(id).get().then(res => {
      word = res.data;
      // wx.setStorage({
      //   key: id,
      //   data: word,
      // })
      wx.setStorageSync(id, word);
    }).catch(reason => {
      console.log(reason);
    })
  } finally {
    return word;
  }
}
module.exports = {
  getWordFromStorage: getWordFromStorage,
}