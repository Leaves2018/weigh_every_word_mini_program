const utilTrie = require('./trie.js');
const app = getApp();
/**
 * Word的类定义
 * 可用于检测输入是否为单词对象
 * 以及调用类型方法
 */
class Word2 {
  constructor(word, auto=false) {
    this._id = word._id;
    this.phonetic = word.phonetic || "";
    this.definition = word.definition || "";
    this.translation = word.translation || "";
    this.pos = word.pos || "";
    this.collins = word.collins || 0;
    this.oxford = word.oxford || 0;
    this.tag = word.tag || "";
    this.bnc = word.bnc || "";
    this.frq = word.frq || "";
    this.exchange = word.exchange || "";
    this.detail = word.detail || "";
    this.audio = word.audio || "";

    // 调用自动类型转换
    if (auto) {
      this.autoConversion();
    }
  }

  autoConversion = () => {
    this.getDefinition();
    this.getTranslation();
    this.getTag();
    this.getExchange();
  }

  reform = (text) => {
    // console.log(text)
    var res = {};
    text = text.split(/\n|\\n/); // 与在console中直接运行表现不一致；这里文本中的\n会被自动转换成\\n，但直接用\\n分割还是有问题（\nn识别不了）
    // console.log("text="+JSON.stringify(text));
    text.forEach((value, index, array) => {
      let re = /\s+/g;
      // console.log(value);
      let temp = re.exec(value);
      // console.log(JSON.stringify(temp))
      let partOfSpeech = value.substring(0, re.lastIndex).trim();
      // console.log(partOfSpeech);
      if (!res[partOfSpeech]) {
        res[partOfSpeech] = [];
      }
      res[partOfSpeech].push(value.substring(re.lastIndex));
    })
    return res;
  }

  getDefinition = () => {
    if (typeof(this.definition) === 'string') {
      this.definition = this.reform(this.definition);
    }
    return this.definition;
  }

  getTranslation = () => {
    if (typeof(this.translation) === 'string') {
      this.translation = this.reform(this.translation);
    }
    return this.translation;
  }

  getTag = () => {
    var res = {};
    if (typeof(this.tag) === 'string') {
      try {
        var m = new Map([
          ['zk', '中考'], ['gk', '高考'], ['cet4', '四级'], ['cet6', '六级'],
          ['ky', '考研'], ['toefl', '托福'], ['ielts', '雅思'], ['gre', 'GRE']]);
        for (let element of this.tag.split(/\s+/)) {
          res[element] = m.get(element);
        }
        this.tag = res;
      } catch (e) {
        console.warn(e);
        res = {};
      }
    } else if (typeof(this.tag) === 'object') {
      res = this.tag;
    }
    return res;
  }

  getExchange = () => {
    var res = {};
    if (typeof(this.exchange) === 'string') {
      try {
        for (let element of this.exchange.split('/')) {
          let temp = element.split(':');
          res[temp[0]] = temp[1];
        }
        this.exchange = res;
      } catch (e) {
        console.warn(e);
        res = {};
      }
    } else if (typeof(this.exchange === 'object')) {
      res = this.exchange;
    }
    return res;
  }

