const util = require('./util.js')


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    passage: {
      type: String,
      value: "",
    },
    thisword: {
      type: Object,
      value: null
    },
    /**
     * 一个例子
    thisword: {
      type: Object,
      value: {
        word: "word",
        style: {
          "background": "greenyellow",
        }
      } 
    },
     */
    highlight: {
      type: Array,
      value: null,
    },
    /**
     * 一个例子
    highlight: {
      type: Object,
      value: [{
        words: [],
        style: {
          "background": "greenyellow",
        }
      }]
    },
     */
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {

    },
  },

  observers: {
    'passage': function(passage) {
      this.setData({
        passageFragments: passage.split(/\n+/).map(x => util.splitBomb(x))
      })
    }
  },
})