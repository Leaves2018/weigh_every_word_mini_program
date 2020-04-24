const markText = (text, content, markup, g=true) => {
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

module.exports = {
  markText: markText,
}

