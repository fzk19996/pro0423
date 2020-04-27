<style lang="scss">
.breadcrumb {
  padding: 40px 0;
  font-size: 14px;
  a {
    cursor: pointer;
  }
  .btn {
    background-color: #fc634d;
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
  color: #fc634d !important;
  border-color: #fc634d !important;
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
  border-top: 1px solid #d5d5d5;

  button:first-child {
    margin-left: 20px;
  }
}
</style>
<style lang="scss" scope>
.imgPreview {
  width: 160px !important;
  height: 120px !important;
  border: 1px solid #dcdfe6;
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
            a(style="color: #333" @click="back") 推广管理
            span >
            a(style="color: #999") {{mode === 'create' ? '新建推广' : '查看推广'}}
        el-dialog(:visible.sync="imgVisible" width="280px" :modal="false" style="text-align: center" top="25vh")
                    img(:src="imgLink" v-if="imgLink" style="width: 160px; height: 160px; margin: 0 auto")
        el-tabs(v-model="show" type="card" :before-leave="checkForm")
            //- 专题基础信息
            el-tab-pane(label="推广信息基础" name="basic" style="margin-top: 15px")
                el-form(:model="formData" label-width="100px" style="margin-top: 15px" :rules="rules" ref="form")
                    el-form-item(label="推广位： " prop="recom")
                        el-select.tuiguangwei(v-model.trim="formData.info.recom" style = "max-width:160px")
                            el-option(v-for = "item in recommend" :key = "")
                    el-form-item(label="展示周期：" prop="date")
                        el-date-picker(type="dates" v-model.trim="formData.info.date" placeholder="选择一个或多个日期" style = "max-width:240px")
                        //- el-input(v-model.trim="formData.topicAbstract" type="textarea" :rows="3")
                        //- div.info 专题简介会用于介绍区、分享副标题等展示，请填写1-100字，当前输入{{topicAbstractLength}}字
                    el-form-item(label="链   接：" prop="links")
                        el-input(v-model.trim = "formData.info.links" placeholder="请输入链接" type="text" style="max-width: 500px !important;")
                        span.info   {{linksLength}}/200                    
                    el-form-item(label="封面图："  prop="info.cover_image")
                        div.suoluetu(style = "margin-top:10px; height:120px")
                            div.imgPreview
                                img(v-if="!formData.info.cover_image" :src="defaultImg" )
                                a(v-if="formData.info.cover_image" :href="formData.info.cover_image" target="_blank")
                                    img(:src="formData.info.cover_image")
                            div(style="position: relative; margin-left: 150px; top: -108px")
                                div(style="width: 320px; line-heigt: 18px").info 请上传图片，仅支持JPEG、JPG、GIF和PNG，大小不超过2.5M。（750px*375px）
                                el-button(@click="handleUploadCrop" size="mini" style="margin-top:41px") 上传并裁剪图片
                    el-form-item(label="")
                        el-button(type="primary" @click="Materialext" v-if ="mode=='create'") 确定
                        el-button(@click="cancelAddMaterial" v-if ="mode=='create'") 取消
                        el-button(@click="back" v-if ="mode=='check'") 返回
                crop-image.wide(
                    :visible.sync="imgCrop.visible"
                    :dialogData.sync="imgCrop.data"
                    @cropDone="handleCropDone"
                )
</template>
<script>
import CropImage from 'com/CropImage.vue';
import { MessageBox } from 'element-ui';

import { DefaultPhotoDomain, DefaultPhoto220x165 } from 'conf/domain';

export default {
    data() {
        return {
            date: '',
            mode: '',
            show: 'basic',
            defaultImg: `${DefaultPhotoDomain}${DefaultPhoto220x165}`,
            formData: {
                status: 1,
                recom: '',
                date: '',
                info: {
                    recom: '',
                    date: '',
                    links: '',
                    cover_image: ''
                },
                autoBind: '0'
            },
            recommend:['推广位1','推广位2'],
            materialRule: {
                // id: [{ required: true, message: '请输入素材id', trigger: 'blur' }]
            },
            rules: {
                recom: [{ required: true, message: '请选择推广位', trigger: 'blur' }],
                date: [
                    { required: true, message: ' ', trigger: 'blur' }
                ],
                links: [{ required: true, message: '请输入链接', trigger: 'blur' }],
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
                this.$serv
                    .relationGenerate({
                        projectId: this.$store.state.userInfo.projectId
                    })
                    .then(res => {
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
            if (relatedData.length)
                return relatedData.filter(item => item.status !== 0);
            return [];
        },
        linksLength() {
            const { links } = this.formData;
            if (!links) return 0;
            else return this.getStringWidth(links);
        },
        titleLength() {
            const { title } = this.formData;
            if (!title) return 0;
            else return this.getStringWidth(title);
        }
    },
    activated() {
        this.mode = this.$route.params.mode;
        const row_tmp = this.$route.params.row;
        console.log(row_tmp.description);
        if (this.mode=='check'){
            this.formData.info.links = row_tmp.description;
            this.formData.info.recom = row_tmp.updateTime;
            this.formData.info.date = row_tmp.name;
            this.formData.info.cover_image = row_tmp.status;
        }
    },
    updated() {},
    methods: {
        back() {
            this.formData.info.links = '';
            this.formData.info.recom = '';
            this.formData.info.date = '';
            this.formData.info.cover_image = '';
            this.$router.back(-1);
        },
        checkForm(){

        },
        handleUploadCrop() {
            this.imgCrop.visible = true;
            this.imgCrop.data.img = this.formData.info.cover_image;
        },
        handleCropDone(payload) {
            this.formData.info.cover_image = payload.url;
            this.isConfirmCrop = true;
        },
        Materialext(){
            console.log('保存');
        },
        cancelAddMaterial() {
            if(this.formData.info.links!=''
                ||this.formData.info.recom!=''
                ||this.formData.info.date!=''
                ||this.formData.info.cover_image!='')
            {
                MessageBox.confirm(`确定取消？取消后，内容将无法找回。`, '取消创建', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn'
                }).then(() => {
                    this.back();
                }).catch(() => {
                    
                });   
            }
        }
    }
};
</script>
