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

// 使用moment库转换时间
var moment = require('../../libs/moment-cn.min.js'); // 精简压缩moment库, 压缩80%体积
moment.locale('zh-cn');

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
        userNewsTypeMap: [],
        userNewsType: [],
        swiperImgUrlList: [],
        //category: 'gn', // str 当前类别
        //selectedNewsType: '',
        selectedCategory: 'gn', // str 当前类别
        categoryList: [
            { 'en': 'gn', 'cn': '国内' }
        ], // dict 类别字典
    },

    // 首次加载
    onLoad() {
        this.setCategory()
        this.getNews()
    },

    // 设定顶部导航栏
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
              console.info(res); //print
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
      let newsDate = new Date(d.date);
      d.date = `${newsDate.getFullYear()}-${newsDate.getMonth() + 1}-${newsDate.getDate()}`
    })
    for (let i = 0; i < newsContent.length; i += 1) {
      newsList.push({
        id: newsContent[i].id, 
        title: newsContent[i].title.slice(0,30), //处理过长的标题
        //time: moment(newsContent[i].date).fromNow(),
        time: newsContent[i].date,
        source: newsContent[i].source || '', //值不存在的情况
        firstImage: newsContent[i].firstImage || "/images/news-img.png", //值不存在的情况
            })
        }
        this.setData({
          swiperImgUrlList: newsContent.length >= 3 ? newsContent.slice(0, 3) : newsContent,
          newsList: newsList
        })
    },

    // 变更当前栏目
    onTapCategory(event) {
      this.setData({
        selectedCategory: event.currentTarget.dataset.category
      });
        this.getNews()
    },

    // 跳转到详情页面
    onTapNews(event) {
        let newsID = event.currentTarget.dataset.newsid
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + newsID
        })
    },


    // 下拉刷新
    onPullDownRefresh() {
        console.log("refresh executed!")

        this.getNews(() => {
            wx.stopPullDownRefresh()
        })
    },

})
