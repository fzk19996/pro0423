<template lang="pug">
  el-dialog.c__dialog-wrap.c__dialog-wrap-65(
    :title="title"
    :visible.sync="curVisible"
    @open="handleOpen"
    :show-close="false"
    @close="handleClose"
    )
    section.dialog-content(v-loading="dialogLoading")
      el-dialog.img-dialog(
        :title="`${curType === typeMap.image ? '裁剪图片' : '上传'}`"
        :visible.sync="cropOption.show"
        append-to-body
        :show-close="false"
        @close="handleCropClose"
        )
        section.cropper-wrap(:style="{height: `${cropOption.autoCropHeight + 40}px`,width: `${cropOption.autoCropWidth + 40}px`}")
          vue-cropper(
            v-show="curType === typeMap.image"
            ref="cropper"
            :auto-crop="cropOption.autoCrop"
            :auto-crop-width="cropOption.autoCropWidth"
            :auto-crop-height="cropOption.autoCropHeight"
            :fixed-box="cropOption.fixedBox"
            :center-box="cropOption.centerBox"
            :full="cropOption.full"
            :high="cropOption.high"
            :img="`${cropOption.img}`"
            :output-size="cropOption.outputSize"
            :output-type="cropOption.outputType"
            :canMove="cropOption.canMove"
            :canMoveBox="cropOption.canMoveBox"
            :canScale="cropOption.canScale"
          )
          <!-- gif -->
          el-tooltip(v-show="curType === typeMap.gif" placement="top" :content="`${cropOption.autoCropWidth}x${cropOption.autoCropHeight}`")
            img(:src="notCropOption.gifSrc")

        <!-- image tip -->
        template(v-if="curType === typeMap.image && !!cropOption.img")
          p(v-show="cropOption.isDirectConfirm || cropOption.isReUploadAndNotMod" class="cropper-wrap__tip-red") 当前图片尺寸与规定尺寸一致。
          p(v-show="!cropOption.isDirectConfirm && !cropOption.isReUploadAndNotMod" class="cropper-wrap__tip-red") 当前图片尺寸与规定尺寸不一致，请拖拽裁剪！
        <!-- gif tip -->
        template(v-if="curType === typeMap.gif && !notCropOption.gifSrc")
          p.cropper-wrap__tip-red 请重新选择尺寸为{{cropOption.autoCropWidth}}x{{cropOption.autoCropHeight}}的创意
        section.cropper-menu(slot="footer")
          section.cropper-menu__reload
            label(class="el-button el-button--primary el-button--small cropper-menu__reload-btn" for="uploads") {{cropOption.img ? '重新上传' : '上传图片'}}
             <!-- accept="image/png, image/jpeg, image/gif, image/jpg, video/mp4" -->
            input(type="file" id="uploads"
              style="position:absolute; clip:rect(0 0 0 0);"
              accept="image/png, image/jpeg, image/gif, image/jpg"
              @change="uploadImg($event)")
          el-button(
            type="primary"
            size="small"
            :isloading="cropOption.isCropping"
            @click="handleCropConfirm"
            class="cropper-menu__btn") {{ cropOption.isCropping ? `${curType === typeMap.image ? '裁剪中' : '上传中'}` : `${curType === typeMap.image ? '确定裁剪' : '确定上传'}` }}
          el-button(size="small" @click="handleCropCancel") 取消

      section.dialog-content__update
        //- el-row
        //-   el-col(:span="8")
        //-     p.dialog-content__update-desc 内容更新
        //-   el-col(:span="8")
        //-     p.dialog-content__update-desc 运营位ID：{{ formData.posId }}
        //-   el-col(:span="8")
        //-     p.dialog-content__update-desc 运营位类型：{{ formData.posType | mapTypeToName }}

        section.update-content
          el-form(
            :model="formData"
            ref="popUpdateForm"
            :validate-on-rule-change="true"
            label-position="right"
            size="small"
            class="c__form c__form-item-dialog")
            <!-- 链接 -->
            template(v-if="formData.link.length > 0")
              div(v-for="(item, index) in formData.link" :key="`${ index + 400 }`")
                p.global-required.global-b {{ `${item.name}：` }}
                el-form-item(
                  :prop="`link.${index}.content`"
                  :rules="[{ required: true, message: '请输入链接', trigger: 'blur' },{ validator: validateUrl, message: '请输入正确的url地址', trigger: 'blur' },{ min: 1, max: 200, message: `长度在 1 到 200 个字符`, trigger: 'blur' }]")
                  el-input.c__form-item.c__form-select__w300(v-model.trim="item.content" placeholder="请输入链接")
                  el-button(type="primary" size="small" @click="handleLinkSkip(item, index)") 跳转预览
                  p.global-form-item_tip 请填写1-200个字符（当前输入{{ item.content.length }}个字符）

              p
            <!-- 图片 -->
            template(v-if="formData.img.length > 0")
              div(v-for="(item, index) in formData.img" :key="index")
                p(class="global-required global-b") {{ `${item.name}：` }}
                el-form-item(
                  class="c__form-item__update"
                  :prop="`img.${index}.content`"
                  required
                  :rules="[{ required: true, message: '请上传并裁剪图片', trigger: 'blur' }]")
                  a(:href="item.content ? item.content : 'javascript:;'" target="_blank" class="upload-image__href")
                    img(
                      class="upload-image__cur"
                      :src="replaceImg(item)"
                      :alt="item.name")
                  span.c__form-item__update-wrap
                    p 请上传图片，仅支持JPEG,JPG,GIF与PNG,大小不超过2.5M。({{ item.width }}px * {{ item.height }}px)
                        span.global-color-red(v-if="isClickImport") 请重新裁剪图片
                    el-button(
                      class="c__form-button"
                      type="primary"
                      size="small"
                      @click="handleUploadCrop(item, index)") 上传并裁剪图片

            <!-- 文案 -->
            template(v-if="formData.input.length > 0")
              div(v-for="(item, index) in formData.input" :key="`${ index + 200 }`")
                p(:class="['global-b', {'global-required': +item.min_size > 0}]") {{ `${item.name}：` }}
                el-form-item(
                  :prop="`input.${index}.content`"
                  :rules="+item.min_size > 0 ? [{ required: true, message: '请输入文案', trigger: 'blur' },{ validator: validateFullLengthRange, min: +item.min_size, max: +item.max_size, message: `长度在 ${item.min_size} 到 ${item.max_size} 个字符`, trigger: 'blur' },] : [{ validator: validateFullLengthRange, min: +item.min_size, max: +item.max_size, message: `长度在 ${item.min_size} 到 ${item.max_size} 个字符`, trigger: 'blur' }]")
                  el-input(
                    class="c__form-item c__form-select__w300"
                    v-model.trim="item.content"
                    :placeholder="`请输入文案`")
                  p.global-form-item_tip 请填写{{ item.min_size }}-{{ item.max_size }}个字（当前输入{{ getFullLength(item.content) }}个字）

      <!-- 清除弹框 -->
      pop-clear(:clearDialog="clearDialog" @confirmClear="confirmClearCb")
    div(slot="footer" class="dialog-footer")
      el-button(
        v-if="formData.clearEnable"
        type="primary"
        size="small"
        class="c__form-button"
        :disabled="buttonDisabled"
        :loading="buttonLoading"
        @click="handleClear"
        ) {{ buttonLoading ? '清除中' : '清 除' }}
      el-button(
        type="primary"
        size="small"
        class="c__form-button"
        :disabled="buttonDisabled"
        :loading="buttonLoading"
        @click="handleConfirm('popUpdateForm')"
        ) {{ buttonLoading ? '修改中' : '确 定' }}
      el-button(class="c__form-button c__form-button-w68" size="small" @click="handleCancel('popUpdateForm')") 取 消

