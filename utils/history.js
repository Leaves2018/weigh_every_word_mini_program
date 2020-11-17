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
    if (items.items !== undefined) {
      this.items = items.items;
    } else {
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
    this.numberOfWords = history.numberOfWords;
    this.numOfUn = history.numOfUn;
  }
}
class History {
  constructor(passage, headline = "") {
    if (passage === "") {
      return;
    }
    if (typeof(passage) === "object") {
      if (typeof (headline) === "string" && headline.trim()) {
        this.headline = headline;
      } else {
        this.headline = passage.headline;
      }
      this.date = passage.date;
      this.uuid = passage.uuid;
      this.done = passage.done;
      this.plus = passage.plus;
      this.numberOfWords = passage.numberOfWords;
      this.numOfUn = passage.numOfUn;
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
      this.save(); 
    } else {
      // this.uuid = this.uuid(this.passageFragments,passage);
      this.passageFragments = utils_util.splitPassage(passage);
      let that = this;
      wx.cloud.callFunction({
        // name: 'mysqlDatabase',
        name: 'mysql',
        data: {
          action: 'addText',
          title: this.passageFragments[0][0],
          body: passage,
        },
        success(res) {
          console.log("新增文本插入MySQL数据库成功")
          console.log(JSON.stringify(res))
          //等待返回数据库中uuid
          console.log(res.result.data[0].insertId);
          that.continueProduceHistory(res.result.data[0].insertId,passage, headline);
        },
        fail(err) {
          console.log("新增文本插入MySQL数据库失败")
          console.error(JSON.stringify(err))
        }
      });
    }
  }


  continueProduceHistory = (id,passage, headline) =>{
    console.log(id)
    console.log(passage)
    console.log(headline)
    this.date = utils_util.formatTime(new Date()).substring(0, 10);
    this.uuid = id;
    this.done = false;
    this.plus = 0;

    if (typeof(headline) === "string" && headline.trim()) {
      this.headline = headline;
    } else {
      headline = this.passageFragments[0][0];
      if (headline.length < 24) {
        this.headline = headline;
      } else {
        let wordsofheadline = headline.split(' ');
        let length = 0;
        let index;
        for (var i = 0; i < wordsofheadline.length; i++) {
          length += wordsofheadline[i].length;
          length += 1;
          if (length > 24) {
            index = i;
            break;
          }
        }
        this.headline = wordsofheadline.slice(0, index).join(' ');
      }
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
    this.numOfUn = unknown_words.length;
    this.numberOfWords = voc_really.length + unknown_words.length;
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
    this.save();
    let doNotRedirect = wx.getStorageSync('donotredirect');
    if (!doNotRedirect) {
      wx.redirectTo({
        url: `/pages/history_detail2/history_detail?historyuuid=${this.uuid}`,
      })
    }
  }


  save = (refreshPlus = false) => {
    if (refreshPlus) {
      this.plus = 0;
      this.numOfUn = 0;
      let lengthofwords = 0;
      for (let key in this.words) {
        if (this.words[key].tag === 'fa') {
          this.plus += 1;
        } else if (this.words[key].tag === 'un') {
          this.numOfUn += 1;
        }
        lengthofwords += 1;
      }
      this.done = (this.plus === lengthofwords);
    }
    console.log(this)
    wx.setStorageSync("history"+this.uuid, this);
    let historyList = getHistoryListFromStorage();
    historyList.appendHistory(this);
  }
  // uuid(passageFragmentsMode,passage) {
  //   // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  //   //   var r = Math.random() * 16 | 0,
  //   //     v = c == 'x' ? r : (r & 0x3 | 0x8);
  //   //   return v.toString(16);
  //   // });
    
  // }
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
  Word: Word,
  History: History,
  getHistoryFromStorage: getHistoryFromStorage,
  getHistoryListFromStorage: getHistoryListFromStorage,
}