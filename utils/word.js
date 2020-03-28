const util_trie = require('./trie.js');
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

const getFamiliar = () => {
  return util_trie.getTrieFromStorage('familiar_list');
}

const setFamiliar = (familiar) => {
  util_trie.setTrieInStorage('familiar_list', familiar);
}

const appendFamiliar = (familiar_words) => {
  if (familiar_words.length===0) {
    return;
  }
  var familiar_trie = getFamiliar();
  familiar_words.map(word => {
    familiar_trie.insertData(word);
  })
  setFamiliar(familiar_trie);
}

const deleteVocabulary = (vocabulary_words) => {
  if (vocabulary_words.length === 0) {
    return;
  }
  var familiar_trie = getFamiliar();
  vocabulary_words.map(word => {
    familiar_trie.deleteData(word);
  })
  setFamiliar(familiar_trie);
}

const getVocabulary = () => {
  return util_trie.getTrieFromStorage('vocabulary_list');
}

const setVocabulary = (vocabulary) => {
  util_trie.setTrieInStorage('vocabulary_list', vocabulary);
}

const appendVocabulary = (vocabulary_words) => {
  if (vocabulary_words.length === 0) {
    return;
  }
  var vocabulary_trie = getVocabulary();
  vocabulary_words.map(word => {
    vocabulary_trie.insertData(word);
  })
  setVocabulary(vocabulary_trie);
}

const deleteFamiliar = (familiar_words) => {
  if (familiar_words.length === 0) {
    return;
  }
  var vocabulary_trie = getVocabulary();
  familiar_words.map(word => {
    vocabulary_trie.deleteData(word);
  })
  setVocabulary(vocabulary_trie);
}

module.exports = {
  getWord: getWord,
  getFamiliar: getFamiliar,
  setFamiliar: setFamiliar,
  appendFamiliar: appendFamiliar,
  deleteFamiliar: deleteFamiliar,
  getVocabulary: getVocabulary,
  setVocabulary: setVocabulary,
  appendVocabulary: appendVocabulary,
  deleteVocabulary: deleteVocabulary,
}