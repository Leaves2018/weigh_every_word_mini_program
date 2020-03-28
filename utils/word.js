// 查询传入的单词，返回单词对象
const db = wx.cloud.database();
const dictionary = db.collection('dictionary');
const _ = db.command;

const getWord = async (id) => {
  var word = null;
  try {
    word = wx.getStorageSync(id);
    if (typeof (word) === "string") {
      throw id + " is undefined in storage."
    }
  } catch (e) {
    console.log(e);
    await dictionary.doc(id).get().then(res => {
      word = res.data;
      wx.setStorage({
        key: id,
        data: word,
      })
    }).catch(reason => {
      console.log(reason);
      console.log("Fail to get word from cloud database dictionary.")
      word = {
        _id: id,
        level: "暂无",
        phonetic: "暂无",
        context: "暂无",
        chinese: "暂无",
        english: "暂无",
      }
    })
  }
  return word;
}

// const getWordFromStorage = id => {
//   var p = getWord(id);
//   var word = null;
//   p.then(result => {
//     word = result;
//   })
//   return word;
// }

module.exports = {
  getWord: getWord,
}