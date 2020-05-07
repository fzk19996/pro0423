<template lang="pug">
  el-dialog.c__dialog-wrap.c__dialog-wrap-65.oper-dialog(
    :title="title"
    :visible.sync="curVisible"
    @open="handleOpen"
    :close-on-click-modal="false"
    @close="handleClose"
    :modal-append-to-body="false"
    )
    section.dialog-content(v-loading="dialogLoading")
      crop-image(
        :visible.sync="imgCrop.visible"
        :dialogData.sync="imgCrop.data"
        @cropDone="handleCropDone"
      )
      section.dialog-content__update
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
import CropImage from 'com/CropImage.vue';

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
            isConfirmCrop: false, // 是否有裁剪成功过
            // new
            imgCrop: {
                visible: false,
                data: {
                    index: 0,
                    img: '',
                    width: '',
                    height: '',
                    type: '' // 期望新增一个`type`属性标识`image`,`gif`,`video`
                }
            }
        };
    },
    watch: {
        visible(newV) {
            this.curVisible = newV;
        }
    },
    components: {
        PopClear,
        CropImage
    },
    methods: {
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
            this.imgCrop.visible = true;
            this.imgCrop.data.index = index;
            this.imgCrop.data.img = item.content;
            this.imgCrop.data.width = item.width;
            this.imgCrop.data.height = item.height;
            this.imgCrop.data.type = item.type || '';
        },
        handleCropDone(payload) {
            this.formData.img[payload.index].content = payload.url;
            this.isConfirmCrop = true;
        },
        handleLinkSkip(item, index) {
            this.$refs['popUpdateForm'].validateField(`link.${index}.content`);
            if (item.content === '' || !Validate.isUrl(item.content)) return;
            window.open(item.content);
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

.oper-dialog .el-dialog{
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

.global-required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;  
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
