// pages/info_collection/info_collection.js
// pages/settings/settings.js
const app = getApp();
const db = wx.cloud.database();
const userCollection = db.collection('user');
Component({
  data: {
    showTopTips: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    rules: [{
      name: 'studentid',
      rules: [{rangelength: [9, 10], message: '学号应为9位或者10位'}]
    }, {
      name: 'email',
      rules: [{ email: true, message: '邮箱地址格式不正确' }],
    }],
  },
  methods: {

    onLoad() {
      // 从缓存加载用户消息设置数据（分为user_settings和用户openid两个键主导的数据）]
      let that = this;
      try {
        let userData = wx.getStorageSync(app.globalData.openid);
        if (userData) {
          that.setData({
            formData: userData
          })
        } else {  // 读取不到userData，则证明没有登陆：跳转到登录页面
          // wx.showToast({
          //   title: '请先登录',
          // })
          // wx.navigateBack({
          //   delta: 0,
          // })
        }
      } catch (e) {
        console.error(e);
      }
    },

    // 保存无需校验数据
    onUnload() {
      // this.checkAndSave();
    },

    // 负责所有表单输入框的数据双向绑定
    formInputChange(e) {
      const { field } = e.currentTarget.dataset
      this.setData({
        [`formData.${field}`]: e.detail.value
      })
    },

    // 负责“共享我的语料库”和“查看他人语料库”两个开关的数据双向绑定
    switchChange(e) {
      const { field } = e.currentTarget.dataset
      if (e.detail.value) {
        if (this.data.formData.email) {
          this.setData({
            [`${field}`]: true
          })
        } else {
          this.setData({
            [`${field}`]: false
          })
        }
      }
    },

    // 校验表单
    submitForm() {
      let that = this;
      let formData = that.data.formData;
      if (!formData) {
        wx.navigateBack({
          delta: 1,
        })
        return;
      } else {
        this.selectComponent('#form').validate((valid, errors) => {
          console.log('valid', valid, errors)
          if (!valid) {
            const firstError = Object.keys(errors)
            if (firstError.length) {
              that.setData({
                error: errors[firstError[0]].message,
              })
            }
          } else {  // 表单数据均校验成功
            if (formData.studentid || formData.email) {
              that.checkAndSave()
              wx.showModal({
                title: '校验成功',
                content: '修改已保存',
                showCancel: false,
              })
            }
            wx.navigateBack({
              delta: 1,
            })
          }
        })
      }
    },

    // 确定哪些数据可以保存：由submitForm()调用
    checkAndSave() {
      let that = this;
      let userData = that.data.formData;
      // 缓存至本地
      wx.setStorage({
        data: userData,
        key: app.globalData.openid,
      })
      userCollection.add({
        data: {
          studentid: userData.studentid,
          email: userData.email
        },
        success(res) {
          console.warn(res);
          wx.showToast({
            title: '个人信息更新成功',
          })
        },
        fail(err) {
          console.error(err);
          wx.showToast({
            title: '个人信息更新失败',
          })
        }
      })
      // wx.cloud.callFunction({
      //   name: 
      // })
    },
  },
  observers: {

  }
});