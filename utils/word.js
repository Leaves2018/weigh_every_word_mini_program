// 查询传入的单词，返回单词对象
const getWordFromStorage = name => {
  var word = null;
  try {
    word = wx.getStorageSync(name);
  } catch (e) {
    db.collection('dictionary').doc(name).get().then(res => {
      // 查询云数据库并将结果存到本地
      word = res.data;
      wx.setStorage({
        key: name,
        data: word,
      })
    });
  } finally {
    return word;
  }
}

module.exports = {
  getWordFromStorage: getWordFromStorage,
}