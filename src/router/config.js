/**
 * 此由配置文件和Layout相关，不能随意更改
 * tab: false 表示该页面不在一级横向菜单显示
 * subMenu: false 表示该页面不在二级竖向菜单显示
 * meta: { todo: true } 表示该页面正在开发中
 */
const view = require('../views/Layout/AliveView');

const routers = [
    {
        path: '/',
        redirect: '/index',
        component: require('../views/Layout/Frame'),
        children: [
            {
                path: 'index',
                name: '首页',
                component: view,
                children: [
                    {
                        path: '/',
                        component: require('../views/Index/Index'),
                        subMenu: false
                    }
                ]
            },

            {
                path: 'content',
                name: '内容管理',
                component: view,
                children: [
                    {
                        path: '/',
                        name: '小程序首页',
                        component: require('../views/Content/Index')
                    }, 
                    {
                        path: 'topic',
                        name: '专题列表页',
                        component: view,
                        children: [
                            {
                                path: '/',
                                component: require('../views/Content/Topic')
                            },
                            {
                                name: 'editTopic',
                                path: 'edit',
                                component: require('../views/Content/topic/EditTopic')
                            }
                        ]
                    }, {
                        path: 'material',
                        name: '素材管理',
                        component: view,
                        children: [
                            {
                                path: '/',
                                component: require('../views/Content/Material')
                            },
                            {
                                name: 'editMaterial',
                                path: 'edit',
                                component: require('../views/Content/material/EditMaterial')
                            }
                        ]
                    }
                ]
            },

            {
                path: 'visit',
                name: '导览管理',
                component: view, meta: { todo: true }
            },

            {
                path: 'market',
                name: '营销管理',
                component: view,
                children: [
                    // {
                    //     path:'/',
                    //     name: 'baiye',
                    //     subMenu: false,
                    //     component: require('../views/Market/Spread')
                    // },
                    {
                        path: '/',
                        name: '推广管理',
                        component: view,
                        // component: require('../views/Market/Spread'),
                        children:[
                            {
                                path:'/',
                                component: require('../views/Market/Spread')
                            },
                            {
                                path: 'spreadAdd',
                                name: 'spreadAdd',
                                // subMenu: false,
                                component: require('../views/Market/SpreadAdd')
                            }
                        ]
                    }
                ]
            },

            {
                path: 'ticket',
                name: '票务管理',
                component: view, meta: { todo: true }
            },

            {
                path: 'house',
                name: '房源管理',
                component: view, meta: { todo: true }
            },

            {
                path: 'customer',
                name: '客户管理',
                component: view, meta: { todo: true }
            },

            {
                path: 'account',
                tab: false,
                component: view,
                children: [
                    {
                        path: 'modifyPassword',
                        meta: 'modifyPassword',
                        component: require('../views/Account/Pwd'),
                        name: '修改密码'
                    }
                ]
            },
            // {
            //     path: 'help',
            //     tab: false,
            //     component: require('../views/Account/Help')
            // },
            {
                path: 'help',
                tab: false,
                component: view,
                children: [
                    {
                        path: '/',
                        name: '使用手册',
                        component: require('../views/Account/Help')
                    }
                ]
            }
        ]
    },
    {
        path: '/login',
        component: require('../views/Login/Index')
    },
    {
        path: '/*',
        redirect: '/index'
    }
];
export default routers;
