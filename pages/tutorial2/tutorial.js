Page({
  data: {
    show: false,
    buttons: [
      {
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
    ]
  },
  open: function () {
    this.setData({
      show: true
    })
  },
  buttontap(e) {
    console.log(e)
  }
});