  getAudio = () => {
    var timestamp = Math.floor(Date.parse(new Date()) / 1000);
    // 如果没有获取过音频或者超时，则返回失败
    if (typeof (this.audio) === 'string' || timestamp > this.audio.expired_time) {
      return undefined;
    } else {
      // console.log("In getAudio()," + this.audio.filename)
      // 返回音频地址
      return this.audio.filename;
    }
  }
  playAudio() {
    // 音频播放相关
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = false;
    innerAudioContext.onPlay(() => {
      // console.log("开始播放")
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    let tempAudioPath = this.getAudio();
    if (!tempAudioPath) {
      var plugin = requirePlugin("WechatSI");
      var that = this;
      plugin.textToSpeech({
        lang: "en_US",
        tts: true,
        content: that._id,
        success: function (res) {
          // console.log("succ tts", res.filename)
          that.audio = res;
          setWord(that);  //  保存音频临时链接等信息
          innerAudioContext.src = res.filename;
          innerAudioContext.play();
        }
      })
    } else {
      // console.log("使用临时链接成功")
      innerAudioContext.src = tempAudioPath;
      innerAudioContext.play();
    }
  }
}

/**
 * 查询传入的单词，返回单词对象
 */
const db = wx.cloud.database();
const dictionary = db.collection('lexicon');
const _ = db.command;

const getWord = async (id) => {
  var word = null;
  try {
    word = wx.getStorageSync(id) || wx.getStorageSync(id.toLowerCase());
    if (typeof (word) === "string") {
      throw id + " is undefined in storage."
    }
    word = new Word2(word); // 从缓存中取得得数据已经转换过格式，无需再转
  } catch (e) {
    console.log(e);
    await dictionary.where({_id: _.eq(id).or(_.eq(id.toLowerCase()))}).get().then(res => {
      word = new Word2(res.data[0], true); // 从数据库获得的数据，部分字段需要转换格式
      setWord(word);
    }).catch(reason => {
      console.warn(reason);
      console.warn(`Fail to get word '${id}' from cloud database lexicon.`)
      word = new Word2({ _id: id });  // 找不到，占位用，无需转换格式
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





// /**
//  * 从本地缓存中获取熟词树
//  * 如果缓存中没有，则会得到getTrieFromStorage()创建的一棵新树
//  */
// const getFamiliar = () => {
//     var familiarTrie = utilTrie.getTrieFromStorage('familiar_list');
// }

// /**
//  * 保存熟词树至缓存
//  * 风险：如果传入参数familiar出错，可能导致数据丢失
//  */
// const setFamiliar = (familiar) => {
//   utilTrie.setTrieInStorage('familiar_list', familiar);
// }

// const saveFamiliar = () => {
//   utilTrie.setTrieInStorage('familiar_list', getApp().vocabularyTrie);
// }

// /**
//  * 将字符串数组类型变量挨个导入familiarTrie中，并保存至本地缓存
//  */
// const appendFamiliar = (familiarWords) => {
//   if (familiarWords.length > 0) {
//     var familiarTrie = getFamiliar();
//     familiarWords.forEach(value => {
//       familiarTrie.insertData(value);
//     })
//     setFamiliar(familiarTrie);
//   }
// }

// /**
//  * 从熟词本中删去生词
//  * 命名delete后是“删什么”而不是“从哪删”
//  * 输入应为字符串数组类型
//  */
// const deleteVocabulary = (vocabularyWords) => {
//   if (vocabularyWords.length > 0) {
//     var familiarTrie = getFamiliar();
//     vocabularyWords.forEach(value => {
//       familiarTrie.deleteData(value);
//     })
//     setFamiliar(familiarTrie);
//   }
// }

// /**
//  * 从本地缓存获取生词树
//  */
// const getVocabulary = () => {
//   return utilTrie.getTrieFromStorage('vocabulary_list');
// }

// /**
//  * 保存生词树至本地缓存
//  * 风险：如果传入参数vocabulary出错，可能导致数据丢失
//  */
// const setVocabulary = (vocabulary) => {
//   utilTrie.setTrieInStorage('vocabulary_list', vocabulary);
// }

// const saveVocabulary = () => {
//   utilTrie.setTrieInStorage('vocabulary_list', getApp().vocabularyTrie);
// }

// const appendVocabulary = (vocabulary_words) => {
//   if (vocabulary_words.length === 0) {
//     return;
//   }
//   var vocabulary_trie = getVocabulary();
//   vocabulary_words.map(word => {
//     vocabulary_trie.insertData(word);
//   })
//   setVocabulary(vocabulary_trie);
// }

// const deleteFamiliar = (familiar_words) => {
//   if (familiar_words.length === 0) {
//     return;
//   }
//   var vocabulary_trie = getVocabulary();
//   familiar_words.map(word => {
//     vocabulary_trie.deleteData(word);
//   })
//   setVocabulary(vocabulary_trie);
// }

// const deleteVocabularyFromVocabularyTrie = (vocabulary_words) => {
//   if (vocabulary_words.length === 0) {
//     return;
//   }
//   var vocabulary_trie = getVocabulary();
//   vocabulary_words.map(word => {
//     vocabulary_trie.deleteData(word);
//   })
//   setVocabulary(vocabulary_trie);
// }

// const deleteFamiliarFromFamiliarTrie = (familiar_words) => {
//   if (familiar_words.length === 0) {
//     return;
//   }
//   var familiar_trie = getFamiliar();
//   familiar_words.map(word => {
//     familiar_trie.deleteData(word);
//   })
//   setFamiliar(familiar_trie);
// }

module.exports = {
  Word: Word2,
  getWord: getWord,
  setWord: setWord,
  // getFamiliar: getFamiliar,
  // setFamiliar: setFamiliar,
  // saveFamiliar: saveFamiliar,
  // appendFamiliar: appendFamiliar,
  // deleteFamiliar: deleteFamiliar,
  // getVocabulary: getVocabulary,
  // setVocabulary: setVocabulary,
  // saveVocabulary: saveVocabulary,
  // appendVocabulary: appendVocabulary,
  // deleteVocabulary: deleteVocabulary,
  // deleteVocabularyFromVocabularyTrie: deleteVocabularyFromVocabularyTrie,
  // deleteFamiliarFromFamiliarTrie: deleteFamiliarFromFamiliarTrie,
} 