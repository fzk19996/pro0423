<style lang="scss">
.btn {
    background-color: #FC634D;
    color: #fff;
    height: 40px;
    width: 120px;
    border-radius: 2px;
    position: absolute;
    top: 12px;
    right: 0;
    outline: none !important;
    border: none !important;
    font-size: 14px
}
    .short {
        display: inline-block;
    }
    .indexMenu {
        .el-form-item__content {
            margin-top: 10px;
        }
    }
    .el-tabs {
            .el-tabs__nav {
                .is-active {
                    color: #FC634D !important;
                }
                .el-tabs__item:hover {
                    color: #FC634D !important;
                }
            }
        }
        .list {
            li {
                display: flex;
                height: 44px;
            }
        }
        .preview {
            display: inline-block;
            height: 40px;
            width: 40px;
            background-size: cover;
        }
        .information {
            position: relative;
            padding: 25px 0 40px;
            font-size: 14px;
            color: #333;
        }
        .el-input {
            max-width: 360px
        }
        .uploadImg {
            display: inline-block;
            position: absolute;
            margin-left: 20px;

            div {
                font-size: 12px;
                color: #999;
                width: 145px;
                line-height: 18px;
            }
        }
        .imgPosition {
            width: 100px;
            height: 100px;
            display: inline-block;
            border: 1px solid #DCDFE6;
            border-radius: 4px;

            img {
                background-size: cover;
                width: 100%;
                height: 100%;
            }
        }
        .el-input {
            max-width: 240px !important;
        }
</style>
<template lang="pug">
    div
        el-dialog(:title="(mode==='create'?'添加':'修改')+'菜单项'" :visible.sync="formData.visible" width="440px")
            el-form.indexMenu(:model="formData" label-width="100px" style="width: 440px" :rules="rules" ref="form")
                el-form-item(label="编号：" placeholder="请输入编号" v-if="mode==='create'" prop="sourceOrder")
                    el-select(v-model="formData.sourceOrder")
                        el-option(v-for="(item, index) in items.concat([{}])" :key="index" :label="index + 1" :value="index + 1")
                el-form-item(label="菜单名称：" prop="content.name")
                    el-input(v-model="formData.content.name" :width="100" placeholder="请填写1-6字符")
                el-form-item(label="菜单图标：" style="position: relative" prop="content.icon")
                    div.imgPosition
                        img(v-if="!formData.content.icon" :src="defaultImg")
                        a(:href="formData.content.icon" v-if="formData.content.icon" target="_blank")
                            img(:src="formData.content.icon" v-if="formData.content.icon")
                    div.uploadImg
                        div 请上传图片，仅支持JPEG,JPG,GIF与PNG,大小不超过2.5M(100px*100px)
                        el-button(@click="handleUploadCrop" size="small") 上传并裁剪图片
                el-form-item(label="链接：" prop="content.link")
                    el-input(v-model="formData.content.link" placeholder="请填写1-200字符")
                div.info(style="margin-left: 100px;margin-bottom: 20px") 请填写1-200个字符（当前输入{{formData.content.link ? formData.content.link.length : 0}}个字符)
            div(style="text-align: center")
                el-button(type="primary" @click="submitForm") 提交
                el-button(@click="formData.visible=false") 取消
            crop-image(
                :visible.sync="imgCrop.visible"
                :dialogData.sync="imgCrop.data"
                @cropDone="handleCropDone"
            )
        p.information
            span.iconExplain
            span 设置视觉统一而具有吸引力的菜单，帮助用户查看更多信息。
            span.info 下列内容可以通过拖拽进行排序操作
            button.btn(@click="addItem()" v-if="items.length<40") 添加菜单项
        el-table(:data="items" border)
            el-table-column(label="序号" align="center")
                template(slot-scope="scope")
                    p {{scope.$index + 1}}
            el-table-column(label="菜单名称" prop="content.name" align="center")
            el-table-column(label="菜单图标" align="center")
                template(slot-scope="scope")
                    a(:href="scope.row.content.icon" target="_blank")
                        img(:src="scope.row.content.icon").preview
            el-table-column(label="跳转链接" align="center")
                template(slot-scope="scope")
                    a.short(
                        href="javascript:void(0);"
                        @click="copy(scope.row.content.link)"
                        v-if="scope.row.content.link.length <= 10") {{scope.row.content.link}}
                    el-popover(
                        v-if="scope.row.content.link.length > 10"
                        width="180"
                        placement="top"
                        trigger="hover"
                        :content="scope.row.content.link")
                        a.short(
                            slot="reference"
                            href="javascript:void(0);"
                            @click="copy(scope.row.content.link)") {{scope.row.content.link}}
            el-table-column(label="操作" align="center")
                template(slot-scope="scope")
                    el-button(size="mini" @click="handleEdit(scope.row.id)") 修改
                    el-button(size="mini" type="danger" @click="deleteItem(scope.row.content.name, scope.row.id)") 删除
</template>
<script>

import Sortable from 'sortablejs';

import { MessageBox } from 'element-ui';

import CropImage from 'com/CropImage.vue';

import {
    DefaultPhotoDomain,
    DefaultPhoto220x165
} from 'conf/domain';

const initFormData = {
    visible: false,
    sourceOrder: '',
    projectId: '',
    id: '',
    content: {
        name: '',
        icon: '',
        link: ''
    },
    lastUpdateTime: ''
};

