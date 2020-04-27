<style lang="scss">
    .wide .el-dialog {
        width: 835px;
    }
    .breadcrumb {
        padding: 40px 0;
        font-size: 14px;

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
    .cancelBtn {
        position: relative;
        left: 70px;
    }
    .confirmBtn {
        position: relative;
        left: -70px;
    }
    .abs {
        .el-textarea__inner {
            max-width: 760px
        }
    }
    .imgPreview {
        width: 140px;
        height: 100px;
        border: 1px solid #DCDFE6;
        display: inline-block;
        border-radius: 4px;

        img {
            width: 160px;
            height: 120px;
            background-size: cover;
        }
    }
    .info {
        font-size: 12px;
        color:#999;
    }
    .ql-editor {
        height: 240px !important;
    }
    .quill-editor {
        width: 760px;
        border: 1px solid #DCDFE6;
        border-radius: 4px;
    }
    .ql-snow {
        border: none !important;
    }
    .ql-container{
        border-top: 1px solid #DCDFE6 !important;
    }
    .cropDiv {
        position: relative;
        left: 180px;
        top: -100px;
        font-size: 12px;
        color: #999;

        p {
            line-height: 18px;
        }
    }
    .scroll {
        margin-top: 20px;
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
        background-color: #fff;
        padding: 20px 0;
        border-top: 1px solid #D5D5D5;
    }
    audio {
        height: 32px;
        float: left;
        margin-right: 15px;
    }
</style>
<style lang="scss">
    strong {
        font-weight: 700 !important;
    }
    em {
        font-style: italic !important;
    }
</style>
<template lang="pug">
    div(style="margin: 0 20px")
        div.breadcrumb
            a(style="color: #333" @click="back") 素材管理
            span >
            a(style="color: #999") {{breadcrumb}}
        el-tabs(v-model="show" type="card" :before-leave="checkForm")
            //- 基础信息
            el-tab-pane(label="素材基础信息" name="basic")
                el-form(label-width="100px" :disabled="mode === 'view'" :model="formData" :rules="rules" style="margin-top: 15px")
                    el-form-item(label="标题：" prop="title")
                        el-input(v-model.trim="formData.title" @change="changed")
                        div.info 素材标题会用于标题栏、分享标题等展示，请填写1-30字（当前输入{{titleLength}}字）
                    el-form-item(label="正文：" style="position: relative" prop="content")
                        quill-editor(
                            v-model="formData.content"
                            ref="myQuillEditor"
                            :options="editorOption"
                            @focus="onEditorFocus($event)"
                            @change="onEditorChange($event)"
                        )
                        span(style="font-size: 12px; color: #999; position: absolute; left: 780px; top: 55px") {{contentLength}} / 10000
                    el-form-item(label="简介：" prop="materialAbstract")
                        el-input(class="abs" type="textarea" style="width: 830px" v-model="formData.materialAbstract" :rows="3" @change="changed")
                        span(style="font-size:12px; color:#999;position:relative;top:-20px;left:-40px") {{materialAbstractLength}}/100
                    el-form-item(label="封面图：" style="height: 130px" prop="info.cover_image")
                        div.imgPreview
                            img(v-if="!formData.info.cover_image" :src="defaultImg")
                            a(v-if="formData.info.cover_image" :href="formData.info.cover_image" target="_blank")
                                img(:src="formData.info.cover_image")
                        crop-image(
                            class="wide"
                            :visible.sync="imgCrop.visible"
                            :dialogData.sync="imgCrop.data"
                            @cropDone="handleCropDone"
                        )
                        div.cropDiv
                            p 请上传图片，仅支持JPEG、JPG、GIF与PNG ，大小不超过2.5M。
                            p （750px * 375px）
                            el-button(size="mini" @click="handleUploadCrop") 上传并裁剪图片
                div.placeholder(style="height: 100px")
                div.bottom
                    el-button(type="primary" @click="next") 下一步
                    el-button(@click="cancel") 取消
            el-tab-pane(label="素材拓展信息" name="extend")
                el-form(label-width="100px" :disabled="mode === 'view'")
                    el-form-item(label="导航：")
                        el-input(style="width: 140px; margin-right: 10px" placeholder="请填写经度" v-model="formData.geoInfo.longitude" @change="changed")
                        el-input(style="width: 140px" placeholder="请填写纬度" v-model="formData.geoInfo.latitude" @change="changed")
                        div.info 若您希望用户能够使用导航功能，前往目的地，请填写精确的经纬度
                    el-form-item(label="咨询电话：")
                        el-input(style="width: 290px" placeholder="请填写咨询电话" v-model="formData.tel" @change="changed")
                        div.info 请参照如下格式填写：手机号12345678901 座机号012-34567890 服务号1234567890 转拨号1234567890，666888
                    el-form-item(label="语音：")
                        //- upload music
                        input(type="file" id="upload" accept="audio/mpeg" @change="upload($event)" style="display: none")
                        el-button(size="small" type="primary" @click="handleUpload" style="float: left;margin-right: 15px") 上传
                        audio(v-if="formData.extInfo.voice" controls="controls" :src="formData.extInfo.voice")
                        div.info 请上传语音文件，仅支持mp3格式，大小不超过10M，时长不超过60min
                    el-form-item(label="关联专题：")
                        el-input(v-model="formData.topic" placeholder="请输入专题名称")
                            template(slot="append")
                                span(@click="searchTopic" style="cursor: pointer") 查找
                    div(style="padding: 20px 0; border-top: 1px solid #D5D5D5" v-if="topicDataShow.length") 查找结果：
                        span.info(style="margin: 15px 0") 素材关联到专题后默认显示在该专题最上方，可以在专题页的素材选项中拖拽调整顺序
                    el-table(:data="topicDataShow" border v-if="topicDataShow.length" style="margin-bottom:20px")
                        el-table-column(label="专题ID" prop="id" align="center")
                        el-table-column(label="专题名称" prop="title" align="center")
                        //- el-table-column(label="二维码" align="center")
                            template(slot-scope="scope")
                                el-button(v-if="scope.row.info && scope.row.info.qr_code" size="mini" @click="showImg(scope.row.info.qr_code)") 显示图片
                        el-table-column(label="操作" align="center")
                            template(slot-scope="scope")
                                el-button(type="primary", size="mini" @click="bindTopic(scope.row)") 关联
                    div(style="margin-bottom: 20px") 已关联的专题：
                    el-tag(v-for="tag in tags" :key="tag.id" :closable="mode!=='view'" type="danger" style="margin-right: 15px" @close="close(tag)") {{tag.title}}
                div.placeholder(style="height: 100px")
                div.bottom
                    el-button(type="primary" @click="submit(1)") {{switchMainBtn()}}
                    el-button(@click="submit(3)" v-if="mode!=='view'") {{switchSubBtn()}}
        el-dialog(:visible.sync="imgVisible" width="180px" center :modal="false")
            img(v-if="imgSrc" :src="imgSrc" style="width: 120px; height: 120px; background-size: cover")
</template>
<script>
import CropImage from 'com/CropImage.vue';

import { MessageBox } from 'element-ui';

import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import {
    DefaultPhotoDomain,
    DefaultPhoto220x165
} from 'conf/domain';

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons

    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'align': [] }],

    ['clean']
];

