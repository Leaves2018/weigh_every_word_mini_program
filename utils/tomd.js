// 在指定文本text中用指定标记markup包裹指定内容content
const markText = (text, content, markup="**", g=true) => {
  var res = [];
  var re = new RegExp(`[^a-zA-Z]+${content}[^a-zA-Z]+`, 'i' + (g ? 'g' : ''));
  var re2 = new RegExp(content, 'i' + (g ? 'g' : ''));
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
    let idx1 = temptext.toLowerCase().indexOf(content.toLowerCase()); // 在匹配结果字符串里再精确查找content的（开始）位置
    let idx2 = idx1 + content.length; // 计算结束位置
    // 分前、中、后三部分，“中”部分即为需要标记内容，做MD标记后push
    res.push(temptext.substring(0, idx1));
    res.push(`${markup}${temptext.substring(idx1, idx2)}${markup}`);
    res.push(temptext.substring(idx2));

    // res.push(`${markup}${text.substring(temp.index, re.lastIndex)}${markup}`);
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

module.exports = {
  markText: markText,
  markArticle: markArticle,
}

