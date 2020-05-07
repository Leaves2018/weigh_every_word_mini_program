const utils_word = require('./word2.js');
const utils_his = require('./history.js');
const utils_util = require('./util.js');
const app = getApp();
const stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];
class Word {
  constructor(tag = 'un', location = '0.0') {
    this.tag = tag;
    this.location = location;
  }
}
class HistoryList {
  constructor(items = {}) {
    if(items.items!==undefined){
      this.items = items.items;
    }else {
      this.items = items;
    }
    this.save();
  }
  appendHistory(history) {
    this.items[history.uuid] = new HistoryListItem(history);
    this.save();
  }
  deleteHistory(historyuuid) {
    delete this.items[historyuuid];
    wx.removeStorage({
      key: historyuuid,
      success: function(res) {},
    })
    this.save();
  }
  save() {
    wx.setStorage({
      key: 'history_list',
      data: this,
    })
  }
}
class HistoryListItem {
  constructor(history) {
    this.headline = history.headline;
    this.date = history.date;
    this.done = history.done;
    this.plus = history.plus;
  }
}
class History {
  constructor(passage, headline = "") {
    if (passage === "") {
      return;
    }
    if (typeof(passage) === "object") {
      this.headline = passage.headline;
      this.date = passage.date;
      this.uuid = passage.uuid;
      this.done = passage.done;
      this.plus = passage.plus;
      this.passageFragments = passage.passageFragments;
      for (let word in passage.words) {
        if (getApp().familiarTrie.search(word)) {
          passage.words[word].tag = 'fa';
        } else if (getApp().vocabularyTrie.search(word)) {
          passage.words[word].tag = 'vo';
        } else {
          passage.words[word].tag = 'un';
        }
      }
      this.words = passage.words;
    } else {
      this.date = new Date();
      this.uuid = this.uuid();
      this.done = false;
      this.plus = 0;

      this.passageFragments = utils_util.splitPassage(passage);

      if (typeof(headline) === "string" && headline.trim()) {
        this.headline = headline;
      } else {
        headline = this.passageFragments[0][0];
        this.headline = headline.length > 140 ? headline.substring(0, 140) : headline;
      }

      var words = passage.replace(/[^a-zA-Z\-]/g, ' ').split(" ");
      words = [...new Set(words)]; //单词去重
      words = words.filter(function(x) {
        return x && x.trim() && x.length > 1;
      }); //单词去空
      words = utils_util.arrSub(words, stop_words); //去除停止词

      var voc_temp = words.filter(x => !getApp().familiarTrie.search(x));

      //分开生词和未知词
      var voc_really = words.filter(x => getApp().vocabularyTrie.search(x)); //生词
      var unknown_words = utils_util.arrSub(voc_temp, voc_really); //未知词

      this.words = {};
      for (var element of voc_really) {
        for (var i = 0; i < this.passageFragments.length; i++) {
          for (var j = 0; j < this.passageFragments[i].length; j++) {
            if (this.passageFragments[i][j].indexOf(element) !== -1) {
              this.words[element] = new Word('vo', i + '.' + j);
            }
          }
        }
      }
      for (var element of unknown_words) {
        for (var i = 0; i < this.passageFragments.length; i++) {
          for (var j = 0; j < this.passageFragments[i].length; j++) {
            if (this.passageFragments[i][j].indexOf(element) !== -1) {
              this.words[element] = new Word('vo', i + '.' + j);
            }
          }
        }
      }
    }
    this.save();
  }

  save = (refreshPlus = false) => {
    if (refreshPlus) {
      this.plus = 0;
<<<<<<< Updated upstream
      let lengthofwords = 0;
      for (let key in this.words) {
=======
      for (let key in Object.keys(this.words)) {
>>>>>>> Stashed changes
        if (this.words[key].tag === 'fa') {
          this.plus += 1;
        }
      }
      this.done = (this.plus === Object.keys(this.words).length);
    }
    wx.setStorageSync(this.uuid, this);
    let historyList = getHistoryListFromStorage();
    historyList.appendHistory(this);
  }
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

const getHistoryListFromStorage = () => {
  var history_list;
  try {
    history_list = wx.getStorageSync('history_list');
    if (typeof(history_list) === "string") {
      throw "'history_list' is not existed. A new history_list will be created.";
    }
    history_list = new HistoryList(history_list);
  } catch (e) {
    console.warn(e);
    history_list = new HistoryList();
  } finally {
    return history_list;
  }
}


// 如果本地存储找不到以headline为key的记录，会返回空字符串
const getHistoryFromStorage = uuid => {
  var history = null;
  try {
    var history = wx.getStorageSync(uuid);
    if (typeof(history) === "string") {
      throw `History '${uuid}' is not existed.`;
    }
  } catch (e) {
    console.warn(e);
  } finally {
    return history;
  }
}


module.exports = {
  History: History,
  getHistoryFromStorage: getHistoryFromStorage,
  getHistoryListFromStorage: getHistoryListFromStorage,
}