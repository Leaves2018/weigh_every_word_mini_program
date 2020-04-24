// 在指定文本text中用指定标记markup包裹指定内容content
const markText = (text, content, markup="**", g=true) => {
  var res = [];
  var re = new RegExp(content, 'i' + (g ? 'g' : ''));
  var lastIndex = 0;

  while (true) {
    let lastIndex = re.lastIndex;
    let temp = re.exec(text);
    if (!temp) {
      res.push(text.substring(lastIndex));
      break;
    }
    res.push(text.substring(lastIndex, temp.index));
    res.push(`${markup}${text.substring(temp.index, re.lastIndex)}${markup}`);
  }
  return res.join('');
}

// 在指定文章text中用指定标记markup包裹指定内容contents的每一个元素
const markArticle = (article, contents, markup="**") => {
  contents.map(content => markText(article, content, markup, true));
}

module.exports = {
  markText: markText,
}

