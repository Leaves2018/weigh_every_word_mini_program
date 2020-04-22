const util_trie = require('./trie.js');

class Word2 {
  constructor(word) {
    this._id = word._id;
    this.phonetic = word.phonetic;
    this.definition = word.definition;
    this.translation = word.translation;
    this.pos = word.pos;
    this.collins = word.collins;
    this.oxford = word.oxford;
    this.tag = word.tag;
    this.bnc = word.bnc;
    this.frq = word.frq;
    this.exchange = word.exchange;
    this.detail = word.detail;
    this.audio = word.audio;
  }
}

// 查询传入的单词，返回单词对象
const db = wx.cloud.database();
const dictionary = db.collection('lexicon');
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
      wx.request({
        url: 'https://api.tianapi.com/txapi/enwords/index?key=cd30c0f60a4a72610eb97d94343d5f50&word=' + id,
        success: function (res) {
          if (res.data.code == 200) {
            word.translation = res.data.newslist[0].content;
          } else {
            word.translation = res.data.msg;
          }
        },
        fail: function (err) {
          console.log(err);
        }
      });
      // console.warn(reason);
      console.warn("Fail to get word from cloud database lexicon.")
      word = {
        _id: id,
        phonetic: "",
        definition: "",
        pos: "",
        collins: "",
        oxford: "",
        tag: "",
        bnc: "",
        frq: "",
        exchange: "",
        detail: "",
        audio: "",
        translation: "",
      }
    })
  }
  return word;
}

/**
 * 将单词对象存储到本地
 */
const setWord = (word) => {
  if (typeof (word._id) !== "string") {
    console.warn(_id + "is not a string");
  } else {
    // 通过Word构造函数处理word某些值不为string（如undefined）的情况
    word = new Word2(word);
    wx.setStorage({
      key: word._id,
      data: word,
    });
  }
}

const getFamiliar = () => {
  return util_trie.getTrieFromStorage('familiar_list');
}

// familiar可以为Trie类型或者[string]类型（后者会被自动解析成trie） 
const setFamiliar = (familiar) => {
  util_trie.setTrieInStorage('familiar_list', familiar);
}

// INPUT  字符串列表类型，每个属性是一个单词 
const appendFamiliar = (familiar_words) => {
  if (familiar_words.length === 0) {
    return;
  }
  var familiar_trie = getFamiliar();
  familiar_words.map(word => {
    familiar_trie.insertData(word);
  })
  setFamiliar(familiar_trie);
}

// INPUT  字符串列表类型，每个属性是一个单词 
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

const deleteVocabularyFromVocabularyTrie = (vocabulary_words) => {
  if (vocabulary_words.length === 0) {
    return;
  }
  var vocabulary_trie = getVocabulary();
  vocabulary_words.map(word => {
    vocabulary_trie.deleteData(word);
  })
  setVocabulary(vocabulary_trie);
}

const deleteFamiliarFromFamiliarTrie = (familiar_words) => {
  if (familiar_words.length === 0) {
    return;
  }
  var familiar_trie = getFamiliar();
  familiar_words.map(word => {
    familiar_trie.deleteData(word);
  })
  setFamiliar(familiar_trie);
}

module.exports = {
  getWord: getWord,
  setWord: setWord,
  getFamiliar: getFamiliar,
  setFamiliar: setFamiliar,
  appendFamiliar: appendFamiliar,
  deleteFamiliar: deleteFamiliar,
  getVocabulary: getVocabulary,
  setVocabulary: setVocabulary,
  appendVocabulary: appendVocabulary,
  deleteVocabulary: deleteVocabulary,
  deleteVocabularyFromVocabularyTrie: deleteVocabularyFromVocabularyTrie,
  deleteFamiliarFromFamiliarTrie: deleteFamiliarFromFamiliarTrie,
} 