class Trie {
  constructor(root = new TrieNode(null)) {
    if (typeof(root) === 'string') {
      root = new TrieNode(null);
    }
    this.root = root;
    this.allData = [];
    this.number = 0;
  }

  // 输入校验：如果不是指定正则表达式匹配的字符，插入、删除、搜索都将被拒绝
  inputVerification(stringData) {
    return /[a-zA-Z\-\']/.test(stringData.trim())
  }

  // 插入字符串：功能入口
  insertData(stringData) {
    if (this.inputVerification(stringData)) {
      this.insertHelper(stringData.trim(), this.root); // 多了一次trim()的开销
      var flag = true;
    }
    return Boolean(flag) // 是否可以这样表示？如果if没有执行，flag是undefined吗？
  }

  // 插入字符串辅助方法：递归调用
  insertHelper(stringData, node) {
    if (stringData === '') {
      node.isWord = true; // 标记插入单词成功（如果遇到整个插入的输入即为空，如何处理？是否有这样的情况？）
      this.number += 1; // 计数
      return; // 输入字符串为空时，不需要插入或者插入完毕，结束插入
    } else if (!node.children[stringData[0]]) { // 如果children中没有与输入字符串第一个字符相同的key，那么建一个新的
      node.children[stringData[0]] = new TrieNode();
    }
    this.insertHelper(stringData.substring(1), node.children[stringData[0]]); // 递归调用，插入下一个字符
  }

  // 查询字符串：同时查询输入字符串以及输入字符串转小写后版本，以忽略首字母大小写的影响（有无必要实现更复杂的完全忽略大小写搜索？）
  // 如果能查询到，返回查到的结果（原来的输入形式还是转小写之后的）
  search(queryData) {
    if (this.inputVerification(queryData)) {
      if (this.searchHelper(queryData, this.root)) {
        return queryData;
      } else if (this.searchHelper(queryData.toLowerCase(), this.root)) {
        return queryData.toLowerCase();
      }
    } else {
      return false;
    }
  }

  // 查询字符串辅助方法：
  searchHelper(queryData, node) {
    // console.log("In searchHelper, queryData=" + queryData)
    // console.log("node=" + JSON.stringify(node))
    if (queryData.length === 0 && node.isWord) { // 查询字符串为空字符串（由于不断截取），且标志是否为单词的变量为true时，搜索成功
      // console.log("searchHelper is returning true")
      // console.log("node=" + JSON.stringify(node))
      return true;
    } else if (queryData.length > 0 && node.children[queryData[0]]) {
      // 字符串还没有搜索完毕，则在node的子节点中继续查询，若有则递归查询，否则返回false
      return this.searchHelper(queryData.substring(1), node.children[queryData[0]]);
    }
    return false;
  }


  // 前缀搜索入口方法
  findPrefix(prefix) {
    if (this.inputVerification(prefix)) {
      return this.findPrefixHelper(prefix, this.root).map(value => prefix + value);
    } else {
      return [];
    }
  }
  // 递归找到前缀字符串最末字符对应节点
  findPrefixHelper(prefix, node) {
    // if (prefix.length === 0 && node.isWord) { // 此时搜索的是前缀，不要求输入为单词，只要搜索到最末字符就可以了
    if (prefix.length === 0) {
      var allData = [];
      this.findPrefixHelper2(node, allData); // 从node开始向下搜索并记录每个节点的结果
      return allData;
    } else if (prefix.length > 0 && node.children[prefix[0]]) {
      return this.findPrefixHelper(prefix.substring(1), node.children[prefix[0]]);
    }
    return [];
  }
  // 递归搜索指定节点node向下的所有单词（并将结果push入allData中）
  findPrefixHelper2(node, allData, data = []) {
    if (node.isWord) { // 只要是单词就输出，不需要是叶子节点
      allData.push(data.join(''));
    }
    for (let i in node.children) {
      data.push(i);
      this.findPrefixHelper2(node.children[i], allData, data);
      data.pop();
    }
  }

  // 搜索以指定字符串为前缀的所有数据，打包为数组返回
  // findPrefix(prefixStr) {
  //   if (this.inputVerification(prefixStr)) return [];
  //   let prefix = prefixStr; // 记录下原值，方便与dfs结果组合成单词
  //   let curNode = this.root;
  //   // let firstChar = prefixStr[0];
  //   // 查找前缀字符串是否存在于字典树中
  //   while (true) {
  //     if (!curNode) return [];
  //     curNode = curNode.children[prefixStr[0]];
  //     prefixStr = prefixStr.substring(1);
  //     if (prefixStr === "") break;
  //     // firstChar = prefixStr[0];
  //   }
  //   // 如果存在，则从前缀字符串的最后一个字符对应的节点开始，进行深度优先遍历以获取所有符合条件的字符串
  //   // return curNode ? this.dfs(curNode, prefix) : [];
  //   // return this.dfs(curNode, prefix);
  //   var allData = [];
  //   this.findPrefixHelper(curNode, allData);
  //   return allData.map(value => prefix + value);
  // }

  // 用于前缀搜索的深度优先搜索方法
  // dfs(node, curStr = "", ans = []) {
  //   let flag = false;
  //   for (const next in node.children) {
  //     let child = node.children[next];
  //     if (child) {
  //       flag = true;
  //       this.dfs(child, curStr + next, ans);
  //     }
  //   }
  //   if (!flag) {
  //     ans.push(curStr);
  //   }
  //   return ans;
  // }

  // 删除字符串
  deleteData(stringData) {
    if (this.search(stringData)) { // 判断是否存在该单词（字符串）
      return this.deleteDataHelper(stringData, this.root);
    }
    return false;
  }

  // 删除字符串辅助方法
  deleteDataHelper(stringData, node) {
    let child = node.children[stringData[0]];
    if (stringData.length === 1) { // 删除最末字符对应节点逻辑
      // 查询字符串为长度为1（由于不断截取），且当前节点的子节点有该字符
      // 找到输入字符串最末一个字符对应的节点（不一定是叶子节点），开始执行删除逻辑
      if (Object.keys(child.children).length > 0) {
        // 先判断子节点有没有子节点，有则证明还有单词依托于此节点
        // 在这种情况下，无需真的删除，删除isWord标记就可以
        // 此时，也不需要再继续向上删除，计数并结束递归
        // console.log("In deleteDataHelper(), when stringData.length === 1 and Object.keys(child.children).length > 0:")
        // console.log("child=" + JSON.stringify(child))
        delete child["isWord"]
        // console.log("after delete node['isWord'], child=" + JSON.stringify(child))
        this.number -= 1; // 计数
        return true; // 结束递归，告知上层无需继续删除
      } else { // 是叶子节点，则一直往上删除，直到找到一个isWord标记为true的节点或者根节点
        delete node.children[stringData[0]] // 删除操作
        return false; // 返回false，告知上层要继续删除
      }
      // return true; // 应该执行不到
    } else if (stringData.length > 0) { // 删除其他字符对应节点逻辑
      // 字符串还没有搜索完毕，则在node的子节点中继续查询
      // 若有则递归查询，否则返回false
      // 在此执行删除上一层的逻辑
      var deleteRes = this.deleteDataHelper(stringData.substring(1), child);
      if (deleteRes) {
        // 返回值为true代表不需要再向上删除了，直接向上返回true
        return true;
      } else {
        // 否则执行本层的删除逻辑
        if (Object.keys(node.children).length > 1 || child.isWord) {
          // 先判断本层有无（除了stringData[0]之外的）其他子节点，如果有则不能删除该节点，也不用继续向上删除
          // 或者子节点本身是单词，此时也无需删除，直接返回
          return true;
        } else {
          // 如果都不是，把子节点删除，并继续向上删除
          delete node.children[stringData[0]]
          return false;
        }
      }
    }
    // return false; // 应该执行不到
  }

  // 打印字符串
  printData() {
    // for (let i in this.root.children) {
    //   this.printHelper(this.root.children[i], [i]);
    // }
    this.printHelper(this.root);
  }

  // 递归输出字符串
  printHelper(node, data = []) {
    if (node.isWord) {
      console.log('>', data.join(''))
    }
    // else if (Object.keys(node.children) === 0) {
    //   console.log('>', data.join(''));
    //   return;
    // }
    for (let i in node.children) {
      data.push(i);
      this.printHelper(node.children[i], data);
      data.pop(); // 注意，找打一个单词后，返回下一个初始节点继续遍历
    }
  }

  /**
   *  将字典树转为字符串数组形式
   * refresh为true时，将强制刷新；否则显示上一次转换结果
   */
  getAllData(refresh = false) {
    if (refresh || !this.allData || this.allData.length === 0) {
      this.allData = []; // 先清空，再重新生成
      // for (let i in this.root.children) {
      //   this.getAllDataHelper(this.root.children[i], [i]);
      // }
      this.getAllDataHelper(this.root);
      this.number = this.allData.length;
    }
    return this.allData;
  }

  getAllDataHelper(node, data = []) {
    if (node.isWord) {
      this.allData.push(data.join(''));
    }
    // if (Object.keys(node.children).length === 0) {
    //   this.allData.push(data.join(''));
    //   return;
    // }
    for (let i in node.children) {
      data.push(i);
      this.getAllDataHelper(node.children[i], data);
      data.pop();
    }
  }
}

class TrieNode {
  constructor(key) {
    // this.key = key; // key可能都没必要有了
    // this.isWord = false; // 可能没必要每个对象都拥有此属性，而是插入时动态添加
    this.children = {};
  }
}

function getTrieFromStringArray(words) {
  var trie = new Trie();
  try {
    words.map(_id => {
      trie.insertData(_id);
    })
  } catch (e) {
    console.warn(e);
    console.warn('An empty trie will be returned.')
  }
  return trie;
}

// 通过插入"trie"和删除“trie"来判断是否为Trie类型对象
function isTrie(trie) {
  try {
    trie.insertData("trie");
    trie.deleteData("trie");
  } catch (e) {
    console.warn(e);
    return false;
  }
  return true;
}

// 提供key，从本地缓存获取Trie
const getTrieFromStorage = (key) => {
  var trie = null;
  try {
    // 缓存数据丢失了类型信息，取root初始化新的trie
    trie = new Trie(wx.getStorageSync(key).root);
    // 如果data类型不是Trie，新建一个Trie并缓存
    if (!isTrie(trie)) {
      console.warn(
        `Data corresponded to the given key is not an instance of Trie.
          Now it has been replaced by a new instance of Trie.`);
      trie = new Trie();
      wx.setStorage({
        key: key,
        data: trie,
      })
    }
  } catch (e) {
    console.warn(e);
  }
  return trie;
}

// 提供key和data，缓存至本地记录
// key  string类型
// data Trie类型或者[string]类型
const setTrieInStorage = (key, data) => {
  // 增加了判断输入data是否为字典树，封装了自动用字符串数组建字典树的方法
  if (!isTrie(data)) {
    console.warn(
      `Data corresponded to the given key is not an instance of Trie.
      It will be treated as an array and converted to Trie type before saved.`);
    var trie = new Trie();
    try {
      for (let ele in data) {
        trie.insertData(ele);
      }
      data = trie;
    } catch (e) {
      console.error(
        `{e}
        When data is treated as an array, at least one element of it is not String.
        An empty trie will be created and set in storage.`
      );
    }
  }
  wx.setStorage({
    key: key,
    data: data,
  })
}

// 字典树性能测试
/**
 * var familiarTrie = getTrieFromStorage('familiar_list');

console.time("生成测试用例时间：")
var testData = [];
for (let i = 0; i < 50; i++) {
  testData.push(familiarTrie.getAllData()[parseInt(Math.random()*familiarTrie.getAllData().length)]);
}
console.timeEnd("生成测试用例时间：")

var familiarTrieAllData = familiarTrie.getAllData();
console.time("数组测试时间：")
var arrayRes = [];
for (let element of testData) {
  arrayRes.push(familiarTrieAllData.indexOf(element));
}
console.timeEnd("数组测试时间：")


console.time("字典树测试时间：")
var trieRes = [];
for (let element of testData) {
  trieRes.push(familiarTrie.search(element));
}
console.timeEnd("字典树测试时间：")
 */

/**
 * 定义一个继承Trie类的单词树类
 * 规定应实现批量添加、删除、保存方法（传入参数为Array<String>类型）
 * 根据指定的key从缓存中取数据，以及保存自身至缓存
 */
class WordTrie extends Trie {
  constructor(key) {
    let wordTrieInStorage = wx.getStorageSync(key);
    super(wordTrieInStorage.root);
    this.key = key;
    this.number = wordTrieInStorage.number;
    this.allData = wordTrieInStorage.allData;
  }
  add(words) {
    try {
      words.forEach(value => {
        this.insertData(value)
      })
    } catch (e) {
      console.warn(`An error occured when WordTrie.add() was called.\n${e}`)
    }
  }
  del(words) {
    try {
      words.forEach(value => {
        this.deleteData(value)
      })
    } catch (e) {
      console.warn(`An error occured when WordTrie.del() was called.\n${e}`)
    }
  }
  save() {
    // 不需要存储allData，每次打开生词本或熟词本都会强制刷新重新生成
    // 不需要存储key，每次key都是由get方法指定得到的
    wx.setStorage({
      key: this.key,
      data: {
        root: this.root,
        allData: [],
        number: this.getAllData().length, // 校正
      },
    })
  }
}

/**
 * 每次调用都必然会执行一次WordTrie的构造方法
 * 将首先试图从本地缓存中寻找对应key的数据
 * 如果没有则创建新的
 */
const getFamiliarTrie = () => {
  return new WordTrie('familiar_list')
}

const getVocabularyTrie = () => {
  return new WordTrie('vocabulary_list')
}

module.exports = {
  Trie: Trie,
  getTrieFromStorage: getTrieFromStorage,
  setTrieInStorage: setTrieInStorage,
  getTrieFromStringArray: getTrieFromStringArray,
  getFamiliarTrie: getFamiliarTrie,
  getVocabularyTrie: getVocabularyTrie,
}