</template>

<script>
/**
 * @tip `crop`应逻辑拆分出去`admin-ad-refactor/src/components/seniorComponents/CropImage`
 *      随意吧：）
 */
import { VueCropper } from 'vue-cropper';

import {
    ImgDomain,
    DefaultPhotoDomain,
    DefaultPhoto220x165
} from 'conf/domain';

import {
    posTypeEnum
} from 'conf/enum';

import PopClear from './PopClear';

import Validate from 'lib/validate';

export default {
    props: ['visible', 'posId'],
    data() {
        return {
            title: '焦点首页全屏',
            curType: 'image', // 当前正在操作的资源类型
            typeMap: {
                image: 'image',
                gif: 'gif',
                video: 'video'
            },
            curVisible: this.visible,
            formData: {
                autoUpdateEnable: true, // 是否开启自动更新
                img: [],
                updateRuleMain: [],
                link: [],
                autoSynEnable: true,  // 是否开启自动同步
                autoSynEnableOld: true,
                posType: '',
                clearEnable: false, // 是否可清除
                posId: '',
                input: [],
                cityName: '',
                freshExist: false, // 是否存在更新规则
                updateRuleVice: [],
                synExist: false, // 是否存在同步规则
                // more
                updateRate: '' // 更新频率
            },
            // 控制裁剪
            cropOption: {
                show: false,
                index: 0, // 记录当前正在操作的第几张图片
                isCropping: false, // 正在裁剪
                autoCrop: true, // 默认生成截图框
                autoCropWidth: 200, // 截图框宽度
                autoCropHeight: 200, // 截图框高度
                fixedBox: true, // 截图框大小不能改变
                centerBox: false, // 截图框限制在图片内
                full: false, // 输出原图比例的截图
                high: true, // 按照设备的dpr输出等比例图片
                img: null, // 裁剪图片的地址
                outputSize: 1, // 裁剪生成图片的质量
                outputType: 'jpeg', // 裁剪生成图片的格式
                fileName: 'image.jpeg', // 裁剪后图片的name
                canMove: true, // 是否可以移动图片
                canScale: true, // 是否允许滚轮缩放
                canMoveBox: true, // 是否能拖动截图框
                isReUploadAndNotMod: false, // 在有图片的情况下点击上传并裁剪图片，到裁剪弹框没重新上传
                isDirectConfirm: false, // 图片大小刚好满足则不能缩放拖拽 直接上传图片
                directConfirmFile: '' // 原图文件
            },
            notCropOption: {
                file: '', // 原资源文件
                gifSrc: '', // 控制gif
                videoSrc: '' // 控制视频
            },
            clearDialog: {
                visible: false,
                appendToBody: true,
                buttonLoading: false,
                data: {
                    title: '清除运营位',
                    posName: '',
                    posId: ''
                }
            },
            validateUrl: Validate.validateUrl,
            validateFullLengthRange: Validate.validateFullLengthRange,
            imageDomain: ImgDomain,
            defaultPhotoDomain: DefaultPhotoDomain,
            defaultPhoto220x165: DefaultPhoto220x165,
            buttonLoading: false,
            buttonDisabled: false,
            dialogLoading: false,
            isClickImport: false, // 快捷导入
            getFullLength(str) {
                // if (!isString(str)) return 0
                str = String(str);
                if (str.trim() === '') return 0;
                return str.split('').reduce((sum, current) => {
                    return sum + (current.charCodeAt(0) > 255 || current.charCodeAt(0) === 215 ? 1 : 0.5);
                }, 0);
            },
            isConfirmCrop: false // 是否有裁剪成功过
            // new
        };
    },
    watch: {
        visible(newV) {
            this.curVisible = newV;
        }
    },
    components: {
        VueCropper,
        PopClear
    },
    methods: {
        _isConfirmType(type) {
            return /(gif|jpg|jpeg|png)$/i.test(type);
        },
        _isConformSize(size, max = 2.5) {
            return size < max * 1024 * 1024;
        },
        _isGifType(type) { // 是否为gif
            return /(gif)$/i.test(type);
        },
        _isVideoType(type) { // 是否为视频
            return /(mp4|flv)$/i.test(type);
        },
        _judgePic(file, width, height) {
            return new Promise(resolve => {
                try {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = theFile => {
                        const img = new Image();
                        img.src = theFile.target.result;
                        img.onload = _ => {
                            if (img.width === width && img.height === height) {
                                resolve({ isConfirmWH: true, fileSrc: theFile.target.result });
                                return;
                            }
                            resolve({ isConfirmWH: false, fileSrc: theFile.target.result });
                        };
                        img.onerror = err => {
                            resolve(false);
                            console.error(err);
                        };
                    };
                } catch (e) {
                    resolve(false);
                    console.error(e);
                }
            });
        },

        // 处理gif 宽高符合则上传， 否则重新选择
        _dealGif(file, event) {
            const _self = this;
            this._judgePic(file, this.cropOption.autoCropWidth, this.cropOption.autoCropHeight)
                .then(({ isConfirmWH, fileSrc }) => {
                    // _self.notCropOption.gifSrc = fileSrc // local mock 待删
                    // _self.notCropOption.file = file // local mock 待删
                    if (isConfirmWH) {
                        _self.notCropOption.gifSrc = fileSrc;
                        _self.notCropOption.file = file;
                    } else {
                        this.$notifyErr(
                            `尺寸不符合，请重新选择尺寸为${this.cropOption.autoCropWidth}x${this.cropOption.autoCropHeight}的gif图`);
                        // 类型改为image
                        this.curType = this.typeMap.image;
                    }
                    event.target.value = '';
                });
        },
        uploadImg(event) {
            const file = event.target.files[0];
            if (!file) {
                this.$notifyErr('请选择图片');
                return false;
            }

            /**
       * 处理gif
       */
            if (this._isGifType(file.type)) {
                this.notCropOption.videoSrc = '';
                if (!this._isConformSize(file.size)) { // 大小判断
                    this.$notifyErr('图片大小不能超过2.5M' );
                    return false;
                }
                this.curType = this.typeMap.gif;
                this._dealGif(file, event);
                return false;
            }

            /**
       * 处理图片
       */
            this.notCropOption.gifSrc = '';
            this.notCropOption.videoSrc = '';
            if (!this._isConfirmType(file.type)) { // 类型判断
                this.$notifyErr('图片类型必须是.gif,jpeg,jpg,png中的一种');
                event.target.value = '';
                return false;
            }
            if (!this._isConformSize(file.size)) { // 大小判断
                this.$notifyErr('图片大小不能超过2.5M' );
                event.target.value = '';
                return false;
            }
            // 矫正文件名和类型
            this.curType = this.typeMap.image;
            this.cropOption.fileName = file.name || 'image.jpeg';
            this.cropOption.outputType = file.type ? file.type.split('/')[1] : 'jpeg';

            this._judgePic(file, this.cropOption.autoCropWidth, this.cropOption.autoCropHeight)
                .then(({ isConfirmWH }) => {
                    if (isConfirmWH) { // 符合宽高 直接上传原图
                        this.cropOption.isDirectConfirm = true;
                        this.cropOption.directConfirmFile = file;
                        this.cropOption.canMove = false;
                        this.cropOption.autoCrop = true;
                        this.cropOption.canMoveBox = false;
                        this.cropOption.canScale = false;
                    } else { // 否则走裁剪
                        this.cropOption.isDirectConfirm = false;
                        this.cropOption.directConfirmFile = '';
                        this.cropOption.canMove = true;
                        this.cropOption.autoCrop = true;
                        this.cropOption.canMoveBox = true;
                        this.cropOption.canScale = true;
                    }
                    const reader = new FileReader();
                    reader.onload = e => {
                        let tmpData;
                        if (typeof e.target.result === 'object') {
                            // 把Array Buffer转化为blob 如果是base64不需要
                            tmpData = window.URL.createObjectURL(new Blob([e.target.result]));
                        } else {
                            tmpData = e.target.result;
                        }
                        event.target.value = '';
                        this.cropOption.img = tmpData;
                        this.cropOption.isReUploadAndNotMod = false;
                    };
                    // reader.readAsDataURL(file) // 转化为base64
                    reader.readAsArrayBuffer(file); // 转化为blob
                });
        },

        handleCropConfirm() {
            switch (this.curType) {
                case this.typeMap.image: // 上传图片
                    if (!this.cropOption.img) {
                        this.$notify.warning({
                            title: '提示',
                            message: '请上传图片',
                            duration: 2000
                        });
                        return;
                    }
                    this.cropOption.isCropping = true;
                    if (this.cropOption.isReUploadAndNotMod) {
                        this._resetCropData();
                        this.cropOption.show = false;
                        this.cropOption.isCropping = false;
                        this.isConfirmCrop = true;
                        return;
                    }
                    if (this.cropOption.isDirectConfirm) { // 直接上传原图
                        const resData = new FormData();
                        resData.append('image', this.cropOption.directConfirmFile);
                        resData.append('width', this.cropOption.autoCropWidth);
                        resData.append('height', this.cropOption.autoCropHeight);
                        this._uploadPic(resData);
                    } else { // 按裁剪后上传
                        this.$refs.cropper.getCropBlob(data => {
                            // 返回的图片为blob 需转为file
                            const img = new window.File([data], this.cropOption.fileName);
                            // console.log(img, img.size)
                            const resData = new FormData();
                            resData.append('image', img);
                            resData.append('width', this.cropOption.autoCropWidth);
                            resData.append('height', this.cropOption.autoCropHeight);
                            this._uploadPic(resData);
                        });
                    }
                    break;
                case this.typeMap.gif: // 上传gif
                    if (this.notCropOption.file === '' && this.notCropOption.gifSrc !== '') { // 回填时没做修改
                        this.cropOption.isCropping = false;
                        this.isConfirmCrop = true;
                        this.handleCropCancel();
                    } else if (this.notCropOption.file === '') {
                        this.$notifyErr(`请上传素材`);
                    } else {
                        this.cropOption.isCropping = true;
                        const resData = new FormData();
                        resData.append('image', this.notCropOption.file);
                        resData.append('width', this.cropOption.autoCropWidth);
                        resData.append('height', this.cropOption.autoCropHeight);
                        this._uploadPic(resData);
                    }
                    break;

            }
        },
        _uploadPic(data) {
            // 上传裁剪后的图片
            this.$serv.opUpdatePic(data)
                .then(res => {
                    this.formData.img[this.cropOption.index].content = res.url;
                    this._resetCropData();
                    this.cropOption.show = false;
                    this.cropOption.isCropping = false;
                    this.isConfirmCrop = true;
                });
        },
        _resetForm() {
            Object.assign(this.formData, this.$options.data().formData);
            this.isClickImport = false;
            this.isConfirmCrop = false;
        },
        _reactiveFormData(res, behavior) {
            // #1121 make `img/input/link` list reactive
            //       and map `res` to `formData`
            //  note: `import` need to fill back
            this.formData.img = res.img ? res.img.map((item, index) => {
                return {
                    name: item.name ? item.name : '',
                    height: item.height ? item.height : 0,
                    width: item.width ? item.width : 0,
                    // content: behavior === 'import' ? item.content : ''
                    content: item.content ? item.content : ''
                };
            }) : [];
            this.formData.input = res.input ? res.input.map((item, index) => {
                return {
                    name: item.name ? item.name : '',
                    max_size: item.max_size ? item.max_size : 0,
                    min_size: item.min_size ? item.min_size : 0,
                    // content: behavior === 'import' ? String(item.content) : ''
                    content: item.content ? item.content : ''
                };
            }) : [];
            this.formData.link = res.link ? res.link.map(item => {
                return {
                    name: item.name ? item.name : '',
                    // content: behavior === 'import' ? item.content : ''
                    content: item.content ? item.content : ''
                };
            }) : [];
        },

        async handleOpen() {
            this.$serv.opDetail({
                posId: this.posId
            }).then(res => {
                this.title = res.name;
                try {
                    const temp = JSON.parse(res.content);
                    temp.clearEnable = res.clearEnable;
                    this.formData = temp;
                    this._reactiveFormData(temp, 'open');
                } catch(err) {
                    console.log(err);
                }
            }).catch(err => {
                console.log(err);
            });
        },

        handleClose() {
            this._resetForm();
            this._resetCropData();
            this.$emit('update:visible', false);
        },

        _submitFormTmp() {
            const expectData = {
                posId: this.posId,
                content: JSON.stringify(this.formData)
            };
            return new Promise((resolve, reject) => {
                this.$serv.opUpdate(expectData).then(
                    res => {
                        this.$notifyOk('修改成功');
                        resolve(res);
                    });
            });
        },
        async _submitForm(formName) {
            this.buttonLoading = true;
            await this._submitFormTmp();
            this.buttonLoading = false;
            this.$emit('update:visible', false);
            this._resetForm();
            this.$refs[formName].clearValidate();
            this.$emit('confirmCb');
        },
        handleClear() {
            this.clearDialog.visible = true;
            // this.clearDialog.data.posId = this.formData.posId;
            this.clearDialog.data.posId = this.posId;
            this.clearDialog.data.posName = this.title;
        },
        confirmClearCb(dialogData) {
            this.handleOpen();
        },
        handleConfirm(formName) {
            this.$refs[formName].validate(valid => {
                if (!valid) {
                    this.$notifyErr('请检查表单各项' );
                    return false;
                } else {
                    if (this.formData.img.length > 0 && !this.isConfirmCrop) { // 快捷导入时 如果有图片需要重新裁剪
                        this.$notifyErr('请重新裁剪图片');
                        return false;
                    } else {
                        this._submitForm(formName);
                    }
                }
            });
        },
        handleCancel(formName) {
            this._resetForm();
            this.$refs[formName].clearValidate();
            this.$emit('update:visible', false);
        },
        handleUploadCrop(item, index) {
            this.cropOption.index = index;
            this.cropOption.autoCropWidth = +item.width;
            this.cropOption.autoCropHeight = +item.height;
            if (this._isGifType(item.content)) { // 区分gif和普通图片
                this.curType = this.typeMap.gif;
                this.notCropOption.gifSrc = item.content;
            } else {
                this.curType = this.typeMap.image;
                // this.cropOption.img = item.content === '' ? null : item.content
                if (!item.content) {
                    this.cropOption.img = null;
                    this.cropOption.autoCrop = false;
                    this.cropOption.isReUploadAndNotMod = false;
                    this.cropOption.canMove = true;
                    this.cropOption.canMoveBox = true;
                    this.cropOption.canScale = true;
                } else {
                    this.cropOption.img = item.content;
                    this.cropOption.autoCrop = true;
                    this.cropOption.isReUploadAndNotMod = true;
                    this.cropOption.canMove = false;
                    this.cropOption.canMoveBox = false;
                    this.cropOption.canScale = false;
                }
            }
            this.cropOption.show = true;
        },
        _resetCropData() {
            this.curType = this.typeMap.image; // 重置为裁剪图片模式
            // #1129 vue-cropper组件只在img为非''才会重新渲染
            this.cropOption.img = null;
            // this.cropOption.autoCropWidth = 200
            // this.cropOption.autoCropHeight = 200
            this.cropOption.isGif = false;
        },

        handleLinkSkip(item, index) {
            this.$refs['popUpdateForm'].validateField(`link.${index}.content`);
            if (item.content === '' || !Validate.isUrl(item.content)) return;
            window.open(item.content);
        },
        handleCropClose() {
            this._resetCropData();
            this.cropOption.show = false;
        },
        handleCropCancel() {
            this._resetCropData();
            this.cropOption.show = false;
        },
        replaceImg(item) {
            return item.content ? `${item.content.replace(/(focus-img.cn\/(sh(\d{1,})x(\d{1,}sh)\/)?)/, 'focus-img.cn/sh200x150sh/')}` : `${this.defaultPhotoDomain}${this.defaultPhoto220x165}`;
        }
    },
    filters: {
        mapTypeToName(val) {
            return posTypeEnum[val];
        }
    }
};
</script>

