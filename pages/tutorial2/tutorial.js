// pages/tutorial2/tutorial.js
const demoText = `In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.
‘Whenever you feel like criticizing any one,’ he told me, ‘just remember that all the people in this world haven’t had the advantages that you’ve had.’
He didn’t say any more but we’ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence I’m inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon—for the intimate revelations of young men or at least the terms in which they express them are usually plagiaristic and marred by obvious suppressions. Reserving judgments is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat a sense of the fundamental decencies is parcelled out unequally at birth.
`

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
    selector: '.myui-mask',
    zindex: 1000,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
      wx.setNavigationBarTitle({
        title: '使用教程',
      })
      // 要求在教程页面中，不要自动跳转
      wx.setStorage({
        data: true,
        key: 'donotredirect',
      })
    },
    onUnload: function() {
      // 取消不要自动跳转的限制
      wx.removeStorage({
        key: 'donotredirect',
      })
    },
    skipButtonTap: function(e) {
      wx.switchTab({
        url: '/pages/input2/input',
      })
    },
    backButtonTap: function(e) {
      if (this.data.index === 4 && this.data.subindex !== 0) {
        this.setData({
          subindex: this.data.subindex - 1,
        })
      } else {
        this.setData({
          index: this.data.index - 1,
        })
      }
    },
    nextButtonTap: function(e) {
      switch (this.data.index) {
        case 0:
          this.setData({
            index: this.data.index + 1,
            selector: '.myui-mask',
            zindex: -1,
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
            selector: '.myui-mask', // 恢复遮罩层
            zindex: 1000,
          });
          break;
        case 4:
          switch (this.data.subindex) {
            case 0:
              this.setData({
                subindex: this.data.subindex + 1,
              });
              break;
            case 1:
              this.setData({
                subindex: this.data.subindex + 1,
                selector: '.myui-mask',
                zindex: -1,
              });
              break;
            case 2:
              this.setData({
                index: this.data.index + 1,
              });
              break;
          }
          break;
        case 5:
          wx.redirectTo({
            url: '/pages/domestication2/domestication',
          })
      }
    }
  }
})