// pages/employee/sendFood/sendFood.js
var Bmob = require('../../../dist/Bmob-1.6.1.min.js');
let util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex:'',
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.myToast = this.selectComponent(".myToast")
    this.abModal = this.selectComponent(".abModal")
    this.setData({
      phoneList: JSON.parse(options.phoneList)
    })
    this.getReasons()
  },

  getReasons:function(){
    let that = this
    const query = Bmob.Query("abnormal");
    query.find().then(res => {
      console.log(res)
      let list = []
      res.map(ele=>{
        list.push(ele.abnormal_reason)
      })
      that.setData({
        list
      })
    });
  },

  newOrders:function(){
    wx.showModal({
      title: '提示',
      content: '确定都送完餐并且进行下一轮输入吗',
      success:function(e){
        if(e.confirm){
          wx.redirectTo({
            url: '../index/index'
          })
        }
      }
    })
  },

  //inputModal确认事件
  _confirmEvent() {
    let that = this
    let reason = ''
    if(that.abModal.data.abReason != ''){
      reason = that.abModal.data.abReason
    }else{
      reason = that.abModal.data.abList[that.abModal.data.selIndex]
    }
    let phoneList = this.data.phoneList
    let index = this.data.curIndex
    const query = Bmob.Query('order');
    query.set('id', phoneList[index].objectId)
    query.set('order_status', 3)
    query.set('abnormal_reason', reason)
    query.save().then(res => {
      that.myToast.show('操作成功')
      phoneList[index].orderStatus = 3
      that.setData({
        phoneList
      })
    }).catch(err => {
      that.myToast.show('操作失败')
    })
    this.abModal.hideModal()

  },

  handleTap:function(e){
    let that = this
    let dataset = e.currentTarget.dataset
    let phoneList = that.data.phoneList
    let index = dataset.index
    switch (e.currentTarget.id) {
      case 'error': {
        that.setData({
          curIndex:index
        })
        that.abModal.showModal()
        // wx.showActionSheet({
        //   itemList: this.data.list,
        //   success:function(re){
        //     let reason = that.data.list[re.tapIndex]
        //     const query = Bmob.Query('order');
        //     query.set('id', phoneList[index].objectId)
        //     query.set('order_status', 3)
        //     query.set('abnormal_reason', reason)
        //     query.save().then(res => {
        //       that.myToast.show('操作成功')
        //       phoneList[index].orderStatus = 3
        //       that.setData({
        //         phoneList
        //       })
        //     }).catch(err => {
        //       that.myToast.show('操作失败')
        //     })
        //   }
        // })
      } break
      case 'done':{
        wx.showModal({
          title: '提示',
          content: '确定要完成吗?',
          success: function (res) {
            if (res.confirm) {
              const query = Bmob.Query('order');
              query.set('id', phoneList[index].objectId)
              query.set('order_status', 2)
              query.save().then(res => {
                that.myToast.show('操作成功')
                phoneList[index].orderStatus = 2
                that.setData({
                  phoneList
                })
              }).catch(err => {
                that.myToast.show('操作失败')
              })
            }
          }
        })
      }break
      case 'call': {
        wx.makePhoneCall({
          phoneNumber: dataset.phone,
        })
      } break
    }
  }
})