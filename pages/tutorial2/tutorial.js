// pages/tutorial2/tutorial.js
const demoText = `In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.
‘Whenever you feel like criticizing any one,’ he told me, ‘just remember that all the people in this world haven’t had the advantages that you’ve had.’
He didn’t say any more but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence I’m in- clined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the con- fidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quiver- ing on the horizon—for the intimate revelations of young men or at least the terms in which they express them are usually plagiaristic and marred by obvious suppressions. Reserving judgments is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat a sense of the fundamental decencies is parcelled out unequally at birth.`

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    maskClosable: {
      type: Boolean,
      value: false
    },
    mask: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    index: 0,
    subindex: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    skipButtonTap: function(e) {
      wx.switchTab({
        url: '/pages/input2/input',
      })
    },
    backButtonTap: function(e) {
      this.setData({
        index: this.data.index - 1,
      })
    },
    nextButtonTap: function(e) {
      switch (this.data.index) {
        case 0:
          this.setData({
            index: this.data.index + 1,
            selector: '.weui-mask'
          });
          break;
        case 1:
          wx.setStorageSync('tutorial_demo_text', demoText);
          this.setData({
            index: this.data.index + 1,
            draftDemoTextStorageKey: 'tutorial_demo_text'
          });
          break;
        case 2:
          this.setData({
            index: this.data.index + 1,
          });
          break;
        case 3:
          this.setData({
            index: this.data.index + 1,
          });
          break;
        case 4:
          switch (this.data.subindex) {
            case 0:
            case 1:
            case 2:
            case 3:
              this.setData({
                index: this.data.index + 0.1,
              });
              break;
          }
          break;
      }
    }
  }
})