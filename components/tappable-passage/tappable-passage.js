const localUtil = require('./util.js')
const util = require('../../utils/util.js')

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
      var passageFragmentsMapForClassName = {}; // 为了忽略大小写设置class名称，并且由于视图层不能使用toLowerCase()，在这里计算一个映射
      let passageFragments = util.splitPassage(passage).map(para => para.map(sent => {
        let bombRes = localUtil.splitBomb(sent);
        bombRes.forEach((value, index, array) => {
          passageFragmentsMapForClassName[value.text] = value.text.toLowerCase();
        })
        return bombRes;
      }));
      this.setData({
        passageFragments: passageFragments,
        passageFragmentsMapForClassName: passageFragmentsMapForClassName,
      })
    }
  },
})