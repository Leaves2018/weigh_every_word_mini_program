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
const splitPassage = (article, level = 2, paragraphSeparator = /\n/, sentenceSeparator = /[\.|\?|\!\。\？\！][\"\']?/) => {
  let paragraphs = article.split(paragraphSeparator).filter(s => s && s.trim());
  if (level === 1) return paragraphs;
  let sentences = paragraphs.map(paragraph => splitWithPunc(paragraph, sentenceSeparator))
  if (level === 2) return sentences;
}

const joinPassage = (passageFragments) => {
  return passageFragments.map(sentences => sentences.join(' ')).join('\n\n');
}

module.exports = {
  formatTime: formatTime,
  arrSub: arrSub,
  splitWithPunc: splitWithPunc,
  splitPassage: splitPassage,
  joinPassage: joinPassage,
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