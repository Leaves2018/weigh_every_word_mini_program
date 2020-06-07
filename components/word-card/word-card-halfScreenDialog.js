// components/word-card/word-card-halfScreenDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    maskClosable: {
      type: Boolean,
      value: true
    },
    mask: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: false,
      observer: '_showChange'
    },
    word: {
      type: String,
      value: "",
    },
    detail: {
      type: String,
      value: "",
    },
    autoplayAudio: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    buttons: [{
        type: 'default',
        className: '',
        text: '忘记',
        value: 0
      },
      {
        type: 'primary',
        className: '',
        text: '记得',
        value: 1
      }
    ],
  },

  lifetimes: {
    /**
     * 视图层渲染完成
     */
    ready: function () {
      let systemInfo = wx.getSystemInfoSync();
      this.setData({
        scrollViewHeight: Math.round(systemInfo.windowHeight * 0.4) + "px",
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    buttonTap: function(event) {
      // 捕获事件，整理数据后重新触发
      this.triggerEvent('buttontap', {
        type: event.currentTarget.dataset.type,
        index: event.detail.index,
        _id: event.currentTarget.dataset.info,
      })
    }
  },

  observers: {
    // 'detail': function(detail) {
    //   console.log("In word-card-halfScreenDialog.js, detail=" +  detail)
    // }
  }
})