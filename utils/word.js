// 查询传入的单词，返回单词对象
const db = wx.cloud.database();
const dictionary = db.collection('dictionary');
const _ = db.command;

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
      wx.setStorage({
        key: id,
        data: word,
      })
    }).catch(reason => {
      console.log(reason);
    })
  }
  return word;
}

module.exports = {
  getWordFromStorage: getWordFromStorage,
}