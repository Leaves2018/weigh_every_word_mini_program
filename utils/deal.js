const utils_word = require('./word2.js');
const utils_his = require('./history.js');
const utils_util = require('./util.js');

const deal_passage = (passage) => {
  if (passage === "") {
    return;
  }
  var sentences = [];
  var words = [];
  var stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];
  var vocabulary = [];
  var vocabulary_words = [];
  var unknown_words = [];

  function word(name, sentence) {
    this.name = name;
    this.sentence = sentence;
  }
  function history(headline, body, vocabulary, unknown, firstWords, date) {
    this.headline = headline;
    this.body = body;
    this.vocabulary = vocabulary;
    this.unknown = unknown;
    this.firstWords = firstWords;
    this.date = date;
  }
  let re0 = /[A-Z][a-z]*/g;
  var res0;
  var firstWords = [];
  while ((res0 = re0.exec(passage)) !== null) {
    firstWords.push(res0[0]);
  }
  firstWords = [...new Set(firstWords)];//单词去重
  var re1 = /[\.|\?|\!\？\！\。]/;
  sentences = utils_util.splitWithPunc(passage, re1);
  sentences = sentences.filter(function (x) { return x && x.trim(); }); //例句去空
  let mmm = passage.replace(/[^a-zA-Z]/g, ' ');
  words = mmm.split(" "); //获取单词
  words = [...new Set(words)];//单词去重
  words = words.filter(function (x) { return x && x.trim(); });//单词去空
  words = words.filter(function (x) { return x.length > 1; });
  for (var element of words) {
    if (stop_words.indexOf(element) === -1) {//过滤停止词
      vocabulary.push(element);
    }
  }

  var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
  var voc_trie = utils_word.getVocabulary(); // 从本地获取生词库
  var voc_temp = [];
  var voc_really = [];
  for (var v_word of vocabulary) {
    if ((fam_trie.search(v_word)) === false) {
      voc_temp.push(v_word)
    }
  }
  for (var t_word of voc_temp) {
    if ((voc_trie.search(t_word)) === false) {
      if (firstWords.indexOf(t_word)!==-1){
        let t_word_temp = t_word.toLowerCase();
        if (stop_words.indexOf(t_word_temp) === -1) {//过滤停止词
          if ((fam_trie.search(v_word)) === false) {
            if ((voc_trie.search(t_word)) === false) {
              unknown_words.push(t_word);
            }else{
              voc_really.push(t_word);
            }
          }
        }
      }else {
        unknown_words.push(t_word);
      }
    } else {
      voc_really.push(t_word);
    }
  }
  var voc_result = [];
  for (var element of voc_really) {
    for (var i = 0; i < sentences.length; i++) {
      if (sentences[i].indexOf(element) != -1) {
        var word_example = new word(element, i);
        voc_result.push(word_example); // 初步形成文章的生词列表
        break;
      }
    }
  }

  var unknown_result = [];
  for (var element of unknown_words) {
    for (var i = 0; i < sentences.length; i++) {
      if (sentences[i].indexOf(element) != -1) {
        var word_example = new word(element, i);
        unknown_result.push(word_example); // 初步形成文章的“未知词”列表
        break;
      }
    }
  }

  // history存入本地
  var mydate = new Date();
  let headline_res = '';
  if (sentences[0].length > 140){
    headline_res = passage.substr(0,140);
  }else {
    headline_res = sentences[0];
  }
  var history_example = new history(headline_res, sentences, voc_result, unknown_result, firstWords, mydate);
  utils_his.setHistoryInStorage(headline_res, history_example);
  var history_list = utils_his.getHistoryListFromStorage();
  history_list.push(headline_res);
  history_list = [...new Set(history_list)];
  utils_his.setHistoryListInStorage(history_list);
  var history_done_list = utils_his.getHistoryListDoneFromStorage();
  history_done_list.push('info');
  utils_his.setHistoryListDoneInStorage(history_done_list);
  return headline_res;
}

const deal_passageWithHeadline = (already_headline,passage) => {
  if (passage === "") {
    return;
  }
  var sentences = [];
  var words = [];
  var stop_words = ["I’m", "I’ve", 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];
  var vocabulary = [];
  var vocabulary_words = [];
  var unknown_words = [];

  function word(name, sentence) {
    this.name = name;
    this.sentence = sentence;
  }
  function history(headline, body, vocabulary, unknown, firstWords, date) {
    this.headline = headline;
    this.body = body;
    this.vocabulary = vocabulary;
    this.unknown = unknown;
    this.firstWords = firstWords;
    this.date = date;
  }
  let re0 = /[A-Z][a-z]*/g;
  var res0;
  var firstWords = [];
  while ((res0 = re0.exec(passage)) !== null) {
    firstWords.push(res0[0]);
  }
  firstWords = [...new Set(firstWords)];//单词去重
  var re1 = /[\.|\?|\!\？\！\。]/;
  sentences = utils_util.splitWithPunc(passage, re1);
  sentences = sentences.filter(function (x) { return x && x.trim(); }); //例句去空
  let mmm = passage.replace(/[^a-zA-Z]/g, ' ');
  words = mmm.split(" "); //获取单词
  words = [...new Set(words)];//单词去重
  words = words.filter(function (x) { return x && x.trim(); });//单词去空
  words = words.filter(function (x) { return x.length > 1; });
  for (var element of words) {
    if (stop_words.indexOf(element) === -1) {//过滤停止词
      vocabulary.push(element);
    }
  }

  var fam_trie = utils_word.getFamiliar(); // 从本地获取熟词库
  var voc_trie = utils_word.getVocabulary(); // 从本地获取生词库
  var voc_temp = [];
  var voc_really = [];
  for (var v_word of vocabulary) {
    if ((fam_trie.search(v_word)) === false) {
      voc_temp.push(v_word)
    }
  }
  for (var t_word of voc_temp) {
    if ((voc_trie.search(t_word)) === false) {
      if (firstWords.indexOf(t_word) !== -1) {
        let t_word_temp = t_word.toLowerCase();
        if (stop_words.indexOf(t_word_temp) === -1) {//过滤停止词
          if ((fam_trie.search(v_word)) === false) {
            if ((voc_trie.search(t_word)) === false) {
              unknown_words.push(t_word);
            } else {
              voc_really.push(t_word);
            }
          }
        }
      } else {
        unknown_words.push(t_word);
      }
    } else {
      voc_really.push(t_word);
    }
  }
  var voc_result = [];
  for (var element of voc_really) {
    for (var i = 0; i < sentences.length; i++) {
      if (sentences[i].indexOf(element) != -1) {
        var word_example = new word(element, i);
        voc_result.push(word_example); // 初步形成文章的生词列表
        break;
      }
    }
  }

  var unknown_result = [];
  for (var element of unknown_words) {
    for (var i = 0; i < sentences.length; i++) {
      if (sentences[i].indexOf(element) != -1) {
        var word_example = new word(element, i);
        unknown_result.push(word_example); // 初步形成文章的“未知词”列表
        break;
      }
    }
  }

  // history存入本地
  var mydate = new Date();
  var history_example = new history(already_headline, sentences, voc_result, unknown_result, firstWords, mydate);
  utils_his.setHistoryInStorage(already_headline, history_example);
  var history_list = utils_his.getHistoryListFromStorage();
  history_list.push(already_headline);
  history_list = [...new Set(history_list)];
  utils_his.setHistoryListInStorage(history_list);
  return already_headline;
}

module.exports = {
  deal_passage: deal_passage,
  deal_passageWithHeadline: deal_passageWithHeadline,
}