export default {
    data() {
        function getStringWidth(val) {
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
        }
        function validLength(rule, value, cb) {
            if (!value) {
                cb(new Error('请输入标题'));
            } else {
                const length = getStringWidth(value);
                if (length > 6 || length < 1) {
                    cb(new Error('字数在1-6之间'));
                }
                cb();
            }
        }
        return {
            defaultImg: `${DefaultPhotoDomain}${DefaultPhoto220x165}`,
            projectId: '',
            formData: initFormData,
            mode: 'create',
            rules: {
                sourceOrder: [{ required: true, trigger: 'blur', message: '请选择顺序' }],
                'content.name': [{ required: true, trigger: 'blur', message: '标题为必填项' }, { validator: validLength, trigger: 'blur' }],
                'content.link': [
                    { required: true, pattern: /^\/?pages|^http/, trigger: 'blur', message: '链接开头需要为"(/)pages"或"http(s)"' },
                    { min: 1, max: 200, trigger: 'blur', message: '字数在1-200之间' }],
                'content.icon': [{ required: true, trigger: 'blur', message: '请选择图片' }]
            },
            imgCrop: {
                visible: false,
                data: {
                    index: 0,
                    width: 100,
                    height: 100,
                    type: '',
                    img: ''
                }
            },
            isConfirmCrop: false,
            items: []
        };
    },
    components: {
        CropImage
    },
    computed: {
    },
    methods: {
        copy(txt) {
            const input = document.createElement('input');
            input.value = txt;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            this.$notifyOk(`链接已经复制到粘贴板`);
        },
        submitForm() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    const _this = this;
                    if (this.mode === 'create') {
                        this.$serv.insertMenu({
                            projectId: this.projectId,
                            content: JSON.stringify(this.formData.content),
                            sourceOrder: this.formData.sourceOrder - 1
                        }).then(res=>{
                            _this._getSearchData();
                            _this.$notifyOk('添加完成');
                            _this.formData.visible = false;
                            _this._getSearchData();
                            _this._resetForm();
                        });
                    } else if (this.mode === 'update') {
                        const { id, projectId, content, sourceOrder, lastUpdateTime } = this.formData;
                        this.$serv.updateMenu({
                            id, projectId, content: JSON.stringify(content), sourceOrder, lastUpdateTime
                        }).then(res=>{
                            _this._getSearchData();
                            _this.$notifyOk('修改完成');
                            _this.formData.visible = false;
                            _this._getSearchData();
                            _this._resetForm();
                        });
                    }
                } else {
                    this.$notifyErr('请检查表单项是否合法');
                }
            });
        },
        _resetForm() {
            Object.assign(this.formData, this.$options.data().formData);
            this.isClickImport = false;
            this.isConfirmCrop = false;
        },
        handleUploadCrop() {
            this.imgCrop.visible = true;
            this.imgCrop.data.img = this.formData.content.icon;
        },
        handleCropDone(payload) {
            this.formData.content.icon = payload.url;
            this.isConfirmCrop = true;
        },
        handleEdit(id) {
            this.mode = 'update';
            this.formData.projectId = this.projectId;
            this.formData.id = id;
            this.$serv.homeMenuDetail({
                projectId: this.projectId,
                menuId: id
            }).then(res=>{
                this.formData.lastUpdateTime = res.lastUpdateTime;
                this.formData.sourceOrder = res.sourceOrder;
                this.formData.content = res.content;
                this._getSearchData();
            });
            this.formData.visible = true;
        },
        addItem() {
            this.mode = 'create';
            this.formData = {
                visible: true,
                sourceOrder: this.items.length + 1,
                projectId: '',
                id: '',
                content: {
                    name: '',
                    icon: '',
                    link: ''
                },
                lastUpdateTime: ''
            };
        },
        deleteItem(item, id) {
            MessageBox.confirm(`确定要删除【${item}】吗？删除后，用户将无法看到此项菜单`, '删除菜单项', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                cancelButtonClass: 'cancelBtn',
                confirmButtonClass: 'confirmBtn'
            }).then(() => {
                this.$serv.deleteMenu({
                    projectId: this.projectId,
                    id: id
                }).then(res=>{
                    this.$notifyOk('删除成功');
                    this._getSearchData();
                    this._resetForm();
                }).catch(e=>{
                    this.$$notifyErr('删除失败');
                });
            }).catch(() => {
                this.$notifyOk('已取消删除');
            });
        },
        _getSearchData() {
            this.$serv.homeMenuList({
                projectId: this.projectId
            }).then(res => {
                this.items = res;
            });
        },
        _initSortable() {
            const _this = this;
            const $ul = document.querySelector('tbody');
            new Sortable($ul, {
                onUpdate: e=> {
                    const { newIndex, oldIndex } = e;
                    const $li = $ul.children[newIndex];
                    const $oldLi = $ul.children[oldIndex];
                    $ul.removeChild($li);
                    if (newIndex > oldIndex) {
                        $ul.insertBefore($li, $oldLi);
                    } else {
                        $ul.insertBefore($li, $oldLi.nextSibling);
                    }
                    const item = _this.items.splice(oldIndex, 1);
                    _this.items.splice(newIndex, 0, item[0]);
                    const  orderList= _this.items.map((item, index) => {
                        const { id, lastUpdateTime } = item;
                        return {
                            id,
                            sourceOrder: index,
                            lastUpdateTime
                        };
                    });
                    _this.$serv.updateMenuOrder({
                        projectId: _this.$store.state.userInfo.projectId,
                        orderList
                    }).then(res=>{
                        if (!res) _this._getSearchData();
                        _this.$notifyOk('顺序更新完成');
                    }).catch(e=>{
                        this.$notifyErr(e.msg);
                    });
                },
                animation: 300
            });
        }
    },
    mounted() {
        this.projectId = this.$store.state.userInfo.projectId;
        this._initSortable();
        this._getSearchData();
    }
};

</script>
