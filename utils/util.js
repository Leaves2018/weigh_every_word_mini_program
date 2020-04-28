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
var splitWithPunc = (text, re) => {
  re = new RegExp(re, 'g'); // 全局匹配
  var res = [];
  while (true) {
    let lastIndex = re.lastIndex;
    let temp = re.exec(text);
    if (!temp) {
      res.push(text.substring(lastIndex).trim());
      break;
    }
    res.push(text.substring(lastIndex, temp.index + 1).trim());
  }
  return res.filter(s => {
    return s && s.trim();
  });
}

module.exports = {
  formatTime: formatTime,
  arrSub: arrSub,
}