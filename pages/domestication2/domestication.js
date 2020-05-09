// pages/domestication2/domestication.js
const app = getApp()
const utilWord = require('../../utils/word2.js');
const util = require('../../utils/util.js');
const fileSystemManager = wx.getFileSystemManager();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    filename: {
      type: String,
      value: "",
    }
  },

  /**
   * 配置选项
   */
  options: {
    pureDataPattern: /^_/,
  },

  /**
   * 组件的初始数据
   */
  data: {
    items:[],
    // 勾选与否（用于页面加载与卸载时的存取方法）
    familiar_lexicon: {},
    // 进度条控制
    _numOfTasks: 0,
    // 非视图数据
    _namearray: [],
    _lexiconChecked: undefined, // 默认值为undefined，以避免初始化时被observer监控到
    _lexiconLastChecked: [], // 默认值为[]，应对没有读到缓存记录的情况
  },

  /**
   * 生命周期方法
   */
  lifemethods: {
    attached: function() {
      console.log("attached()")
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      let items;
      wx.cloud.downloadFile({
        fileID: 'cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/lexicon/lexicon.json', // 文件 ID
        success: res => {
          fileSystemManager.readFile({
            filePath: res.tempFilePath,
            encoding: 'utf8',
            success: res1 => {
              let temp = JSON.parse(res1.data);
              items = temp;
              let itemsName = [];
              for (let element of items) {
                itemsName.push(element.name);
              }
              let lexiconCheckedInStorage = wx.getStorageSync('familiar_lexicon');
              let lexiconLastChecked = [];
              if (typeof (lexiconCheckedInStorage) !== "string") {
                let localLexiconChecked = [];
                for (let element in lexiconCheckedInStorage) {
                  localLexiconChecked.push(element);
                }
                let cloudMinusLocal = util.arrSub(itemsName, localLexiconChecked);
                let localMinusCloud = util.arrSub(localLexiconChecked, itemsName);
                for (let element in cloudMinusLocal) {
                  lexiconCheckedInStorage[element] = false;
                }
                for (let element in localMinusCloud) {
                  delete lexiconCheckedInStorage[element];
                }
                // 取缓存中值为true的项，记录为初始时的lastChecked，方便对比
                for (let element in lexiconCheckedInStorage) {
                  if (lexiconCheckedInStorage[element]) {
                    lexiconLastChecked.push(element);
                  }
                }
              } 
              this.setData({
                items: items,
                familiar_lexicon: lexiconCheckedInStorage,
                _lexiconLastChecked: lexiconLastChecked,
                _namearray: itemsName,
              });
            },
            fail: err => {
              console.log('readFile fail', err)
            }
          });
        },
        fail: console.error
      });
      
    },

    onUnload: function() {
      let lexiconCheckedInStorage = {};
      for (let element of this.data._lexiconLastChecked) {
        lexiconCheckedInStorage[element] = true;
      }
      for (let element of util.arrSub(this.data._namearray, this.data._lexiconLastChecked)) {
        lexiconCheckedInStorage[element] = false;
      }
      wx.setStorage({
        key: "familiar_lexicon",
        data: lexiconCheckedInStorage,
      })
      app.familiarTrie.save();
    },

    /**
     * checkbox-group状态改变时方法
     */
    checkboxChange: function(e) {
      this.setData({
        _lexiconChecked: e.detail.value,
      })
      console.log(this.data._lexiconChecked);
    },

    /**
     * 文件处理方法：根据文件名获取文件路径，并交由helper完成具体的读取载入操作
     * 通过filename指定文件名
     * choice为true时执行添加，choice为false时执行删除
     */
    dealFile: function(filename, choice) {
      var that = this;
      fileSystemManager.access({
        path: `${wx.env.USER_DATA_PATH}/${filename}.csv`, // 文件 ID
        success: res => {
          that.dealFileHelper(`${wx.env.USER_DATA_PATH}/${filename}.csv`, choice);
        },
        fail: err => {
          console.log(
            `The file ${filename}.csv does not exist locally. Try to download from cloud storage.
            ${err}`)
          wx.cloud.downloadFile({
            fileID: `cloud://xingxi-p57mz.7869-xingxi-p57mz-1301128380/lexicon/${filename}.csv`, // 文件 ID
            success: downloadRes => {
              that.dealFileHelper(downloadRes.tempFilePath, choice);
              console.log(`File ${filename}.csv successfully downloaded.
              tempFilePath: ${downloadRes.tempFilePath}`);
              fileSystemManager.copyFile({
                srcPath: downloadRes.tempFilePath,
                destPath: `${wx.env.USER_DATA_PATH}/${filename}.csv`, // 文件 ID
                success: copyRes => {
                  console.log(
                    `File ${filename}.csv successfully copied.
                    ${copyRes}`)
                  // that.dealFileHelper(this.destPath, choice);
                },
                fail: console.error
              })
            },
            fail: console.error
          })
        },
      })
    },

    /**
     * 文件读取与载入方法
     */
    dealFileHelper: function(filePath, choice) {
      var familiarWordList = [];
      fileSystemManager.readFile({
        filePath: filePath,
        encoding: 'utf8',
        success: res => {
          console.log(`File successfully loaded.`);
          familiarWordList = res.data.split("\n").slice(1);
          if (choice) {
            app.familiarTrie.add(familiarWordList);
          } else {
            app.familiarTrie.del(familiarWordList);
          }
          this.setData({
            _numOfTasks: this.data._numOfTasks - 1,
          })
        },
        fail: err => {
          console.log('readFile fail', err)
        }
      });
    },
  },

  /**
   * 数据监听器
   */
  observers: {
    'filename': function (filename) {
      console.log(`In domestication page, filename is ${filename}`);
    },
    '_lexiconChecked': function(lexiconChecked) {
      console.log('_lexiconChecked observer is called')
      // 不会有“=”的情况（“=”时不会触发监听事件）
      if (lexiconChecked.length > this.data._lexiconLastChecked.length) {
        let changeAppend = util.arrSub(lexiconChecked, this.data._lexiconLastChecked)[0]; // 增加的单词库
        this.dealFile(changeAppend, true);
      } else {
        let changeDelete = util.arrSub(this.data._lexiconLastChecked, lexiconChecked)[0]; // 删除的单词库
        this.dealFile(changeDelete, false);
      }
      this.setData({
        _lexiconLastChecked: this.data._lexiconChecked,
        _numOfTasks: this.data._numOfTasks + 1,
      })
    },
    '_numOfTasks': function(numOfTasks) {
      if (numOfTasks > 0) {
        wx.showLoading({
          title: '加载中',
        });
      } else {
        wx.hideLoading();
      }
    },
  }
})