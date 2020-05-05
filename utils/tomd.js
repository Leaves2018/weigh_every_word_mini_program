const utilWord = require('./word2.js');
// 在指定文本text中用指定标记markup包裹指定内容content
const markText = (text, content, markup="**") => {
  var res = [];
  text = ` ${text} `; // 前后各加一个非字母字符，已解决开头结尾无法标记的问题
  var re = new RegExp(`[^a-zA-Z]${content}[^a-zA-Z]`, 'ig');
  // var lastIndex = 0;

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
  return res.join('').trim();
}

const markText2 = (text, content, markup="**") => {

}

// 在指定文章passage中用指定标记markup包裹指定内容contents的每一个元素
const markPassage = (passage, contents, markup="**") => {
  contents.map(content => {
    passage = markText(passage, content, markup, true);
  });
  return passage;
}

// 在指定文本text中用指定标记markup包裹指定单词word及其变形
const markTextWithExchange = (text, word, markup="**") => {
  return markArticle(text, Object.values((new utilWord.Word(word)).getExchange()).concat([word._id]), markup);
}

// 标记文本text中所有单词
const markTextAll = (text, markup="*") => {
  var res = [];
  var re = /[a-zA-Z\-]+/ig;
  while (true) {
    let lastIndex = re.lastIndex;
    let temp = re.exec(text);
    if (!temp) {
      res.push(text.substring(lastIndex));
      break;
    }
    res.push(text.substring(lastIndex, temp.index));  // 插入上一次匹配成功的结束位置到此次匹配的开始位置的子串
    res.push(`${markup}${text.substring(temp.index, re.lastIndex)}${markup}`);
  }
  return res.join('').trim();
}

module.exports = {
  markText: markText,
  markPassage: markPassage,
  markTextWithExchange: markTextWithExchange,
  markTextAll: markTextAll,
}

var article = `Postponed: Climate COP26 and biodiversity negotiations

Fermín Koop
02. 04. 2020
中文版本  Icon print 0comments
The coronavirus pandemic has led to the postponement of key international meetings on climate, biodiversity and ocean

Article image
COP26 climate talks have been postponed (Image: Andrew Parsons / No10 Downing Street)

Editor’s note: This article was updated on 9 April to reflect changes in the schedule due to Covid-19. This year’s packed agenda of negotiations on climate change, biodiversity and the global ocean was supposed to address the fortunes of a living world in critical condition. But the coronavirus pandemic is forcing drastic changes to the schedule. Covid-19, which has infected at least 900,000 people, has hit China and Europe hard. Several key meetings for achieving new environmental commitments have already been cancelled or postponed there. More are in doubt. The consequences seriously concern activists and experts, who warn of the urgent need for action to protect the planet. “The coronavirus generates the same level of uncertainty as the changes brought about by the crisis in climate and biodiversity. We are entering unknown territory,” said Tom Burke, co-founder of the environmental group E3G. Coronavirus and climate negotiations

The UN body that oversees international climate negotiations, the UNFCCC, has postponed until 2021 the 26th Conference of the Parties (COP26) on climate change, initially scheduled for November in Glasgow, Scotland. The summit is seen as central to advancing the climate agenda after COP25 talks in Madrid failed. The decision was taken jointly by the UNFCCC and the UK, who will now work to set a new date. Rescheduling will allow further time for the “necessary preparations” and ensure all countries “can focus on the issues to be discussed at the conference”, the UK said in a press release. “Covid-19 is the most urgent threat facing humanity today, but we cannot forget that climate change is the biggest threat facing humanity over the long term,” UNFCCC head Patricia Espinosa said. “We continue to support and to urge nations to significantly boost climate ambition in line with the Paris Agreement. ”

“Under the current circumstances, the decision is unavoidable,” said Manuel Pulgar Vidal, head of WWF’s global climate and energy practice. But climate action must remain a non-negotiable global priority. That means we must also focus on creating low-carbon job opportunities and increasing our societies’ economic and ecological resilience. ”

COP26 was supposed to see signatories to the 2015 Paris Agreement on climate change raise their ambition by presenting new commitments, known as NDCs – a critical step in curbing global emissions. At the same time, it had to resolve key points for the implementation of the Paris Agreement, not solved at COP25. The UNFCCC had already cancelled or postponed all meetings in March and April, both at its headquarters in Bonn, Germany, and worldwide. Africa Climate Week, due to take place from 9 March in Uganda, has also been called off, as well as London Climate Week, which was scheduled from 27 June to 5 July. “To have a successful COP26, you have to … guide the negotiation to a good result. If all the countries are concentrating on other problems such as coronavirus, that’s unlikely to be achieved,” said Enrique Maurtua Konstantinidis, senior climate advisor at Argentina’s Environment and Natural Resources Foundation (FARN). Isabel Cavelier, director of Colombian NGO Visión en Transforma said the relationship between coronavirus and climate will change over the short and longer term. “It’s positive because it leads to the reduction of emissions due to less economic activity. . . negative because it will lead countries to prioritise indiscriminate economic growth over climate action,” she said. Biodiversity and oceans

This year was also supposed to deliver new global targets for protecting biodiversity. The city of Kunming in southwestern China was scheduled to host COP15 in October but it has been postponed because of the Covid-19 pandemic. The 15th conference of the parties to the Convention on Biological Diversity (CBD) is the most important biodiversity meeting in a decade. Any new agreement on protecting nature is due to be adopted at COP15. A preparatory meeting in February was also moved to Rome before Italy went into coronavirus lockdown. “Some delegations were not allowed to leave or had to leave earlier. The CBD has 196 states parties and only around 150 were present,” said Ana di Pangracio, FARN’s deputy executive director, who participated in the meeting. “Some were absent for political reasons and others because of coronavirus. ” 

On 17 March, UNEP announced (pdf) that several CBD meetings on the road to Kunming would be postponed or moved online. The International Union for Conservation of Nature (IUCN), which compiles the annual "red list" of endangered species, has postponed its congress, which was due to take place in Marseille in June. The world's biggest conservation event, held every four years, has been rescheduled for January 2021. Covid-19 has also led to the postponement of five meetings of the International Maritime Organization (IMO) due to take place between March and April. The IMO environmental protection committee must decide on proposals to improve ships’ energy efficiency. Shipping is responsible for 3% of anthropogenic greenhouse gas emissions. A UN conference on protecting marine biodiversity in areas beyond national jurisdiction, scheduled for March 23 in New York was also shelved and the WTO (World Trade Organization) has suspended all meetings until March 20. If the move is extended, it could affect the June annual meeting in Kazakhstan, which has the elimination of fishing subsidies high on its agenda. The UN Ocean Conference in Lisbon, Portugal, which will hopefully generate momentum for ambitious marine biodiversity targets in the CBD framework, is likely to be rescheduled from June. This, the second iteration of the conference, is aimed at getting countries to make voluntary commitments on marine protection, including tougher fishing regulations and improved conservation of coastal and marine areas. “Coronavirus is very powerful and could lead to postponing most of the meetings from here to the end of the year,” said Burke, who said informal talks at gatherings are central to their success. “Replacing them with virtual meetings would not be enough since most of the negotiations take place in the corridors, outside of official meetings. ”`;

