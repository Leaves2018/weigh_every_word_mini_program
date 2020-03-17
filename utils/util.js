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

function Trie() {
  this.root = new TrieNode(null);
}

function TrieNode(key) {
  this.key = key;
  this.children = [];
}

Trie.prototype = {
  insert: function (stringData, node) {
    if (stringData == '') {
      return;
    }
    let children = node.children;
    let haveData = null;
    for (let i in children) {
      if (children[i].key == stringData[0]) {
        haveData = children[i];
        break;  // 是否可以加break？找到就可以退出，不继续找
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
  },
  insertData: function(stringData) {
    this.insert(stringData, this.root);
  },
  // 查询字符串
  search: function (queryData) {
    if (queryData == '' || this.root.children.length == 0) {
      return false;
    }
    for (let i in this.root.children) {
      if (this.searchNext(this.root.children[i], queryData)) {
        return true;
      }
    }
    return false;
  },
  // 递归查询判断
  searchNext: function (node, stringData) {
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
  },
  // 删除字符串
  delete: function (stringData) {
    if (this.search(stringData)) { // 判断是否存在该单词（字符串）
      for (let i in this.root.children) {
        if (this.delNext(this.root, i, stringData, stringData)) {
          return;
        }
      }
    }
    return this;
  },
  /**
   * 先递归查找到字符串的叶子节点，然后从字符串的叶子节点逐级向根节点递归删除叶子节点，直到删除字符串
   * @param parent 父节点
   * @param index 子节点在父节点children数组中的索引位置
   * @param stringData 递归遍历中的字符串
   * @param delStr 调用delete方法时的原始字符串
   */
  delNext: function (parent, index, stringData, delStr) {
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
        this.delete(delStr.substring(0, delStr.length - 1));
      } else if (children.length > 0 && stringData.length > 1) { // 既不是叶子节点，也不是最后一个字符，则继续递归查找
        for (let i in children) {
          if (children[i].key == stringData[1]) {
            return this.delNext(node, i, stringData.substring(1), delStr); // 记得return 递归函数，否则获取的返回值为undefined
          }
        }
      }
    }
  },
  // 打印字符串
  printData: function () {
    for (let i in this.root.children) {
      this.printHelper(this.root.children[i], [this.root.children[i].key]);
    }
  },
  // 递归输出字符串
  printHelper: function (node, data) {
    if (node.children.length == 0) {
      console.log('>', data.join(''));
      return;
    }
    for (let i in node.children) {
      data.push(node.children[i].key);
      this.printHelper(node.children[i], data);
      data.pop(); // 注意，找打一个单词后，返回下一个初始节点继续遍历
    }
  }
}

module.exports = {
  formatTime: formatTime,
  Trie: Trie
}