/***
 * 接口WIKI：
 * http://wiki.ops.focus.cn/pages/viewpage.action?pageId=12526875
 */
import sfax from 'sfax';
import { get, post } from './req';
import { domain } from 'conf/domain';
sfax.baseUrl = domain;

export default {
    //ad
    adList:get('ad/adUnit/query'),
    adUneffect:post('ad/adUnit/invalid', {
        contentType: 'application/json;charset=UTF-8'
    }),
    adAdd:post('ad/adUnit/add',{
        contentType: 'application/json;charset=UTF-8'
    }),
    adPoslist:get('ad/pos/list'),
    adDetail:get('ad/adUnit/detail'),
    // login && user
    login: post('login'),
    logout: post('logout'),
    // adminInfo2: get(`${loginDomain}/admin/focusUser/currentUserInfo`),
    // adminInfo: get('/MOCK/admin/info'),
    pwdUpdate: post('password/update'),

    // index
    indexBasic: get('info/basic'),
    indexRecommend: get('info/recommend'),
    indexHelp: get('help/bindAppHelp'),
    helpManual: get('help/manual'),
    // 首页查看指引
    // op
    opList: get(`content/op/list`),
    opUpdatePic: post(`img/upload`),
    opUpdate: post(`content/op/update`),
    opDetail: get(`content/op/info`),
    opClear: post(`content/op/clear`),
    opUploadMp3: post(`mp3/upload`),
    // 菜单管理 wiki http://wiki.ops.focus.cn/pages/viewpage.action?pageId=12536391
    homeMenuList: get(`project/resource/menu/info`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    homeMenuDetail: get(`project/resource/menu/detail`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    updateMenuOrder: post(`project/resource/menu/update/order`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    deleteMenu: post(`project/resource/menu/delete`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    insertMenu: post(`project/resource/menu/insert`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    updateMenu: post(`project/resource/menu/update`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    // 专题管理 wiki http://wiki.ops.focus.cn/pages/viewpage.action?pageId=12536956
    topicList: get(`topic/getTopicListByProjectId`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    topicDetail: get(`topic/getTopicById`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    relatedTopic: get(`topic/getTopicListByToId`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    relatedTopicOrder: post(`topic/modifyTopicRelation`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    topicMaterial: get(`material/getMaterialListByTopic`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    topicPublish: post(`topic/publish`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    topicEdit: post(`topic/modifyInfo`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    relatedTopicSuggest: get(`topic/bind/suggest`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    relationGenerate: get(`topic/generateAllTopicRelationList`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    // 素材管理
    materialList: get(`material/getMaterialList`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    materialDetail: get(`material/getMaterialById`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    checkMaterial: get(`material/bind/match`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    materialOrder: post(`material/modifyMaterialRelation`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    searchTopic: get(`material/bind/suggest`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    publishMaterial: post(`material/publish`, {
        contentType: 'application/json;charset=UTF-8'
    }),
    editMaterial: post(`material/modify`, {
        contentType: 'application/json;charset=UTF-8'
    })
};
