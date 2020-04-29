const utilWord = require('./word2.js');
// 在指定文本text中用指定标记markup包裹指定内容content
const markText = (text, content, markup="**") => {
  var res = [];
  text = ` ${text} `; // 前后各加一个非字母字符，已解决开头结尾无法标记的问题
  var re = new RegExp(`[^a-zA-Z]${content}[^a-zA-Z]`, 'ig');
  var lastIndex = 0;

  while (true) {
    let lastIndex = re.lastIndex;
    let temp = re.exec(text);
    if (!temp) {
      res.push(text.substring(lastIndex));
      break;
    }
    res.push(text.substring(lastIndex, temp.index));  // 插入上一次匹配成功的结束位置到此次匹配的开始位置的子串

    let temptext = text.substring(temp.index, re.lastIndex);  // 取正则表达式匹配结果字符串
    // 如果超长，则证明多匹配了
    // if (temptext.length > content.length) {
      let idx1 = temptext.toLowerCase().indexOf(content.toLowerCase()); // 在匹配结果字符串里再精确查找content的（开始）位置
      let idx2 = idx1 + content.length; // 计算结束位置
      // 分前、中、后三部分，“中”部分即为需要标记内容，做MD标记后push
      res.push(temptext.substring(0, idx1));
      res.push(`${markup}${temptext.substring(idx1, idx2)}${markup}`);
      res.push(temptext.substring(idx2));
    // } else {
    //   res.push(`${markup}${temptext}${markup}`);
    // }
  }
  return res.join('');
}

// 在指定文章text中用指定标记markup包裹指定内容contents的每一个元素
const markArticle = (article, contents, markup="**") => {
  contents.map(content => {
    article = markText(article, content, markup, true);
  });
  return article;
}

// 在指定文本text中用指定标记markup包裹指定单词word及其变形
const markTextWithExchange = (text, word, markup="**") => {
  return markArticle(text, Object.values((new utilWord.Word(word)).getExchange()).concat([word._id]), markup);
}

module.exports = {
  markText: markText,
  markArticle: markArticle,
  markTextWithExchange: markTextWithExchange,
}
