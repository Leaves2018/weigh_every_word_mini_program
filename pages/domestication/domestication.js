//search.js
const app = getApp()

Page({
  data: {
    items: [
      { name: 'Primary', value: '小学词汇', checked: 'true' },
      { name: 'Junior', value: '初中词汇', checked: 'true' },
      { name: 'High', value: '高中词汇' },
      { name: 'Cet', value: '四六级词汇' },
    ]
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  }
})
