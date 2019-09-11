//index.js
const app = getApp()
const categoryMap = {
    'gn': '国内',
    'gj': '国际',
    'cj': '财经',
    'yl': '娱乐',
    'js': '军事',
    'ty': '体育',
    'other': '其他',
}
//用于转换时间显示
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

Page({
    data: {
        newsList: [], // list 新闻列表
        // newsList:[{
        //     id: '1523074607642',
        //     title: '(Beta)清明假期长三角铁路客流堪比春运',
        //     source: '(Beta)环球资讯',
        //     date: '2018-04-06T11:28:25.000Z',
        //     firstImage: 'http://inews.gtimg.com/newsapp_bt/0/3199649303/641'
        // }]
        swiperImgUrlList: [],
        selectedCategory: 'gn', // str 当前类别，所选的类别
        categoryList: [
            { 'en': 'gn', 'cn': '国内' }
        ], // dict 类别字典
    },

    // 首次加载
    //onLoad() 生命周期函数--监听页面加载，小程序注册完成后，加载页面，触发onLoad方法。
    //调用时，设定新闻类别，再获取所选类别的新闻。
    onLoad() {
        this.setCategory()
        this.getNews()
    },

    // 设定顶部导航栏
    // 将categoryMap中的值放进页面data的categoryList中
    // categoryList中的数据在页面会被显示为导航栏内容，wxml中有显示的设置。
    setCategory() {
        let categoryList = []
        for (var key in categoryMap) {
            categoryList.push({
                en: key,
                cn: categoryMap[key]
            })
        }
        this.setData({
            categoryList: categoryList
        })
    },

    // 获取新闻列表
    // 从新闻源获取新闻，由于用的Udacity提供的新闻源，并已定义好type，将selectedCategory传入，获取到相应栏目的新闻列表。
    getNews(callback) {
        wx.request({
            url: 'https://test-miniprogram.com/api/news/list',
            data: {
              type: this.data.selectedCategory
            },
          header: {
            'content-type': 'application/json' // 默认值
            },
            success: res => {
              let newsContent = res.data.result;
              // 随机排序，模拟获取到的新闻列表发生变化，测试pulldownrefresh
              newsContent.sort(this.randomsort)
              // 提取获得的数据的前三项作为swiper的数据，不满3项取全部
              this.setNewsList(newsContent)
            },
            fail: res => {
                console.log(res)
            },
            complete: () => {
                callback && callback()
            }
        })
    },
/**
* 排序辅助函数，用于打乱新闻列表，模拟获取新新闻列表
*/
  randomsort: (a, b) => {
     //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
     return Math.random() > .5 ? -1 : 1;
     },
    // 更新新闻概要列表
  setNewsList(newsContent) {
    let newsList = []
    newsContent.forEach(d => {
      let newsDate = new Date(d.date); //生成符合格式要求的时间信息
      //d.date = `${newsDate.getFullYear()}-${newsDate.getMonth() + 1}-${newsDate.getDate()}`
      d.date = [newsDate.getHours(), newsDate.getMinutes()].map(formatNumber).join(':')
    })
    for (let i = 0; i < newsContent.length; i += 1) {
      newsList.push({
        id: newsContent[i].id, 
        title: newsContent[i].title.slice(0,30), //处理过长的标题
        //time: moment(newsContent[i].date).fromNow(),
        time: newsContent[i].date,
        source: newsContent[i].source || '', //值不存在的情况
        firstImage: newsContent[i].firstImage || "/images/006-apple.png", //值不存在的情况
            })
        }
        this.setData({
          swiperImgUrlList: newsContent.length >= 3 ? newsContent.slice(0, 3) : newsContent,
          newsList: newsList
        })
    },
    // 变更当前栏目
    // 点选的栏目赋值给selectedCategory
    onTapCategory(event) {
      this.setData({
        selectedCategory: event.currentTarget.dataset.category
      });
        this.getNews()
    },
    // 跳转到详情页面
    // 点选的新闻通过newsid在详情页面显示相应的新闻。
    // newsid在wxml中有定义。
    onTapNews(event) {
        let newsID = event.currentTarget.dataset.newsid
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + newsID
        })
    },
    // 下拉刷新
    // 在index.json中将enablePullDownRefresh设为true，开启index页面的下拉刷新
    // 用onPullDownRefresh()函数监听下拉动作，刷到新闻后，wx.stopPullDownRefresh()停止下拉刷新效果
    onPullDownRefresh() {
        //console.log("refresh executed!")
        this.getNews(() => {
            wx.stopPullDownRefresh()
        })
    },
})

