class Trie {
  constructor(root = new TrieNode(null)) {
    if (typeof(root) === 'string') {
      root = new TrieNode(null);
    }
    this.root = root;
    this.allData = [];
    this.number = 0;
  }

  insert(stringData, node) {
    if (stringData == '') {
      return;
    }
    let children = node.children;
    let haveData = null;
    for (let i in children) {
      if (children[i].key == stringData[0]) {
        haveData = children[i];
        break; // 是否可以加break？找到就可以退出，不继续找
      }
    }
    if (haveData) {
      this.insert(stringData.substring(1), haveData);
    } else {
      if (children.length == 0) {
        let node = new TrieNode(stringData[0]);
        children.push(node);
        this.insert(stringData.substring(1), node);
      } else {
        let validPosition = 0;
        for (let j in children) {
          if (children[j].key < stringData[0]) {
            validPosition++;
          }
        }
        let node = new TrieNode(stringData[0]);
        children.splice(validPosition, 0, node);
        this.insert(stringData.substring(1), node);
      }
    }
  }

  insertData(stringData) {
    this.number += 1;
    this.insert(stringData, this.root);
  }

  // 查询字符串
  search(queryData) {
    return this.searchHelper(queryData) || this.searchHelper(queryData.toLowerCase());
  }

  searchHelper(queryData) {
    if (queryData == '' || this.root.children.length == 0) {
      return false;
    }
    for (let i in this.root.children) {
      if (this.searchNext(this.root.children[i], queryData)) {
        return true;
      }
    }
    return false;
  }

  // 递归查询判断
  searchNext(node, stringData) {
    // 若字符与节点key不相等，则不匹配
    if (stringData[0] != node.key) {
      return false;
    } else { // 若与key相等，继续判断
      let children = node.children;
      if (children.length == 0 && stringData.length == 1) { // 叶子节点，最后一个字符，则完全匹配
        return true;
      } else if (children.length > 0 && stringData.length > 1) { // 既不是叶子节点，也不是最后一个字符，则继续递归查找
        for (let i in children) {
          if (children[i].key == stringData[1]) {
            return this.searchNext(children[i], stringData.substring(1)); // 记得return 递归函数，否则获取的返回值为undefined
          }
        }
      } else { // C1：叶子节点，C2：最后一个字符；若只满足其中一个条件，则不匹配
        return false;
      }
    }
  }

  findPrefix(prefixStr) {
    if (prefixStr === "") return [];
    let prefix = prefixStr;
    let curNode = this.root;
    let firstChar = prefixStr[0];
    while (true) {
      if (!curNode) return [];
      // filter的效率应该已经足够高，但是否会比二分查找等方法要好？🤔️
      curNode = curNode.children.filter(value => value.key === firstChar)[0];
      prefixStr = prefixStr.substring(1);
      if (prefixStr === "") break;
      firstChar = prefixStr[0];
    }
    return curNode ? this.dfs(curNode, prefix) : [];
  }

  dfs(node, curStr = "", ans = []) {
    let flag = false;
    for (const next of node.children) {
      if (next) {
        flag = true;
        this.dfs(next, curStr + next.key, ans);
      }
    }
    if (!flag) {
      ans.push(curStr);
    }
    return ans;
  }

  // 用以统计单词数目，然后调用真正的删除方法
  deleteData(stringData) {
    this.number -= 1;
    this.deleteDataHelper(stringData);
  }

  // 删除字符串
  deleteDataHelper(stringData) {
    if (this.search(stringData)) { // 判断是否存在该单词（字符串）
      for (let i in this.root.children) {
        if (this.delNext(this.root, i, stringData, stringData)) {
          return;
        }
      }
    }
    return this;
  }

  /**
   * 先递归查找到字符串的叶子节点，然后从字符串的叶子节点逐级向根节点递归删除叶子节点，直到删除字符串
   * @param parent 父节点
   * @param index 子节点在父节点children数组中的索引位置
   * @param stringData 递归遍历中的字符串
   * @param delStr 调用deleteData方法时的原始字符串
   */
  delNext(parent, index, stringData, delStr) {
    //当前节点对象
    let node = parent.children[index];
    // 若字符与节点key不相等，则不匹配
    if (stringData[0] != node.key) {
      return false;
    } else { // 若与key相等，继续判断
      let children = node.children;
      if (children.length == 0 && stringData.length == 1) { // 叶子节点，最后一个字符，则完全匹配
        // 删除叶子节点，利用父节点删除子节点原理
        parent.children.splice(index, 1);
        // 字符串从尾部移除一个字符后，继续遍历删除方法
        this.deleteDataHelper(delStr.substring(0, delStr.length - 1));
      } else if (children.length > 0 && stringData.length > 1) { // 既不是叶子节点，也不是最后一个字符，则继续递归查找
        for (let i in children) {
          if (children[i].key == stringData[1]) {
            return this.delNext(node, i, stringData.substring(1), delStr); // 记得return 递归函数，否则获取的返回值为undefined
          }
        }
      }
    }
  }
  // 打印字符串
  printData() {
    for (let i in this.root.children) {
      this.printHelper(this.root.children[i], [this.root.children[i].key]);
    }
  }

  // 递归输出字符串
  printHelper(node, data) {
    if (node.children.length === 0) {
      console.log('>', data.join(''));
      return;
    }
    for (let i in node.children) {
      data.push(node.children[i].key);
      this.printHelper(node.children[i], data);
      data.pop(); // 注意，找打一个单词后，返回下一个初始节点继续遍历
    }
  }

  /**
   *  将字典树转为字符串数组形式
   * refresh为true时，将强制刷新；否则显示上一次转换结果
   */
  getAllData(refresh = false) {
    if (refresh || this.allData.length === 0) {
      this.allData = []; // 先清空，再重新生成
      for (let i in this.root.children) {
        this.getAllDataHelper(this.root.children[i], [this.root.children[i].key]);
      }
      this.number = this.allData.length;
    }
    return this.allData;
  }

  getAllDataHelper(node, data) {
    if (node.children.length === 0) {
      this.allData.push(data.join(''));
      return;
    }
    for (let i in node.children) {
      data.push(node.children[i].key);
      this.getAllDataHelper(node.children[i], data);
      data.pop();
    }
  }
}

class TrieNode {
  constructor(key) {
    this.key = key;
    this.children = [];
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
 * 规定应实现添加、删除、保存方法
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
        number: this.allData.length, // 校正
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