// pages/history2/history.js
const utilHis = require('../../utils/history.js');
const utilTrie = require('../../utils/trie.js');
const base64 = require("../../images/base64");

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    _headlines: [],
    historyList: {},
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
      let historyList = app.historyList.items;
      // 为搜索获取headlines
      let headlines = [];
      for (let element in historyList) {
        headlines.push(historyList[element].headline);
      };
      this.setData({
        _headlines: headlines,
        historyList: historyList,
        historyKeys: Object.keys(historyList),
      })
    },
    /**
     * 进行背诵和删除历史记录
     */
    tapSlideButton(e) {
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
                app.historyList.deleteHistory(historyuuid);
                this.setData({
                  historyList: app.historyList.items,
                })
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
      return new Promise((resolve, reject) => {
        if (value.length > 0) {
          setTimeout(() => {
            var hl_temp = this.data._headlines.filter(x => x.indexOf(value) !== -1);
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
      var indexHighlight = this.data._headlines.indexOf(e.detail.item.text);
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