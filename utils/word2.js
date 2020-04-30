const util_trie = require('./trie.js');

// 音频播放相关
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.autoplay = false;
innerAudioContext.onPlay(() => {
  console.log("开始播放")
})
innerAudioContext.onError((res) => {
  console.log(res.errMsg)
  console.log(res.errCode)
})

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

  getDefinition = () => {
    if (typeof(this.definition) === 'string') {
      this.definition = this.definition.split(/\\n/);
    }
    return this.definition.filter(s => s && s.trim());
  }

  getTranslation = () => {
    if (typeof(this.translation) === 'string') {
      this.translation = this.translation.split(/\\n/);
    }
    return this.translation.filter(s => s && s.trim());
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
    if (typeof(this.exchange === 'string')) {
      try {
        for (let element of this.exchange.split('/')) {
          let temp = element.split(':');
          res[temp[0]] = temp[1];
        }
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
      console.log("In getAudio()," + this.audio.filename)
      // 返回音频地址
      return this.audio.filename;
    }
  }
  playAudio() {
    let tempAudioPath = this.getAudio();
    if (!tempAudioPath) {
      var plugin = requirePlugin("WechatSI");
      var that = this;
      plugin.textToSpeech({
        lang: "en_US",
        tts: true,
        content: that._id,
        success: function (res) {
          console.log("succ tts", res.filename)
          that.audio = res;
          setWord(that);  //  保存音频临时链接等信息
          innerAudioContext.src = res.filename;
        }
      })
    } else {
      console.log("使用临时链接成功")
      innerAudioContext.src = tempAudioPath;
    }
    innerAudioContext.play();
  }

  // playAudio() {
  //   let tempAudioPath = this.getAudio();
  //   if (!tempAudioPath) {
  //     var plugin = requirePlugin("WechatSI");
  //     var that = this;
  //     plugin.textToSpeech({
  //       lang: "en_US",
  //       tts: true,
  //       content: that._id,
  //       success: function (res) {
  //         console.log("succ tts", res.filename)
  //         that.audio = res;
  //         setWord(that);
  //         const innerAudioContext = wx.createInnerAudioContext();
  //         innerAudioContext.autoplay = true;
  //         innerAudioContext.src = res.filename;
  //         innerAudioContext.onPlay(() => {
  //           console.log("开始播放")
  //         })
  //         innerAudioContext.onError((res) => {
  //           console.log(res.errMsg)
  //           console.log(res.errCode)
  //         })
  //       }
  //     })
  //   } else {
  //     console.log("使用临时链接成功")
  //     const innerAudioContext = wx.createInnerAudioContext();
  //     innerAudioContext.autoplay = true;
  //     innerAudioContext.src = tempAudioPath;
  //     innerAudioContext.onPlay(() => {
  //       console.log("开始播放")
  //     })
  //     innerAudioContext.onError((res) => {
  //       console.log(res.errMsg)
  //       console.log(res.errCode)
  //     })
  //   }
  // }
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
      word = new Word2(res.data, true);
      setWord(word);
    }).catch(reason => {
      console.warn(reason);
      console.warn("Fail to get word from cloud database lexicon.")
      word = new Word2({_id: id});
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
  Word: Word2,
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