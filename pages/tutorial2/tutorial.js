var passage = `Postponed: Climate COP26 and biodiversity negotiations

The UN body that oversees international climate negotiations, the UNFCCC, has postponed until 2021 the 26th Conference of the Parties (COP26) on climate change, initially scheduled for November in Glasgow, Scotland. The summit is seen as central to advancing the climate agenda after COP25 talks in Madrid failed. The decision was taken jointly by the UNFCCC and the UK, who will now work to set a new date. Rescheduling will allow further time for the “necessary preparations” and ensure all countries “can focus on the issues to be discussed at the conference”, the UK said in a press release. “Covid-19 is the most urgent threat facing humanity today, but we cannot forget that climate change is the biggest threat facing humanity over the long term,” UNFCCC head Patricia Espinosa said. “We continue to support and to urge nations to significantly boost climate ambition in line with the Paris Agreement. ”`;

const util = require('./util.js')


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
    onLoad: function () {
      this.setData({
        passageFragments: passage.split(/\n+/).map(x => util.splitBomb(x))
      })
    },

    tap: function (e) {
      console.log('tap ' + e.currentTarget.dataset.id)
      const query = wx.createSelectorQuery()
      query.selectAll('.' + e.currentTarget.dataset.id)
    },
  }
})
