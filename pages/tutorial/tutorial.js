// pages/tutorial/tutorial.js
const app = getApp();
var initData = 'this is first line\nthis is second line'
var extraLine = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: initData,
    isLoading: true,
    article: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let result = app.towxml(`## 特色

- 支持echarts图表（3.0+）✨
- 支持LaTex数学公式（3.0+）✨
- 支持yuml流程图（3.0+）✨
- 支持按需构建（3.0+）✨
- 支持代码语法高亮
- 支持emoji表情:wink:
- 支持上标、下标、下划线、删除线、表格、视频、图片（几乎所有html元素）……
- 支持typographer字符替换
- 支持多主题切换
- 支持Markdown TodoList
- 支持事件绑定（这样允许自行扩展功能哟，例如：点击页面中的某个元素，更新当前页面内容等...）
- 极致的中文排版优化
- 支持前后解析数据

---


## 什么是 Markdown

**Markdown** 是一种方便记忆、书写的纯文本标记语言，用户可以使用这些标记符号以最小的输入代价生成极富表现力的文档：譬如您正在阅读的这份文档。它使用简单的符号标记不同的标题，分割不同的段落，**粗体** 或者 *斜体* 某些文字。

**更多详见** [http://www.markdown.cn/](http://www.markdown.cn/)


## Markdown TodoList

- [ ] 一起去旅行
- [ ] 跟同学聚会
- [x] 晚上十点足球比赛
- [x] 测试用例撰写`, 'markdown', {
      theme: 'light',
      events: {
        tap: (e) => {
          console.log('tap', e);
        }
      }
    });
    this.setData({
      article: result,
      isLoading: false,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  // onShow: function () {

  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onShow: function () {

    // animation.scale(2, 2).rotate(45).step()

    // this.setData({
    //   animationData: animation.export()
    // })

    // setTimeout(function () {
    //   animation.translate(30).step()
    //   this.setData({
    //     animationData: animation.export()
    //   })
    // }.bind(this), 1000)
  },
  rotateAndScale: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    // 旋转同时放大
    // this.animation.rotate(45).scale(2, 2).step()
    this.animation.height(0).step();
    this.setData({
      animationData: this.animation.export()
    })
  },
  rotateThenScale: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    // 先旋转后放大
    // this.animation.rotate(45).step()
    // this.animation.scale(2, 2).step()
    this.animation.height(100).step();
    this.setData({
      animationData: this.animation.export()
    })
  },
  rotateThenScaleBack: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    // 先旋转后放大-回退
    // this.animation.scale(1, 1).step()
    // this.animation.rotate(0).step()
    this.animation.top(0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  rotateAndScaleThenTranslate: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation
    // 先旋转同时放大，然后平移
    // this.animation.rotate(45).scale(2, 2).step()
    // this.animation.translate(100, 100).step({ duration: 1000 })
    this.animation.top(500).step();
    this.setData({
      animationData: this.animation,
    })
  },

  translateLeft: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })

    this.animation = animation
    // 先旋转后放大
    this.animation.translateX(-500).step();
    this.animation.translateY(-500).step();
    this.animation.translateX(0).step();
    this.setData({
      animationData: this.animation.export()
    })
  },
  translateBack: function () {
    // var animation = wx.createAnimation({
    //   duration: 1000,
    //   timingFunction: 'ease',
    // })

    // this.animation = animation
    // 先旋转后放大-回退
    // this.animation.scale(1, 1).step()
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  tapRotateX: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })

    this.animation = animation
    this.animation.rotateX(180).opacity(0).step();
    this.animation.opacity(1).rotateX(0).step();
    // this.animation.rotateX(0).step();
    this.setData({
      animationData: this.animation.export(),
    })
  },
  add: function (e) {
    extraLine.push('other line')
    var temp = initData + '\n' + extraLine.join('\n');
    console.log(temp);
    this.setData({
      text: temp,
    })
  },
  remove: function (e) {
    if (extraLine.length > 0) {
      extraLine.pop()
      this.setData({
        text: initData + '\n' + extraLine.join('\n')
      })
    }
  },
})