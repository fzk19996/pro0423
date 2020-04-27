<style lang="scss">
    .breadcrumb {
        padding: 40px 0;
        font-size: 14px;
        a {
            cursor: pointer;
        }
        .btn {
            background-color: #FC634D;
            color: #fff;
            height: 40px;
            width: 120px;
            border-radius: 2px;
            position: absolute;
            top: 27px;
            right: 0;
            outline: none !important;
        }
    }
    .el-textarea__inner {
        max-width: 500px;
    }
    .scroll {
        margin-top: 20px;
    }
    .is-disabled {
        background-color: #fff !important;
        color: #FC634D !important;
        border-color: #FC634D !important;
    }
    .placeholder {
        height: 80px;
        width: 100%;
    }
    .bottom {
        height: 40px;
        width: 100%;
        position: fixed;
        bottom: 0;
        z-index: 9;
        left: 210px;
        background-color: #fff;
        padding: 20px;
        border-top: 1px solid #D5D5D5;

        button:first-child {
            margin-left: 20px
        }
    }
</style>
<style lang="scss" scope>
    .imgPreview {
        width: 160px !important;
        height: 120px !important;
        border: 1px solid #DCDFE6;
        display: inline-block;
        border-radius: 4px;

        img {
            width: 160px;
            height: 120px;
            background-size: cover;
        }
    }
    .result {
        margin-top: 20px;
    }
    .popup {
        .el-form-item {
            margin-bottom: 0;
        }
    }
