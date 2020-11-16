const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 数组相减的方法 - 使用es新特性
 * @param {Array} a
 * @param {Array} b
 */
const arrSub = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.filter(i => !b.includes(i))
  }
  throw new Error('arrSub(): Wrong Param Type')
}

// 自定义分割方法：保留分隔符号
// text 待分割文本
// re   分割符     
const splitWithPunc = (text, re = /[\.\!\?]/) => {
  re = new RegExp(re, 'g'); // 全局匹配
  var res = [];
  while (true) {
    let lastIndex = re.lastIndex;
    let temp = re.exec(text);
    if (!temp) {
      res.push(text.substring(lastIndex).trim());
      break;
    }
    res.push(text.substring(lastIndex, temp.index + 1).trim()); // 仅考虑了单词后占1个字符的符号
  }
  return res.filter(s => {
    return s && s.trim();
  });
}

/**
 * 文章分割方法
 * level为1时分段->一维数组
 * level为2时分分再分句->二维数组
 */
const splitPassage = (article, level = 2, paragraphSeparator = /\n+/, sentenceSeparator = /[\.|\?|\!\。\？\！][\"\']?/) => {
  let paragraphs = article.split(paragraphSeparator).filter(s => s && s.trim());
  if (level === 1) return paragraphs;
  let sentences = paragraphs.map(paragraph => splitWithPunc(paragraph, sentenceSeparator))
  if (level === 2) return sentences;
}

const joinPassage = (passageFragments) => {
  return passageFragments.map(sentences => sentences.join(' ')).join('\n\n');
}

/**
 * 获取单词word在文本text中第一次出现位置所在句（用以获得语料库例句）
 * 下一步改进：获取所有位置例句，并试图拼接（如用...连接）
 * @param {String} text 
 * @param {String} word 
 */
const findTheSentenceWhereTheWordIs = (text, word) => {
  /**
   * 思路1：先找到单词出现位置，然后分别向前和向后查找句子结束符号，以划分一句
   * 问题：如何实现向前向后查找？indexOf和lastIndexOf？需要用正则表达式吧？
   */
  // 查找并获取单词word在文本text中的开始与结束位置（仅第一次出现位置）
  // let posStart = text.indexOf(word);
  // let posEnd = posStart + word.length;
  // let sentenceSeparator = /[\.|\?|\!\。\？\！][\"\']?/;

  /**
   * 思路2：拆分文章为段句结构，然后二重循环去找单词
   * 问题：资源消耗是更大还是基本一样？
   */
  
  // for (let paragraph of passage) {
  //   for (let sentence of paragraph) {
  //     let pos = sentence.indexOf(word);
  //     if (pos >= 0) {
  //       return { sentence, pos };
  //     }
  //   }
  // }
  let passage = splitPassage(text);
  for (let i = 0, l1 = passage.length; i < l1; i++) {
    let paragraph = passage[i];
    for (let j = 0, l2 = paragraph.length; j < l2; j++) {
      let sentence = paragraph[j];
      // 在当前句中查找单词
      let pos = sentence.indexOf(word);
      if (pos >= 0) {
        // 找到则进行长度测量：少于140个字符则试图拼接
        let resultString = sentence;
        while (resultString.length < 140 && j < l2 - 1) {
          j += 1;
          resultString += paragraph[j]
        }
        // 如果待查找单词位置处于将要截取掉的部分，则将截取范围后移至以pos为中心半径70范围内
        if (pos > 140) {
          resultString = "..." + resultString.slice(pos - 70, pos + 70);
        }
        return sentence;
      }
    }
  }
  return "Something wrong."
}

module.exports = {
  formatTime,
  arrSub,
  splitWithPunc,
  splitPassage,
  joinPassage,
  findTheSentenceWhereTheWordIs,
}

/**
// 遍历以：（1）检验该词tag是否在外部有变化（2）分类以实现不同标记
var vocabulary = [];
var familiar = [];
var unknown = [];
m.forEach(function(value, key, map) {
  // （1）检验该词tag是否在外部有变化
  if (familiarTrie.search(key)) {
    value.tag = 'familiar';
  } else if (vocabularyTrie.search(key)) {
    value.tag = 'vocabulary';
  }
  //（2）分类以实现不同标记（时间换空间还是空间换时间？）
  switch (value.tag) {
    case 'vocabulary':
      vocabulary.push(key);
      break;
    case 'familiar':
      familiar.push(key);
      break;
    case 'unknown':
      unknown.push(key);
      break;
  }
})
 */