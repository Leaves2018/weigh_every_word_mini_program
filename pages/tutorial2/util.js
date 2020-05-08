// const marker = (str, tag) => {
//   if (tag) {
//     tag = tag
//   } else if (/[a-zA-Z\-]/.test(str)) {
//     tag = "word"
//   } else if (/\n/.test(str)) {
//     tag = "break"
//   } else if (/\s/.test(str)) {
//     tag = "space"
//   } else {
//     tag = "punc"  // 中文字符也会被视为“标点符号”
//   }
//   return { text: str, tag: tag }
// }

// // 标记文本text中所有单词
// const splitBomb = (text) => {
//   text = text.replace(/↵+/g, '\n'); // 将↵替换成\n
//   var res = [];
//   var re = /[a-zA-Z\-\']+/ig;
//   while (true) {
//     let lastIndex = re.lastIndex;
//     let temp = re.exec(text);
//     if (!temp) {
//       res.push(marker(text.substring(lastIndex)));
//       break;
//     }
//     res.push(marker(text.substring(lastIndex, temp.index)));
//     res.push(marker(text.substring(temp.index, re.lastIndex), 'word'));
//   }
//   return res.filter(x => x.tag !== 'space');  // 筛去空格符
// }

// const marker = (str, tag) => {
//   if (tag) {
//     tag = tag
//   } else if (/[a-zA-Z\-]/.test(str)) {
//     tag = "word"
//   } else if (/\s/.test(str)) {
//     tag = "space"
//   } else {
//     tag = "punc" // 中文字符也会被视为“标点符号”
//   }
//   return {
//     text: str,
//     tag: tag
//   }
// }

const splitBomb = (text) => {
  var res = [];
  var re = /[a-zA-Z\-\']+/ig;
  while (true) {
    let lastIndex = re.lastIndex;
    let temp = re.exec(text);
    if (!temp) {
      res.push({
        text: text.substring(lastIndex).trim(),
        tag: 'other'
      });
      break;
    }
    res.push({
      text: text.substring(lastIndex, temp.index).trim(),
      tag: 'other'
    });
    res.push({
      text: text.substring(temp.index, re.lastIndex),
      tag: 'word'
    });
  }
  return res.filter(x => x.text && x.text.trim()); // 筛去空格符
}

module.exports = {
  splitBomb: splitBomb
}