</style>
<template lang="pug">
    div(style="margin: 0 20px")
        div.breadcrumb
            a(style="color: #333" @click="back") 专题列表页
            span >
            a(style="color: #999") {{mode === 'create' ? '添加专题' : '编辑专题'}}
        el-dialog(:visible.sync="imgVisible" width="280px" :modal="false" style="text-align: center" top="25vh")
                    img(:src="imgLink" v-if="imgLink" style="width: 160px; height: 160px; margin: 0 auto")
        el-tabs(v-model="show" type="card" :before-leave="checkForm")
            //- 专题基础信息
            el-tab-pane(label="专题基础信息" name="basic" style="margin-top: 15px")
                el-form(:model="formData" label-width="100px" style="margin-top: 15px" :rules="rules" ref="form")
                    el-form-item(label="专题标题：" prop="title")
                        el-input( v-model.trim="formData.title" style="max-width: 500px!important")
                        div.info 专题标题会用于标题栏、分享标题等展示，请填写1-30字，当前输入{{titleLength}}字
                    el-form-item(label="专题简介：" prop="topicAbstract")
                        el-input(v-model.trim="formData.topicAbstract" type="textarea" :rows="3")
                        div.info 专题简介会用于介绍区、分享副标题等展示，请填写1-100字，当前输入{{topicAbstractLength}}字
                    el-form-item(label="封面图：" style="height: 140px" prop="info.cover_image")
                        div.imgPreview
                            img(v-if="!formData.info.cover_image" :src="defaultImg")
                            a(v-if="formData.info.cover_image" :href="formData.info.cover_image" target="_blank")
                                img(:src="formData.info.cover_image")
                        div(style="position: relative; left: 180px; top: -120px")
                            div(style="width: 320px; line-heigt: 18px").info 请上传图片，仅支持JPEG、JPG、GIF和PNG，大小不超过2.5M。（750px*375px）
                            el-button(@click="handleUploadCrop" size="mini" type="primary") 上传并裁剪图片
                    el-form-item(label="")
                        el-button(type="primary" @click="next") {{mode==='edit'?'保存':'下一步'}}
                        el-button(@click="back") 取消
                crop-image.wide(
                    :visible.sync="imgCrop.visible"
                    :dialogData.sync="imgCrop.data"
                    @cropDone="handleCropDone"
                )
            //- 专题素材设置
            el-tab-pane(label="专题素材设置" name="material")
                div.explain 内容被关联后，即可按编号在专题列表页上展示；若希望内容永远展示在上方，您可将其置顶。（已关联{{materialData.length}}条）
                    span.info 下列内容可以通过拖拽进行排序操作
                    button.btn(@click="openMaterial") 关联新素材
                el-table(:data="materialData" id="recommend" border)
                    el-table-column(label="编号" width="70px" align="center")
                        template(slot-scope="scope")
                            p {{scope.$index + 1}}
                    el-table-column(label="素材id" width="120px" prop="materialId" align="center")
                    el-table-column(label="素材标题" prop="title" align="center")
                    el-table-column(label="素材地址" prop="info.page_link" align="center")
                    //- el-table-column(label="二维码" width="120px" align="center")
                        template(slot-scope="scope")
                            el-button(size="mini" v-if="scope.row.info.qr_code" @click="showQrcode(scope.row.info.qr_code)") 查看二维码
                            p(v-else="scope.row.info.qr_code") 已失效
                    el-table-column(label="关联状态" width="80px" align="center")
                        template(slot-scope="scope")
                            p {{scope.row.status==2?'置顶':scope.row.status==1?'关联':'未关联'}}
                    el-table-column(label="素材状态" width="80px" align="center")
                        template(slot-scope="scope")
                            p {{materialStatus(scope.row.materialStatus)}}
                    el-table-column(label="操作" width="260px" align="center")
                        template(slot-scope="scope")
                            el-button(size="mini" @click="pinMaterial(scope.row)") {{scope.row.status===2?'取消置顶':'置顶'}}
                            el-button(size="mini" @click="editMaterial(scope.row)") 修改
                            el-button(size="mini" @click="unbindMaterial(scope.row)") {{mapOperate(scope.row)}}
                div.placeholder
                div.bottom
                    el-button(type="primary" @click="submitMaterial") {{mode==='edit'?'保存':'下一步'}}
                    el-button(@click="cancelSubmitMaterial") 取消
            //- 相关专题推荐
            el-tab-pane(label="相关专题推荐" name="related")
                div(style="margin-top: 15px; font-size: 14px; color: #333")
                    span.iconExplain
                    span 相关专题推荐将展示在本页面地步，选择合适的推荐内容可以提升用户的兴趣
                div(style="margin-top: 40px")
                    input(type="radio" v-model="formData.autoBind" value="0" style="margin: 0 10px" :cheked="formData.autoBind=='0'" :disabled="mode==='edit'")
                    span 自动关联
                    input(type="radio" v-model="formData.autoBind" value="1" style="margin: 0 10px" :cheked="formData.autoBind=='1'" :disabled="mode==='edit'")
                    span 手动关联
                div(style="margin: 10px 0 30px; font-size: 12px; color: #999") 系统自动关联，无需手动操作，新专题将自动展示在页面上方，您可手动调整排序。
                div(v-if="formData.autoBind=='1'")
                    el-input(v-model="topicTitle" placeholder="请输入要推荐的专题名称" style="max-width: 240px !important")
                    el-button(type="primary" style="margin-left: 20px" @click="searchTopic") 查找
                    div.info(style="padding:10px 0 0") 新关联的专题按默认显示在最上方,请手动拖拽调整顺序
                    div(style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #D5D5D5" v-if="suggestData.length")
                        span(style="margin-right: 15px") 查找结果：
                    el-table(:data="suggestData" border v-if="suggestData.length")
                        el-table-column(label="编号" align="center")
                            template(slot-scope="scope")
                                p {{scope.$index + 1}}
                        el-table-column(label="专题ID" prop="id" align="center")
                        el-table-column(label="专题标题" prop="title" align="center")
                        //- el-table-column(label="二维码" align="center" width="140px")
                            template(slot-scope="scope")
                                el-button(size="mini" v-if="scope.row.info.qr_code" @click="showQrcode(scope.row.info.qr_code)") 查看图片
                        el-table-column(label="操作" align="center")
                            template(slot-scope="scope")
                                el-button(size="mini" @click="editRelated(scope.row, 'add')") 关联
                div(style="margin-top:40px") 以下为本专题已关联的相关专题信息：
                    span.info 下列内容可以通过拖拽进行排序操作
                el-table(:data="relatedDataShow" style="margin-top: 20px" id="related" border)
                    el-table-column(label="编号" align="center")
                        template(slot-scope="scope")
                            p {{scope.$index + 1}}
                    el-table-column(label="专题ID" align="center")
                        template(slot-scope="scope")
                            p {{scope.row.fromId || scope.row.id}}
                    el-table-column(label="专题标题" prop="title" align="center")
                    //- el-table-column(label="二维码" align="center" width="100px")
                        template(slot-scope="scope")
                            el-button(size="mini" v-if="scope.row.info && scope.row.info.qr_code" @click="showQrcode(scope.row.info.qr_code)") 查看图片
                    el-table-column(label="操作" width="260px" align="center" v-if="formData.autoBind=='1'")
                        template(slot-scope="scope")
                            el-button(v-if="scope.row.status!==0" size="mini" @click="editRelated(scope.row, 'remove')") 取消关联
                div.placeholder
                div.bottom
                    el-button(type="primary" @click="submit") {{mode==='edit'?'保存':'完成'}}
                    el-button(@click="cancelSubmitRelation") 取消
            //- 关联素材弹窗
            el-dialog(title="关联新素材" :visible.sync="material.visible" width="40%" @close="cancelAddMaterial")
                el-form(:model="material" :rules="materialRule" label-width="90px" class="popup")
                    el-form-item(label="素材id:" prop="id")
                        el-input(v-model="material.id" placeholder="请填写" style="margin: 0 10px")
                    span.info(style="width: 240px; display:inline-block; line-heghit: 18px; margin: 15px 90px 0") 填写内容id后，请点击“匹配”按钮，系统将自动为您匹配素材
                    br
                    el-button(@click="checkMaterial" type="primary" style="margin: 10px 100px 0") 匹配
                    el-form-item(label="标题：")
                        span {{material.title || '无匹配结果'}}
                    el-form-item(label="简介：")
                        span {{material.materialAbstract || '无匹配结果'}}
                    el-form-item(label="素材状态：")
                        span {{materialStatus(material.materialStatus)}}
                    span.info(style="width: 240px; display:inline-block; line-heghit: 18px; margin:0 90px") 系统已为您自动选中第一个编号，您也可以通过拖拽将新素材插入至相应的推荐位中
                    div(style="text-align: right")
                        el-button(type="primary" @click="addMaterial") 确定
                        el-button(@click="cancelAddMaterial") 取消
</template>
<script>
import CropImage from 'com/CropImage.vue';
import Sortable from 'sortablejs';
import { MessageBox } from 'element-ui';

import {
    DefaultPhotoDomain,
    DefaultPhoto220x165
} from 'conf/domain';

export default {
    data() {
        return {
            mode: 'create',
            show: 'basic',
            defaultImg: `${DefaultPhotoDomain}${DefaultPhoto220x165}`,
            formData: {
                status: 1,
                title: '',
                topicAbstract: '',
                info: {},
                autoBind: '0'
            },
            materialRule: {
                // id: [{ required: true, message: '请输入素材id', trigger: 'blur' }]
            },
            rules: {
                title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
                topicAbstract: [{ required: true, message: '请输入简介', trigger: 'blur' }],
                'info.cover_image': [{ required: true }]
            },
            initData: {
                title: '',
                topicAbstract: '',
                info: {}
            },
            imgVisible: false,
            imgLink: '',
            topicTitle: '',
            order: '',
            materialData: [],
            relatedData: [],
            suggestData: [],
            materialRelationList: [],
            // 匹配到的素材
            material: {
                materialId: '',
                visible: false,
                materialAbstract: '',
                title: '',
                status: '',
                updateTime: '',
                info: {}
            },
            materialEdited: false,
            topicRelationEdited: false,
            imgCrop: {
                visible: false,
                data: {
                    index: 0,
                    width: 750,
                    height: 375,
                    type: '',
                    img: ''
                }
            }
        };
    },
    watch: {
        'formData.autoBind'(val, oldV) {
            if (Number(val) === 0) {
                this.$serv.relationGenerate({
                    projectId: this.$store.state.userInfo.projectId
                }).then(res => {
                    this.relatedData = res;
                });
            } else {
                this.relatedData = [];
            }
        }
    },
    components: {
        CropImage
    },
    computed: {
        materialBind() {
            return this.materialData.filter(item => Number(item.status) === 1).length;
        },
        changed() {
            let changed = false;
            const checkMap = ['title', 'topicAbstract', 'info'];
            const { initData, formData } = this;
            for (const item of checkMap) {
                const initVal = JSON.stringify(initData[item]);
                const val = JSON.stringify(formData[item]);
                if (val !== initVal) {
                    changed = true;
                }
            }
            return changed;
        },
        relatedDataShow() {
            const { relatedData } = this;
            if (relatedData.length) return relatedData.filter(item => item.status !== 0);
            return [];
        },
        topicAbstractLength() {
            const { topicAbstract } = this.formData;
            if (!topicAbstract) return 0;
            else return this.getStringWidth(topicAbstract);
        },
        titleLength() {
            const { title } = this.formData;
            if (!title) return 0;
            else return this.getStringWidth(title);
        }
    },
    activated() {
        this.show = 'basic';
        const { id } = this.$route.query;
        if (!id) {
            this.mode = 'create';
        } else {
            this.mode = 'edit';
        }
        if (this.mode === 'edit') {
            this._getSearchData();
        } else if (this.mode === 'create') {
            document.querySelector('input[type="radio"]').checked = true;
            this.formData = {
                title: '',
                topicAbstract: '',
                info: {},
                autoBind: '0'
            };
            // 获取自动绑定专题列表
            this.$serv.relationGenerate({
                projectId: this.$store.state.userInfo.projectId
            }).then(res => {
                this.relatedData = res;
            });
            this.materialData = [];
        }
        this.suggestData = [];
        this.initSortable();
    },
    updated() {},
    methods: {
        getStringWidth(val) {
            let len = 0;
            for (let i = 0; i < val.length; i++) {
                const code = val.charCodeAt(i);
                if( code >= 0 && code <= 128 ) {
                    len += 0.5;
                } else {
                    len += 1;
                }
            }
            return len;
        },
        mapOperate(row) {
            if (!row || !row.status) return '关联';
            return '取消关联';
        },
        back() {
            const { changed } = this;
            if (!changed) {
                this.$router.back(-1);
            } else {
                MessageBox.confirm('取消后，您填写的内容将无法找回', '取消', {
                    center: true,
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn'
                }).then(_ => {
                    this.$router.back(-1);
                });
            }
        },
        materialStatus(status) {
            if (!status) return '无匹配结果';
            if (Number(status) === 1) return '有效';
            if (Number(status) === 3) return '草稿';
            if (Number(status) === 2) return '失效';
        },
        _getSearchData() {
            const _this = this;
            const { id } = this.$route.query;
            this.initForm(_this, id);
            this.initMaterial(_this, id);
            this.initRelated(_this, id);
        },
        initRelated(_this, id) {
            this.$serv.relatedTopic({
                topicId: id
            }).then(res => {
                if (res) {
                    _this.relatedData = res.map(item=>Object.assign(item, {
                        info: JSON.parse(item.info)
                    }));
                }
            });
        },
        initMaterial(_this, id) {
            this.$serv.topicMaterial({
                topicId: id
            }).then(res => {
                if (res) {
                    _this.materialData = res.map(item=>Object.assign(item, {
                        info: JSON.parse(item.info)
                    }));
                    const head = _this.materialData.filter(item => item.status===2);
                    const tail = _this.materialData.filter(item => item.status!==2);
                    _this.materialData = head.concat(tail);
                }
            });
        },
        initForm(_this, id) {
            this.$serv.topicDetail({
                id
            }).then(res=>{
                const { title, topicAbstract, info, autoBind, extInfo, status } = res;
                _this.formData = {
                    title,
                    status,
                    topicAbstract,
                    info: JSON.parse(info),
                    autoBind: autoBind + '',
                    extInfo: JSON.parse(extInfo)
                };
                _this.initData = {
                    title,
                    topicAbstract,
                    info: JSON.parse(info)
                };
            });
        },
        initSortable() {
            const related = document.querySelector('#related tbody');
            const recommend = document.querySelector('#recommend tbody');
            const _this = this;
            new Sortable(related, {
                onUpdate: e=> {
                    _this.materialEdited = true;
                    _this.topicRelationEdited = true;
                    const { newIndex, oldIndex } = e;
                    const $li = related.children[newIndex];
                    const $oldLi = related.children[oldIndex];
                    related.removeChild($li);
                    if (newIndex > oldIndex) {
                        related.insertBefore($li, $oldLi);
                    } else {
                        related.insertBefore($li, $oldLi.nextSibling);
                    }
                    const item = _this.relatedData.splice(oldIndex, 1);
                    _this.relatedData.splice(newIndex, 0, item[0]);
                },
                animation: 150
            });
            new Sortable(recommend, {
                onUpdate: e=> {
                    const { newIndex, oldIndex } = e;
                    const $li = recommend.children[newIndex];
                    const $oldLi = recommend.children[oldIndex];
                    recommend.removeChild($li);
                    if (newIndex > oldIndex) {
                        recommend.insertBefore($li, $oldLi);
                    } else {
                        recommend.insertBefore($li, $oldLi.nextSibling);
                    }
                    const item = _this.materialData.splice(oldIndex, 1);
                    _this.materialData.splice(newIndex, 0, item[0]);
                },
                animation: 150
            });
        },
        checkForm(activeName, oldActiveName) {
            const { title, info, topicAbstract } = this.formData;
            if (oldActiveName === 'basic') {
                const { cover_image } = info;
                if (!title || !topicAbstract || !cover_image) {
                    this.$notifyErr('有内容未填写完整');
                    return false;
                }
                if (this.getStringWidth(title) > 30 || this.getStringWidth(title) < 1) {
                    this.$notifyErr('请检查标题长度');
                    return false;
                } if (this.getStringWidth(topicAbstract) > 100 || this.getStringWidth(topicAbstract) < 1) {
                    this.$notifyErr('请检查简介长度');
                    return false;
                }
            }
        },
        handleUploadCrop() {
            this.imgCrop.visible = true;
            this.imgCrop.data.img = this.formData.info.cover_image;
        },
        handleCropDone(payload) {
            this.formData.info.cover_image = payload.url;
            this.isConfirmCrop = true;
        },
        openMaterial() {
            this.material.visible = true;
        },
        showQrcode(link) {
            this.imgLink = link;
            this.imgVisible = true;
        },
        editRelated(row, type) {
            if (type === 'add') {
                const { id } = row;
                let added = false;
                for (let i = 0; i < this.relatedData.length; i++) {
                    if (this.relatedData[i].fromId === id) added = true;
                }
                if (!added) {
                    this.topicRelationEdited = true;
                    this.relatedData.unshift({ ...row, fromId: id });
                    this.suggestData = this.suggestData.filter(item => item.id !==id);
                }
            } else if (type === 'remove') {
                MessageBox.confirm('取消关联后需要点击保存才可生效', '取消关联', {
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn'
                }).then(_ => {
                    this.topicRelationEdited = true;
                    const { fromId } = row;
                    this.relatedData = this.relatedData.map(item => ({
                        ...item,
                        status: item.fromId === fromId ? 0 : item.status
                    }));
                });
            }
        },
        // 修改或初始化专题基本信息
        next() {
            const { mode } = this;
            const { projectId } = this.$store.state.userInfo;
            const { title, topicAbstract, info, status } = this.formData;
            if (!title || !topicAbstract || !info.cover_image) {
                this.$notifyErr('请填写完整内容');
                return false;
            }
            if (this.getStringWidth(title) > 30 || this.getStringWidth(title) < 1) {
                this.$notifyErr('请检查标题长度');
                return false;
            } if (this.getStringWidth(topicAbstract) > 100 || this.getStringWidth(topicAbstract) < 1) {
                this.$notifyErr('请检查简介长度');
                return false;
            }
            this.$refs.form.validate(valid => {
                if (valid) {
                    if (mode === 'edit') {
                        if (!this.changed) {
                            this.$notifyErr('内容未修改，无需保存');
                        } else {
                            const { id } = this.$route.query;
                            this.$serv.topicEdit({
                                id,
                                projectId,
                                title,
                                status: id === 1 ? 3 : status,
                                topicAbstract,
                                info: info === {} ? '' : JSON.stringify(info)
                            }).then(res => {
                                this.$notifyOk('保存成功');
                                this.initForm(this, this.$route.query.id);
                            });
                        }
                    } else if (mode === 'create') {
                        this.show = 'material';
                    }
                } else {
                    this.$notifyErr('有内容未填写完整');
                }
            });
        },
        searchTopic() {
            const _this = this;
            const { topicTitle } = this;
            const { id } = this.$route.query;
            const { projectId } = this.$store.state.userInfo;
            const params = {
                projectId,
                title: topicTitle
            };
            if (id) params.topicId = id;
            this.$serv.relatedTopicSuggest(params).then(res => {
                if (res) _this.suggestData = res.map(item => Object.assign(item, {
                    info: item.info === {} ? '' : JSON.stringify(item.info)
                }));
                if (this.suggestData.length === 0) _this.$notifyErr('未查找到相关专题，请检查输入的专题名称是否正确');
            });
        },
        // 提交关联专题的修改
        submit() {
            const _this = this;
            const { mode, relatedData } = this;
            const { projectId } = this.$store.state.userInfo;
            const { id } = this.$route.query;
            const topicRelationList = relatedData.map((item, index) => ({
                fromId: item.id || item.fromId,
                toId: Number(id),
                status: item.status,
                rank: index
            }));
            if (mode === 'create') {
                const { title, topicAbstract, info } = this.formData;
                let { autoBind } = this.formData;
                autoBind = autoBind ? Number(autoBind) : 0;
                const { materialRelationList } = this;
                this.$serv.topicPublish({
                    projectId,
                    topicRelationList,
                    materialRelationList,
                    autoBind: autoBind ? Number(autoBind) : 0,
                    title,
                    topicAbstract,
                    status: 1,
                    info: info === {} ? '' : JSON.stringify(info)
                }).then(res => {
                    _this.$notifyOk('发布成功');
                    _this.$router.back(-1);
                });
            } else if (mode === 'edit') {
                const orderList = this.relatedData.map((item, index) => {
                    return {
                        fromId: item.id || item.fromId,
                        toId: Number(id),
                        status: item.status,
                        rank: index,
                        updateTime: item.updateTime
                    };
                });
                if (orderList.length) {
                    this.$serv.relatedTopicOrder({
                        projectId,
                        orderList
                    }).then(res => {
                        _this.$notifyOk('保存成功');
                        _this.initRelated(_this, id);
                    }).catch(e => {
                        if (e && e.code === -1) {
                            _this.$notifyOk('保存成功');
                            _this.initRelated(_this, id);
                        }
                    });
                } else {
                    this.$notifyErr('专题未修改，不需要保存');
                }
            }
        },
        checkMaterial() {
            const _this = this;
            const materialId = this.material.id;
            if (!materialId) {
                this.$notifyErr('请输入id');
                return;
            }
            this.$serv.checkMaterial({
                materialId,
                topicId: this.$route.query.id || '',
                projectId: this.$store.state.userInfo.projectId
            }).then(res => {
                const { title, materialAbstract, materialStatus, updateTime, info, id } = res;
                _this.material.title = title;
                _this.material.materialAbstract = materialAbstract;
                _this.material.materialStatus = materialStatus;
                _this.material.materialId = id;
                _this.material.updateTime = updateTime;
                _this.material.info = JSON.parse(info);
            });
        },
        cancelAddMaterial() {
            this.material = {
                materialId: '',
                visible: false,
                materialAbstract: '',
                title: '',
                status: '',
                updateTime: '',
                info: {}
            };
        },
        cancelSubmitMaterial() {
            if (this.materialEdited || this.mode === 'create') {
                MessageBox.confirm('返回后您的修改将不会保存，是否确定', '返回列表页', {
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn'
                }).then(_=> {
                    this.$router.back(-1);
                });
            } else {
                this.$router.back(-1);
            }
        },
        cancelSubmitRelation() {
            if (this.topicRelationEdited || this.mode === 'create') {
                MessageBox.confirm('返回后您的修改将不会保存，是否确定', '返回列表页', {
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn'
                }).then(_=> {
                    this.$router.back(-1);
                });
            } else {
                this.$router.back(-1);
            }
        },
        addMaterial() {
            const { materialId } = this.material;
            let added = false;
            for (const item of this.materialData) {
                if (item.materialId === materialId) added = true;
            }
            if (added) {
                this.$notifyErr('已经添加过了');
                this.material = {
                    materialId: '',
                    visible: false,
                    materialAbstract: '',
                    title: '',
                    status: '',
                    updateTime: '',
                    info: {}
                };
            } else if (materialId) {
                this.materialEdited = true;
                this.$serv.checkMaterial({
                    materialId,
                    topicId: this.$route.query.id || '',
                    projectId: this.$store.state.userInfo.projectId
                }).then(res => {
                    const { title, status, updateTime, info, materialStatus } = res;
                    this.materialData.push({
                        status, updateTime, materialId, title, materialStatus,
                        info: info && JSON.parse(info),
                        topicId: this.$route.query.id || '' // 若为新增专题不需要此字段，最后通过publish接口统一提交
                    });
                });
                if (this.mode === 'edit') this.$notifyOk('编辑完成后请点击保存');
                if (this.mode === 'create') this.$notifyOk('请继续填写下一栏内容');
                this.material = {
                    materialId: '',
                    visible: false,
                    materialAbstract: '',
                    title: '',
                    status: '',
                    updateTime: '',
                    info: {}
                };
            }
        },
        pinMaterial(row) {
            this.materialEdited = true;
            const { materialId } = row;
            for (const item of this.materialData) {
                if (item.materialId === materialId) {
                    if (item.status === 1) { // 已关联
                        item.status = 2;
                        // 放置顶部
                        const head = this.materialData.filter(item => item.materialId === materialId);
                        const tail = this.materialData.filter(item => item.materialId !== materialId);
                        this.materialData = head.concat(tail);
                    }
                    else if (item.status === 2) { // 已置顶
                        item.status = 1;
                        // 从顶部移除
                        const head = this.materialData.filter(item => item.status === 2);
                        const tail = this.materialData.filter(item => item.status !== 2&&item.materialId !== materialId);
                        const mid = this.materialData.filter(item => item.materialId === materialId);
                        this.materialData = head.concat(mid).concat(tail);
                    } else { // 未关联
                        this.$notifyErr('请先关联');
                    }
                }
            }
            
        },
        unbindMaterial(row) {
            this.materialEdited = true;
            const { materialId } = row;
            for (const item of this.materialData) {
                if (item && item.materialId === materialId) {
                    if (!item.status) item.status = 1;
                    else item.status = 0;
                }
            }
            const head = this.materialData.filter(item => item.status && item.status !==0);
            const tail = this.materialData.filter(item => !item || !item.status);
            this.materialData = head.concat(tail);
        },
        submitMaterial() {
            const _this = this;
            const { mode, materialData } = this;
            const { projectId } = this.$store.state.userInfo;
            const { id } = this.$route.query;
            const head = materialData.filter(item => item.status === 2);
            const tail = materialData.filter(item => item.status === 1);
            const deleted = materialData.filter(item => item.status === 0);

            const materialRelationList = head.concat(tail).concat(deleted).map((item, index) => ({
                materialId: item.materialId,
                topicId: Number(id),
                status: item.status,
                updateTime: item.updateTime,
                rank: index
            }));
            if (mode === 'create') {
                this.materialRelationList = materialRelationList;
                this.show = 'related';
            } else if (mode === 'edit') {
                const orderList = materialRelationList;
                if (orderList.length) {
                    this.$serv.materialOrder({
                        projectId,
                        orderList
                    }).then(res => {
                        _this.$notifyOk('保存成功');
                        _this.initMaterial(_this, id);
                    }).catch(e => {
                        if (e && e.code === -1) {
                            _this.initMaterial(_this, id);
                        }
                    });
                } else {
                    this.$notifyErr('请添加素材后再保存');
                }
            }
        },
        editMaterial(row) {
            const { materialId } = row;
            this.$router.push({
                name: 'editMaterial',
                query: {
                    id: materialId
                }
            });
        }
    }
};
</script>