<style lang="css">
.c__form-item__update .el-form-item__content {
  display: flex;
}

.c__form-item__update .el-form-item__content .c__form-item__update-wrap {
  display: inline-block;
}

.c__dialog-cur__clear {
  /* padding-left: 100px; */
}

.c__form-item.c__form-select__w300 {
    width: 450px;
    margin-right: 20px;
}

.img-dialog .el-dialog {
    min-width: 800px;
}
</style>

<style lang="scss" scoped>
.cropper-wrap {
  position: relative;
  margin: 20px auto;

  &__tip-red {
    color: red;
    text-align: center;
    margin-top: 10px;
  }
}

.cropper-menu {
  &__reload {
    display: inline-block;
  }
  &__btn {
      margin-left: 10px;
  }
}

.el-tag__cur {
  margin-right: 5px;
  margin-bottom: 5px;
  max-width: 300px;
  white-space: normal;
  height: auto;
}

.dialog-content {
  color: #303133;
  font-size: 14px;

  &__cur {
    &-desc {
      font-size: 18px;
    }

    .cur-content {
      border: 1px solid #ebeef5;
      box-sizing: border-box;
      padding: 35px 20px 40px;

      &-wrap {
        margin-bottom: 20px;
      }

      &__img {
        display: inline-block;
        width: 200px;
        height: 150px;
        border: 1px solid #eee;
        box-sizing: border-box;
        margin-right: 20px;
      }

      &__input {
        font-size: 14px;
        line-height: 22px;
        margin-top: 38px;
        margin-bottom: 30px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__link {
        font-size: 14px;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  &__update {
    &-desc {
      font-size: 18px;
    }

    .update-content {
      // border: 1px solid #ebeef5;
      box-sizing: border-box;
      padding: 35px 20px 40px;

      .upload-image {
        display: flex;

        &__href {
          display: inline-block;
          vertical-align: middle;
          margin-right: 10px;
        }

        &__cur {
          display: inline-block;
          width: 200px;
          height: 150px;
          border: 1px solid #eee;
          box-sizing: border-box;
          margin-right: 20px;
        }

        &__btn {
          margin-left: 20px;

          .el-upload.el-upload--text {
            text-align: left !important;
          }

          &-tip {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
