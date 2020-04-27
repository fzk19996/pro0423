

const data_market = {
    "msg": "success",
    "code": 200,
    "data": {
        "totalCount": 1808,
        "totalPage": 181,
        "ext": null,
        "pageSize": 10,
        "currentPage": 1,
        "hasNext": true,
        "list":
        [
            {
                'name': '推广位名称1',
                'descrpition': '推广位说明1',
                'period': '展示周期1',
                'status': '状态1'
            },
            {
                'name': '推广位名称2',
                'descrpition': '推广位说明2',
                'period': '展示周期2',
                'status': '状态2'
            },
            {
                'name': '推广位名称3',
                'descrpition': '推广位说明3',
                'period': '展示周期3',
                'status': '状态3'
            },
            {
                'name': '推广位名称4',
                'descrpition': '推广位说明4',
                'period': '展示周期4',
                'status': '状态4'
            }
        ]
    }
}
const Mock = require('mockjs')
// 获取 mock.Random 对象
const Random = Mock.Random
// mock一组数据
const produceNewsData = function() {
    let articles = []
    for (let i = 0; i < 100; i++) {
        let newArticleObject = {
            title: Random.csentence(5, 30), //  Random.csentence( min, max )
            thumbnail_pic_s: Random.dataImage('300x250', 'mock的图片'), // Random.dataImage( size, text ) 生成一段随机的 Base64 图片编码
            author_name: Random.cname(), // Random.cname() 随机生成一个常见的中文姓名
            date: Random.date() + ' ' + Random.time() // Random.date()指示生成的日期字符串的格式,默认为yyyy-MM-dd；Random.time() 返回一个随机的时间字符串
        }
        articles.push(newArticleObject)
    }
    return {
        data: articles
    }
}
// 拦截ajax请求，配置mock的数据
Mock.mock('/api/articles', 'get', produceNewsData)