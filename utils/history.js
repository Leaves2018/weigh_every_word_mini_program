const utils_word = require('./word2.js');
const utils_his = require('./history.js');
const utils_util = require('./util.js');
const app = getApp();
const stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];
class Word {
  constructor(tag='un', location='0.0'){
    this.tag = tag;
    this.location = location;
  }
}
class HistoryList {
  constructor(items = new Map()) { 
    this.items = items;
  }
  append(history) {
    this.items.set(history.uuid, new HistoryListItem(history));
  }
  delete(history) {
    this.items.delete(history.uuid);
  }
}
class HistoryListItem {
  constructor(history) {
    this.headline = history.headline;
    this.date = history.date;
    this.done = true;
    this.plus = 0;
    for (var key in history.words) {
      if(history.words[key].tag === 'fa'){
        this.plus += 1;
      }else{
        this.done = false;
      }
    }
  }
}
class History {
  constructor(passage,headline="") {
    if (passage === "") {
      return;
    }
    var re = /[\.|\?|\!\。\？\！][\"\']?/;
    this.passageFragments = utils_util.splitArticle(passage, re);

    var words = passage.replace(/[^a-zA-Z\-]/g, ' ').split(" ");
    words = [...new Set(words)];//单词去重
    words = words.filter(function (x) { return x && x.trim()&&x.length > 1; });//单词去空
    words = utils_util.arrSub(words,stop_words);//去除停止词

    var voc_temp = words.filter(x => !app.familiarTrie.search(x));

    //分开生词和未知词
    var voc_really = words.filter(x => app.vocabularyTrie.search(x));//生词
    var unknown_words = utils_util.arrSub(voc_temp, voc_really);//未知词
    
    this.words = new Map();

    for (var i = 0; i < passageFragments.length; i++) {
      for (var j = 0; j < passageFragments[i].length; j++) {
        for (var element of voc_really) {
          if (passageFragments[i][j].indexOf(element) !== -1) {
            this.words.set(element, new Word('vo', i + '.' + j));
            break;
          }
        }
        for (var element of unknown_words) {
          if (passageFragments[i][j].indexOf(element) !== -1) {
            this.words.set(element, new Word('vo', i + '.' + j));
            break;
          }
        }
      }
    }

    // for (let i = 0; i < passageFragments.length; i++) {
    //   for (let j = 0; j < passageFragments[i].length; j++) {
    //     let sentence = passageFragments[i][j];
    //     let re = /[a-zA-Z\-]+/g;
    //     let temp = null;
    //     while (temp = re.exec(sentence)) {
    //       if (voc_really.indexOf(temp[0])) {
    //         this.words.set(temp[0], new Word('vo', `${i}.${j}`))
    //       } else if (unknown_words.indexOf(temp[0])) {
    //         this.words.set(temp[0], new Word('un', `${i}.${j}`))
    //       }
    //     }
    //   }
    // }

    // for (var element of voc_really) {
    //   for (var i = 0; i < passageFragments.length; i++) {
    //     for (var j = 0; j < passageFragments[i].length; j++) {
    //       if (passageFragments[i][j].indexOf(element) !== -1) {
    //         this.words.set(element,new Word('vo', i+'.'+j));
    //         break;
    //       }
    //     }
    //   }
    // }

    // for (var element of unknown_words) {
    //   for (var i = 0; i < passageFragments.length; i++) {
    //     for (var j = 0; j < passageFragments[i].length; j++) {
    //       if (passageFragments[i][j].indexOf(element) !== -1) {
    //         this.words.set(element, new Word('un', i + '.' + j));
    //         break;
    //       }
    //     }
    //   }
    // }

    // history存入本地

    if (typeof (headline) === "string" && headline.trim()){
      this.headline = headline;
    }else {
      this.headline = (passageFragments[0][0].length > 140) ? passage.substr(0, 140) : passageFragments[0][0];
    }
    this.date = new Date();
    this.uuid = this.history.uuid();
    this.history.save();
  }

  save = () => {
    wx.setStorageSync(this.uuid,this);
    app.hisotryList.append(this);
  }
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }
}

const getHistoryListFromStorage = () => {
  var history_list;
  try {
    history_list = wx.getStorageSync('history_list');
    if (typeof (history_list) === "string") {
      throw "'history_list' is not existed. A new history_list will be created.";
    }
  } catch (e) {
    console.warn(e);
    history_list = new HistoryList();
    setHistoryListInStorage(history_list);
  } finally {
    return history_list;
  }
}

const setHistoryListInStorage = (history_list) => {
  wx.setStorage({
    key: 'history_list',
    data: history_list,
  })
}

// 如果本地存储找不到以headline为key的记录，会返回空字符串
const getHistoryFromStorage = headline => {
  var history = null;
  try {
    var history = wx.getStorageSync(headline);
    if (typeof (history) === "string") {
      throw "History '{$headline}' is not existed.";
    }
  } catch (e) {
    console.warn(e);
  } finally {
    return history;
  }
}

const setHistoryInStorage = (headline, history) => {
  wx.setStorage({
    key: headline,
    data: history,
  })
}

// const getHistoryListDoneFromStorage = () => {
//   var history_done_list = [];
//   try {
//     history_done_list = wx.getStorageSync('history_done_list');
//     if (typeof (history_done_list) === "string") {
//       throw "'history_done_list' is not existed. A new history_done_list will be created.";
//     }
//   } catch (e) {
//     console.warn(e);
//     history_done_list = [];
//     setHistoryListDoneInStorage(history_done_list);
//   } finally {
//     return history_done_list;
//   }
// }

// const setHistoryListDoneInStorage = (history_done_list) => {
//   wx.setStorage({
//     key: 'history_done_list',
//     data: history_done_list,
//   })
// }

module.exports = {
  getHistoryFromStorage: getHistoryFromStorage,
  setHistoryInStorage: setHistoryInStorage,
  getHistoryListFromStorage: getHistoryListFromStorage,
  setHistoryListInStorage: setHistoryListInStorage,
  // getHistoryListDoneFromStorage: getHistoryListDoneFromStorage,
  // setHistoryListDoneInStorage: setHistoryListDoneInStorage,
}
