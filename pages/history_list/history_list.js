const utilHis = require('../../utils/history.js');
// const utilTrie = require('../../utils/trie2.js');
const base64 = require("../../images/base64");

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
      this.setData({
        search: this.search.bind(this),
        icon: base64.icon20,
        slideButtons: [{
          src: '/images/tabbar_icon_recite_active.png', // icon的路径
        }, {
          src: '/images/icon_del.svg', // icon的路径
        }],
      });
    },
    onShow: function() {
      this.historyList = utilHis.getHistoryListFromStorage();
      // 为搜索获取headlines
      this.headlines = [];
      for (let element in this.historyList.items) {
        this.headlines.push(this.historyList.items[element].headline);
      };
      this.setData({
        uuids: Object.keys(this.historyList.items),
        items: this.historyList.items,
      })
    },

    /**
     * 更新视图元素
     */
    updateWXML: function () {
      this.setData({
        uuids: Object.keys(this.historyList.items),
        items: this.historyList.items,
      })
    },
    /**
     * 进行背诵和删除历史记录
     */
    tapSlideButton(e) {
      var that = this;
      let historyuuid = e.currentTarget.dataset.historyuuid;
      console.log("In slideButtonTap(), historyuuid=" + historyuuid);
      switch (e.detail.index) {
        case 0:
          wx.navigateTo({
            url: `/pages/recite2/recite?historyuuid=${historyuuid}`,
          });
          break;
        case 1:
          wx.showModal({
            title: '提示',
            content: '你确定要删除此历史记录吗？（已确认的生词不会被删除）',
            success: function(res) {
              if (res.confirm) {
                that.historyList.deleteHistory(historyuuid);
                that.updateWXML();
              }
            }
          })
          break;
      }
    },
    /**
     * 查看文章详情
     */
    tapNavigateButton: function(e) {
      let historyuuid = e.currentTarget.dataset.historyuuid;
      console.log("In slideButtonTap(), historyuuid=" + historyuuid);
      wx.navigateTo({
        url: `/pages/history_detail2/history_detail?historyuuid=${historyuuid}`,
      })
    },
    /**
     * 搜索
     */
    search: function(value) {
      var that = this;
      return new Promise((resolve, reject) => {
        if (value.length > 0) {
          setTimeout(() => {
            var hl_temp = that.headlines.filter(x => x.indexOf(value) !== -1);
            resolve(hl_temp.map(ans => {
              return {
                text: ans
              };
            }));
          }, 200);
        }
      })
    },
    /**
     * 搜索框聚焦
     */
    searchFocus: function(e) {
      wx.pageScrollTo({
        scrollTop: 0,
      })
    },
    /**
     * 搜索框失去焦点
     */
    searchBlur: function(e) {
      console.log("In searchBlur()," + e);
      this.setData({
        searchState: false,
      });
    },
    /**
     * 选择搜索结果
     */
    selectResult: function(e) {
      console.log('select result: ', e.detail.item.text);
      var indexHighlight = this.headlines.indexOf(e.detail.item.text);
      this.setData({
        indexHighlight: indexHighlight,
      })
      const query = wx.createSelectorQuery();
      query.selectAll('.history-slidecell').boundingClientRect();
      query.exec(res => {
        wx.pageScrollTo({
          scrollTop: res[0][indexHighlight].top - 100,
          duration: 300,
        });
      })
    },
  }
})