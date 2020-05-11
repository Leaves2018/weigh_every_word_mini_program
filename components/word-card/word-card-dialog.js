Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    // title: {
    //   type: String,
    //   value: ''
    // },
    // extClass: {
    //   type: String,
    //   value: ''
    // },
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
    // buttons: {
    //   type: Array,
    //   value: []
    // },
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
  data: {
    innerShow: false
  },

  methods: {
    buttonTap: function buttonTap(e) {
      var index = e.currentTarget.dataset.index;

      this.triggerEvent('buttontap', { index: index, item: this.data.buttons[index] }, {});
    },
    close: function close() {
      console.log('word-card-dialog, close() is called')
      var data = this.data;
      if (!data.maskClosable) return;
      this.setData({
        show: false
      });
      this.triggerEvent('close', {}, {});
    },
    stopEvent: function stopEvent() { }
  }
});