export default {
    data() {
        return {
            mode: 'create',
            show: 'basic',
            defaultImg: `${DefaultPhotoDomain}${DefaultPhoto220x165}`,
            formData: {
                title: '',
                info: {},
                topic: '',
                materialAbstract: '',
                content: '',
                extInfo: {
                    voice: '',
                    recordLength: ''
                },
                geoInfo: {
                    longitude: '',
                    latitude: ''
                },
                tel: '',
                status: 1
            },
            rules: {
                title: [{ required: true, trigger: 'blur', message: '请填写标题' }],
                content: [{ required: true, trigger: 'blur', message: '请填写正文' }]
            },
            change: 0,
            voice: '',
            topicData: [],
            tags: [],
            imgCrop: {
                visible: false,
                data: {
                    index: 0,
                    width: 750,
                    height: 375,
                    type: '',
                    img: ''
                }
            },
            isConfirmCrop: false,
            imgSrc: '',
            imgVisible: false,
            editorOption: {
                modules: {
                    toolbar: toolbarOptions
                },
                placeholder: '发布重要的、新鲜的、有趣的内容，让这里更具有吸引力……',
                theme: 'snow'
            },
            contentLength: 0
        };
    },
    components: {
        CropImage,
        quillEditor
    },
    computed: {
        breadcrumb() {
            switch (this.mode) {
                case 'edit':
                    return '修改素材';
                case 'create':
                    return '创建素材';
                case 'view':
                    return '查看素材';
                default:
                    return '';
            }
        },
        titleLength() {
            const { title } = this.formData;
            if (!title) return 0;
            return this.getStringWidth(title);
        },
        materialAbstractLength() {
            const { materialAbstract } = this.formData;
            if (!materialAbstract) return 0;
            return this.getStringWidth(materialAbstract);
        },
        topicDataShow() {
            return this.topicData.filter(item => !item.hide) || [];
        }
    },
    activated() {
        this.show = 'basic';
        const { mode, id } = this.$route.query;
        if (!id) {
            this.mode = 'create';
        } else {
            if (!mode) this.mode = 'edit';
            else this.mode = mode;
        }
        this.topicData = [];
        this.tags = [];
        if (this.mode !== 'create') {
            this._initForm();
        } else {
            Object.assign(this.formData, this.$options.data().formData);
        }
    },
    deactivated() {
        this.change = 0;
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
        cancel() {
            if (this.mode === 'view') this.$router.back();
            else {
                if (this.change > 1) {
                    MessageBox.confirm('取消后，您填写的内容将无法找回', '取消', {
                        center: true,
                        cancelButtonClass: 'cancelBtn',
                        confirmButtonClass: 'confirmBtn'
                    }).then(_ => {
                        this.$router.back(-1);
                    });
                } else {
                    this.$router.back(-1);
                }
                // const checkMap = ['title', 'materialAbstract', 'info'];
                // const { initData, formData } = this;
                // for (const item of checkMap) {
                //     const initVal = JSON.stringify(initData[item]);
                //     const val = JSON.stringify(formData[item]);
                //     if (val !== initVal) {
                //         changed = true;
                //     }
                // }
                // if (this.change > 1) changed = true;
            }
        },
        back() {
            this.$router.back(-1);
        },
        switchMainBtn() {
            const { mode } = this;
            const { status } = this.formData;
            if (mode==='view') return '返回';
            if (mode==='create' || status === 3) return '发布';
            if (mode==='edit') return '保存';
        },
        switchSubBtn() {
            const { mode } = this;
            const { status } = this.formData;
            if (mode==='create' || status === 3) return '存草稿';
            if (mode==='edit') return '取消';
        },
        handleUpload() {
            document.querySelector('#upload').click();
        },
        changed() {
            this.change++;
        },
        upload(event) {
            const _this = this;
            const file = event.target.files[0];
            if (file && file.type) {
                const data = new FormData();
                data.append('file', event.target.files[0]);
                this.$serv.opUploadMp3(data).then(res => {
                    if (res && res.url) {
                        _this.formData.extInfo.voice = res.url;
                        _this.formData.extInfo.recordLength = res.recordLength;
                        _this.change++;
                    }
                });
            }
        },
        close({ id }) {
            if (this.mode !== 'view') {
                this.topicData.map(item => {
                    if (item.id === id) item.hide = false;
                });
                this.tags = this.tags.filter(item => item.id !==id);
                this.changed++;
            }
        },
        showImg(link) {
            if (link) {
                this.imgSrc = link;
                this.imgVisible = true;
            }
        },
        _initForm() {
            const _this = this;
            this.$serv.materialDetail({
                id: this.$route.query.id
            }).then(res => {
                _this.rawData = res;
                const { title, content, materialAbstract, info, geoInfo, tel, relationList, extInfo, status } = res;
                _this.formData = Object.assign(_this.formData, {
                    title, content, materialAbstract, tel, relationList, status,
                    info: JSON.parse(info),
                    geoInfo: JSON.parse(geoInfo),
                    extInfo: extInfo !== '{}' ? JSON.parse(extInfo) : { voice: undefined }
                });
                _this.initData = {
                    title, content, materialAbstract, info: JSON.parse(info)
                };
                if (relationList.length) {
                    for (const item of relationList) {
                        const { topicId } = item;
                        let added = false;
                        for (const tag of _this.tags) {
                            if (Number(tag.id) === Number(topicId)) added = true;
                        }
                        !added && _this.$serv.topicDetail({
                            id: topicId
                        }).then(res => {
                            const { title } = res;
                            _this.tags.push({
                                title,
                                id: topicId
                            });
                        });
                    }
                }
            });
        },
        onEditorChange(event) {
            this.change++;
            event.quill.deleteText(10000, 1, this.contentLength);
            if (this.formData === '') {
                this.contentLength = 0;
            } else {
                this.contentLength = event.quill.getLength() - 1;
            }
        },
        onEditorFocus(event) {
            if (this.mode === 'view') {
                this.$refs.myQuillEditor.quill.enable(false);
            }
        },
        next() {
            const { title } = this.formData;
            const { contentLength } = this;
            if (!title || !contentLength) {
                this.$notifyErr('请填写完整内容');
                return false;
            }
            if (contentLength > 10000) {
                this.$notifyErr('正文内容过长');
                return false;
            }
            if (this.titleLength > 30) {
                this.$notifyErr('标题内容过长');
                return false;
            } if (this.materialAbstractLength > 100) {
                this.$notifyErr('简介内容过长');
                return false;
            }
            this.show = 'extend';
        },
        checkForm(activeName, oldActiveName) {
            const { title } = this.formData;
            const { contentLength } = this;
            if (oldActiveName === 'basic') {
                if (!title || !contentLength) {
                    this.$notifyErr('请填写完整内容');
                    return false;
                }
                if (contentLength > 10000) {
                    this.$notifyErr('正文内容过长');
                    return false;
                }
                if (this.titleLength > 30) {
                    this.$notifyErr('标题内容过长');
                    return false;
                } if (this.materialAbstractLength > 100) {
                    this.$notifyErr('简介内容过长');
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
        searchTopic() {
            const _this = this;
            const { topic } = this.formData;
            this.$serv.searchTopic({
                projectId: this.$store.state.userInfo.projectId,
                materialId: this.$route.query.id ? this.$route.query.id : '',
                title: topic
            }).then(res => {
                _this.topicData = res.map(item => ({
                    ...item,
                    info: JSON.parse(item.info),
                    extInfo: JSON.parse(item.extInfo),
                    hide: false
                }));
            });
        },
        bindTopic(row) {
            const { title, id } = row;
            let added = false;
            for (const item of this.tags) {
                if (item.id === id) added = true;
            }
            if (!added) {
                this.tags.push({
                    title, id
                });
                this.topicData.map(item => {
                    if (item.id === id) {
                        item.hide = true;
                    }
                });
                this.changed++;
            }
        },
        submit(type) {
            const _this = this;
            // 点击左侧主按钮
            if (type === 1) {
                // 新增素材走publish
                if (this.mode === 'create') {
                    const { title, materialAbstract, info, tel, geoInfo, extInfo, content } = this.formData;
                    geoInfo.longitude = geoInfo.longitude && Number(geoInfo.longitude);
                    geoInfo.latitude = geoInfo.latitude && Number(geoInfo.latitude);
                    const param = {
                        title, materialAbstract, tel, content,
                        status: 1, // 发布有效的新素材
                        info: JSON.stringify(info),
                        geoInfo: JSON.stringify(geoInfo),
                        extInfo: JSON.stringify(extInfo),
                        projectId: this.$store.state.userInfo.projectId,
                        topicIds: this.tags.map(item => item.id)
                    };
                    if (this.tags.map(item => item.id).length === 0) delete param.topicIds;
                    this.$serv.publishMaterial(param).then(res => {
                        _this.$notifyOk('发布成功');
                        _this.$router.back(-1);
                    });
                } else if (this.mode === 'edit') { // 编辑走modify
                    const { title, materialAbstract, info, tel, geoInfo, extInfo, content } = this.formData;
                    geoInfo.longitude = geoInfo.longitude && Number(geoInfo.longitude);
                    geoInfo.latitude = geoInfo.latitude && Number(geoInfo.latitude);
                    this.$serv.editMaterial({
                        title, materialAbstract, tel, content, status: 1, // 保存非草稿素材的修改
                        id: this.$route.query.id,
                        info: JSON.stringify(info),
                        geoInfo: JSON.stringify(geoInfo),
                        extInfo: JSON.stringify(extInfo),
                        projectId: this.$store.state.userInfo.projectId,
                        topicIds: this.tags.map(item => item.id)
                    }).then(res => {
                        _this.$notifyOk('修改成功');
                        _this.$router.back(-1);
                    });
                } else if (this.mode === 'view') {
                    this.$router.back(-1);
                }
            } else if (type === 3) { // 点击右侧副按钮
                // 编辑非草稿时取消
                if (this.mode === 'edit' && this.formData.status !== 3) {
                    // 退出并不保存新建的内容
                    this.cancel();
                } else {
                    if (this.mode === 'create') {
                        const { title, materialAbstract, info, tel, geoInfo, extInfo, content } = this.formData;
                        geoInfo.longitude = geoInfo.longitude && Number(geoInfo.longitude);
                        geoInfo.latitude = geoInfo.latitude && Number(geoInfo.latitude);
                        const param = {
                            title, materialAbstract, tel, content,
                            status: 3, // 发布草稿的新素材
                            info: JSON.stringify(info),
                            geoInfo: JSON.stringify(geoInfo),
                            extInfo: JSON.stringify(extInfo),
                            projectId: this.$store.state.userInfo.projectId,
                            topicIds: this.tags.map(item => item.id)
                        };
                        if (this.tags.map(item => item.id).length === 0) delete param.topicIds;
                        this.$serv.publishMaterial(param).then(res => {
                            _this.$notifyOk('发布成功');
                            _this.$router.back(-1);
                        });
                    } else if (this.mode === 'edit') {
                        const { title, materialAbstract, info, tel, geoInfo, extInfo, content } = this.formData;
                        geoInfo.longitude = geoInfo.longitude && Number(geoInfo.longitude);
                        geoInfo.latitude = geoInfo.latitude && Number(geoInfo.latitude);
                        this.$serv.editMaterial({
                            title, materialAbstract, tel, content, status: 3, // 保存草稿素材的修改
                            id: this.$route.query.id,
                            info: JSON.stringify(info),
                            geoInfo: JSON.stringify(geoInfo),
                            extInfo: JSON.stringify(extInfo),
                            projectId: this.$store.state.userInfo.projectId,
                            topicIds: this.tags.map(item => item.id)
                        }).then(res => {
                            _this.$notifyOk('修改成功');
                            _this.$router.back(-1);
                        });
                    }
                }
            }
        }
    }
};
</script>
