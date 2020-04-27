<template>
  <el-dialog
    class="c__dialog-wrap c__dialog-wrap-65 img-dialog"
    :visible.sync="curVisible"
    v-if="curVisible"
    title="裁剪图片"
    @close="handleClose"
    :modal-append-to-body="true"
    append-to-body
  >
  <!-- :title="`${curType === typeMap.image ? '裁剪图片' : '上传'}`" -->
    <section class="cropper-wrap" v-loading="srcLoading" :style="{
      height: `${cropOptionHeight + 40}px`,
      width: `${cropOptionWidth + 40}px`
    }">
      <!-- 裁剪图片 -->
      <vue-cropper
        v-show="curType === typeMap.image"
        ref="cropper"
        :auto-crop="cropOption.autoCrop"
        :auto-crop-width="cropOptionWidth"
        :auto-crop-height="cropOptionHeight"
        :fixed-box="cropOption.fixedBox"
        :center-box="cropOption.centerBox"
        :full="cropOption.full"
        :high="cropOption.high"
        :img="`${cropOptionImg}`"
        :output-size="cropOption.outputSize"
        :output-type="cropOption.outputType"
        :canMove="cropOption.canMove"
        :canMoveBox="cropOption.canMoveBox"
        :canScale="cropOption.canScale"
      >
      </vue-cropper>
      <!-- gif -->
      <el-tooltip v-show="curType === typeMap.gif" placement="top" :content="`${cropOptionWidth}x${cropOptionHeight}`">
        <img :src="notCropOption.gifSrc" >
      </el-tooltip>
      <!-- 视频 -->
      <!-- <video
        v-show="curType === typeMap.video"
        id="uploadVideoRef"
        controls="controls"
        @oncanplaythrough="handleVideoPlay"
      >
        <source :src="notCropOption.videoSrc" type="video/x-flv" >
      </video> -->
      <template v-if="curType === typeMap.video">
        <video-player
          v-if="/(mp4)$/i.test(notCropOption.videoSrc)"
          ref="videoPlayer"
          :options="playerOptions"
          :playsinline="true"
          customEventName="changed"
          @ready="playerIsReady"
          @changed="playerStateChanged($event)"
        >
        </video-player>
        <img
          class="show-position__img-main"
          v-if="/(flv)$/i.test(notCropOption.videoSrc)"
          :src="`${imgDomain}${defaultPreviewVideo}`"
          @click="handleShowFlv(notCropOption.videoSrc)"
        >
      </template>
    </section>
    <!-- image tip -->
    <template v-if="curType === typeMap.image && !!cropOptionImg">
      <p v-show="cropOption.isDirectConfirm" class="cropper-wrap__tip-red" >
        当前图片尺寸与规定尺寸一致。
      </p>
      <p v-show="!cropOption.isDirectConfirm" class="cropper-wrap__tip-red" >
        当前图片尺寸与规定尺寸不一致，请拖拽裁剪！
      </p>
    </template>
    <!-- gif tip -->
    <template v-if="curType === typeMap.gif && !notCropOption.gifSrc">
      <p class="cropper-wrap__tip-red" >
        请重新选择尺寸为{{cropOptionWidth}}x{{cropOptionHeight}}的创意
      </p>
    </template>
    <section slot="footer" class="cropper-menu">
      <section class="cropper-menu__reload">
        <label class="el-button el-button--primary el-button--small cropper-menu__reload-btn" for="uploads">{{cropOptionImg ? '重新上传' : '上传创意'}}</label>
        <!-- accept="image/png, image/jpeg, image/gif, image/jpg, video/mp4, .flv" -->
        <input type="file" id="uploads"
          style="position:absolute; clip:rect(0 0 0 0);"
          :accept="dialogData.type && dialogData.type === 'video' ? `image/png, image/jpeg, image/gif, image/jpg, video/mp4` : `image/png, image/jpeg, image/gif, image/jpg`"
          @change="uploadImg($event)">
      </section>
      <el-button
        type="primary"
        size="small"
        :isloading="cropOption.isCropping"
        @click="handleCropConfirm"
        class="cropper-menu__btn">
        {{ cropOption.isCropping ? `${curType === typeMap.image ? '裁剪中' : '上传中'}` : `${curType === typeMap.image ? '确定裁剪' : '确定上传'}` }}
      </el-button>
      <el-button size="small" @click="handleCropCancel">取消</el-button>
    </section>
  </el-dialog>
</template>

<script>
import { VueCropper } from 'vue-cropper';

// import CommonService from '@services/CommonService'
import ElementDefault from 'lib/ElementDefault';

import {
    ImgDomain
} from 'conf/domain';

const DefaultPreviewVideo = `/sh220x165sh/focus-op/test/4f29e14c15717c1b27c8d4721a6c99b3.png`;

export default {
    name: 'crop-image',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        dialogData: {
            type: Object,
            default: () => {
                return {
                    index: 0,
                    img: '',
                    width: '',
                    height: '',
                    type: ''
                };
            }
        }
    },
    data() {
        return {
            imgDomain: ImgDomain,
            defaultPreviewVideo: DefaultPreviewVideo,
            curVisible: this.visible,
            curType: 'image', // 当前正在操作的资源类型
            typeMap: {
                image: 'image',
                gif: 'gif',
                video: 'video'
            },
            // 控制裁剪图片
            cropOption: {
                show: false,
                index: 0, // 记录当前正在操作的第几张图片 -> cropOptionIndex
                isCropping: false, // 正在裁剪
                autoCrop: true, // 默认生成截图框
                autoCropWidth: 200, // 截图框宽度 -> cropOptionWidth
                autoCropHeight: 200, // 截图框高度 -> cropOptionHeight
                fixedBox: true, // 截图框大小不能改变
                centerBox: false, // 截图框限制在图片内
                full: false, // 输出原图比例的截图
                high: true, // 按照设备的dpr输出等比例图片
                img: '', // 裁剪图片的地址 -> cropOptionImg
                outputSize: 1, // 裁剪生成图片的质量
                outputType: 'jpeg', // 裁剪生成图片的格式
                fileName: 'image.png', // 裁剪后图片的name
                canMove: true, // 是否可以移动图片
                canScale: true, // 是否允许滚轮缩放
                canMoveBox: true, // 是否能拖动截图框
                isDirectConfirm: false, // 图片大小刚好满足则不能缩放拖拽 直接上传图片
                directConfirmFile: '' // 原图文件
            },
            notCropOption: {
                file: '', // 原资源文件
                gifSrc: '', // 控制gif
                videoSrc: '' // 控制视频
            },
            // 控制视频预览
            playerOptions: {
                height: '360',
                width: '360',
                autoplay: true,
                controls: true,
                sources: [{
                    type: 'video/x-flv',
                    src: '' // http://t2.focus-img.cn/focus-op/test/71936f53f3c74a0aebeb6c702725eef2.FLV
                }],
                language: 'zh-CN'
                // techOrder: ['flash']
            },
            srcLoading: false,
            isConfirmCrop: false // 是否有裁剪成功过
        };
    },
    computed: {
    // cropOptionWidth cropOptionHeight 不应该修改的 可以换成普通形式
        cropOptionWidth: {
            get() {
                return this.dialogData.width;
            },
            set(val) {
                this.$emit('update:dialogData', {
                    ...this.dialogData,
                    width: val
                });
            }
        },
        cropOptionHeight: {
            get() {
                return this.dialogData.height;
            },
            set(val) {
                this.$emit('update:dialogData', {
                    ...this.dialogData,
                    height: val
                });
            }
        },
        cropOptionImg: {
            get() {
                if (this._isGifType(this.dialogData.img)) { // gif
                    this.curType = this.typeMap.gif;
                    this.notCropOption.gifSrc = this.dialogData.img;
                } else if (this._isVideoType(this.dialogData.img)) { // video
                    this.notCropOption.videoSrc = this.dialogData.img;
                    this.notCropOption.file = this.dialogData.img;
                    this.playerOptions.sources[0].src = this.dialogData.img;
                    this.playerOptions.height = `${this.cropOptionHeight}`;
                    this.playerOptions.width = `${this.cropOptionWidth}`;
                    this.curType = this.typeMap.video; // 有资源再初始化
                } else { // image
                    this.curType = this.typeMap.image;
                }
                console.log('computed: ', this.dialogData.img);
                return !this.dialogData.img ? null : this.dialogData.img;
            },
            set(val) {
                this.$emit('update:dialogData', {
                    ...this.dialogData,
                    img: val
                });
            }
        },
        cropOptionIndex() {
            return this.dialogData.index;
        },
        player() {
            return this.$refs.videoPlayer.player;
        }
    },
    watch: {
        visible(newV) {
            this.curVisible = newV;
        },
        'dialogData.img'(newV) {
            if (!newV) {
                this.cropOptionImg = null;
                this.cropOption.autoCrop = false;
            } else {
                this.cropOption.autoCrop = true;
            }
        }
    },
    components: {
        VueCropper
    },
    created() {

    },
    methods: {
        handleClose() {
            this.handleCropCancel();
        },
        handleCropConfirm() {
            switch (this.curType) {
                case this.typeMap.image: // 上传图片
                    if (!this.cropOptionImg) {
                        this.$notify.warning({
                            title: '提示',
                            message: '请上传创意',
                            duration: 2000
                        });
                        return;
                    }
                    this.cropOption.isCropping = true;
                    if (this.cropOption.isDirectConfirm) { // 直接上传原图
                        const resData = new FormData();
                        resData.append('image', this.cropOption.directConfirmFile);
                        resData.append('width', this.cropOptionWidth);
                        resData.append('height', this.cropOptionHeight);
                        this._uploadPic(resData);
                    } else { // 按裁剪后上传
                        this.$refs.cropper.getCropBlob(data => {
                            const resData = new FormData();
                            // 返回的图片为blob 需转为file
                            // const img = new window.File([data], this.cropOption.fileName);
                            // resData.append('image', img);
                            // ie不支持new File, 直接上传blob
                            resData.append('image', data, this.cropOption.fileName);
                            resData.append('width', this.cropOptionWidth);
                            resData.append('height', this.cropOptionHeight);
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
                        ElementDefault.messageError(`请上传创意`);
                    } else {
                        this.cropOption.isCropping = true;
                        const resData = new FormData();
                        resData.append('image', this.notCropOption.file);
                        resData.append('width', this.cropOptionWidth);
                        resData.append('height', this.cropOptionHeight);
                        this._uploadPic(resData);
                    }
                    break;
                case this.typeMap.video: // 上传视频
                    if (this.notCropOption.file === '') {
                        ElementDefault.messageError(`请上传创意`);
                    } else {
                        this.cropOption.isCropping = true;
                        this._handleUploadVideo();
                        // this.handleUploadVideo()
                    }
                    break;
            }
        },
        _resetCropData() {
            // this.$refs.cropper.clearCrop()
            // this.cropOptionWidth = 0
            // this.cropOptionHeight = 0
            this.curType = this.typeMap.image; // 重置为裁剪图片模式
            Object.assign(this.notCropOption, this.$options.data().notCropOption);
            Object.assign(this.cropOption, this.$options.data().cropOption);
            this.cropOptionImg = null; // `vue-cropper`组件只在img为非''才会重新渲染
            // this.$set(this, 'cropOptionImg', null)
        },
        _uploadPic(data) { // 上传裁剪后的图片
            this.srcLoading = true;
            this.$serv.opUpdatePic(data)
                .then(res => {
                    this.$emit('cropDone', {
                        index: this.cropOptionIndex,
                        url: res.url
                    });
                }).then(_ => {
                    this.cropOption.isCropping = false;
                    this.isConfirmCrop = true;
                    this.handleCropCancel();
                }).finally(_ => {
                    this.srcLoading = false;
                });

            //   CommonService.UpdatePic({
            //     params: {
            //       data: data,
            //       config: {
            //         headers: {
            //           'Content-Type': 'multipart/form-data'
            //         }
            //       }
            //     },
            //     fn: res => {
            //       this.$emit('cropDone', {
            //         index: this.cropOptionIndex,
            //         url: res.url
            //       })
            //     }
            //   }).then(_ => {
            //     // this._resetCropData()
            //     // this.cropOption.show = false
            //     // this.$emit('update:visible', false)
            //     this.cropOption.isCropping = false
            //     this.isConfirmCrop = true
            //     this.handleCropCancel()
            //   }).finally(_ => {
            //     this.srcLoading = false
            //   })
        },
        handleCropCancel() {
            this._resetCropData();
            this.cropOption.show = false;
            this.$emit('update:visible', false);
        },
        _isVideoType(type) { // 是否为视频
            return /(mp4|flv)$/i.test(type);
        },
        _isGifType(type) { // 是否为gif
            return /(gif)$/i.test(type);
        },
        _isConfirmType(type) { // 是否为图片
            return /(gif|jpg|jpeg|png)$/i.test(type);
        },
        _isConformSize(size, max = 2.5) { // 图片可上传大小
            return size < max * 1024 * 1024;
        },
        _judgePic(file, width, height) { // 判断图片是否满足规定宽高
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
                            resolve({ isConfirmWH: false });
                            console.error(err);
                        };
                    };
                } catch (e) {
                    resolve({ isConfirmWH: false });
                    console.error(e);
                }
            });
        },
        _handleUploadVideo() {
            this.$emit('cropDone', {
                index: this.cropOptionIndex,
                url: this.notCropOption.videoSrc
            });
            this.cropOption.isCropping = false;
            this.isConfirmCrop = true;
            this.handleCropCancel();
        },
        handleUploadVideo() { // 调接口上传
            this.srcLoading = true;
            const resData = new FormData();
            resData.append('video', this.notCropOption.file);
            resData.append('width', this.cropOptionWidth);
            resData.append('height', this.cropOptionHeight);
            //   CommonService.UpdateVideo({
            //     params: {
            //       data: resData,
            //       config: {
            //         headers: {
            //           'Content-Type': 'multipart/form-data'
            //         }
            //       }
            //     },
            //     fn: res => {
            //       this.$emit('cropDone', {
            //         index: this.cropOptionIndex,
            //         url: res.url
            //       })
            //     }
            //   }).then(_ => {
            //     this.cropOption.isCropping = false
            //     this.isConfirmCrop = true
            //     this.handleCropCancel()
            //   }).finally(_ => {
            //     this.srcLoading = false
            //   })
        },
        _judgeVideo() {
            return new Promise((resolve, reject) => {
                this.srcLoading = true;
                const resData = new FormData();
                resData.append('video', this.notCropOption.file);
                resData.append('width', this.cropOptionWidth);
                resData.append('height', this.cropOptionHeight);
                // CommonService.UpdateVideo({
                //   params: {
                //     data: resData,
                //     config: {
                //       headers: {
                //         'Content-Type': 'multipart/form-data'
                //       }
                //     }
                //   },
                //   fn: res => {
                //     resolve(res)
                //   }
                // }).finally(_ => {
                //   this.srcLoading = false
                // })
            });
        },
        handleVideoPlay(e) {
            // console.log(e)
        },
        // 处理视频 宽高符合则上传，否则重新选择
        _dealVideo(file, event) {
            const _self = this;
            // // #0411 flv格式获取不到宽高，mp4是可以的，然而运营又坚持使用flv格式，故不做长宽校验
            // //       若后续支持MP4 下面注释放开即可
            // this.srcLoading = true
            // let videoReader = new FileReader()
            // videoReader.readAsDataURL(file)
            // videoReader.onload = function (theFile) {
            //   let uploadVideoRef = document.createElement('video')
            //   uploadVideoRef.src = theFile.target.result
            //   uploadVideoRef.addEventListener('loadedmetadata', function (e) {
            //     console.log(uploadVideoRef.videoWidth, uploadVideoRef.videoHeight)
            //     // 宽高符合
            //     // if (uploadVideoRef.videoWidth === _self.cropOptionWidth && uploadVideoRef.videoHeight === _self.cropOptionHeight) {
            //     if (uploadVideoRef.videoWidth === _self.cropOptionWidth) { // local mock
            //       _self.notCropOption.videoSrc = theFile.target.result
            //       _self.notCropOption.file = file
            //     } else {
            //       _self.notCropOption.file = ''
            //       ElementDefault.messageError(`尺寸不符合，请重新选择尺寸为${_self.cropOptionWidth}x${_self.cropOptionHeight}的视频`)
            //     }
            //     event.target.value = ''
            //     _self.srcLoading = false
            //   }, false)
            // }

            this.notCropOption.file = file;
            if (this.playerOptions.sources[0].src) {
                this.curType = '';
            }
            if (/(mp4)$/i.test(file.type)) { // mp4 不自动播放
                this.playerOptions.sources[0].type = 'video/mp4';
                this.playerOptions.autoplay = false;
                // delete this.playerOptions.techOrder
            } else { // flv 即使设置为自动播放在Chrome下也还需点击两次
                // @tip 放弃flv的预览
                // this.playerOptions.sources[0].type = 'video/x-flv'
                // this.playerOptions.autoplay = true
                // this.playerOptions.techOrder = ['flash']
            }
            this._judgeVideo().then(res => {
                _self.notCropOption.videoSrc = res.url;
                _self.curType = _self.typeMap.video; // 有资源后再初始化`video-player`
                _self.playerOptions.sources[0].src = res.url;
                _self.playerOptions.height = `${_self.cropOptionHeight}`;
                _self.playerOptions.width = `${_self.cropOptionWidth}`;
                event.target.value = '';
            });
        },

        // 处理gif 宽高符合则上传， 否则重新选择
        _dealGif(file, event) {
            const _self = this;
            this._judgePic(file, this.cropOptionWidth, this.cropOptionHeight)
                .then(({ isConfirmWH, fileSrc }) => {
                    // _self.notCropOption.gifSrc = fileSrc // local mock 待删
                    // _self.notCropOption.file = file // local mock 待删
                    if (isConfirmWH) {
                        _self.notCropOption.gifSrc = fileSrc;
                        _self.notCropOption.file = file;
                    } else {
                        _self.notCropOption.file = '';
                        ElementDefault.messageError(`尺寸不符合，请重新选择尺寸为${this.cropOptionWidth}x${this.cropOptionHeight}的创意`);
                        // 类型改为image
                        // this.curType = this.typeMap.image
                    }
                    event.target.value = '';
                });
        },

        // 支持`png/jpg/jpeg/gif`、`gif`、`flv`三个分类
        uploadImg(event) {
            const file = event.target.files[0];
            if (!file) {
                ElementDefault.messageError('请选择创意');
                return false;
            }
            if (this.dialogData.type && this.dialogData.type === 'video') { // 临时处理 后期还得优化
                /**
        * 处理视频
        */
                if (this._isVideoType(file.type) || this._isVideoType(file.name)) {
                    this.notCropOption.gifSrc = '';
                    if (!this._isConformSize(file.size, 5)) { // 大小判断
                        ElementDefault.messageError('视频大小不能超过5M');
                        return false;
                    }
                    // this.curType = this.typeMap.video
                    this._dealVideo(file, event);
                    return false;
                }
            }

            /**
       * 处理gif
       */
            if (this._isGifType(file.type)) {
                this.notCropOption.videoSrc = '';
                if (!this._isConformSize(file.size)) { // 大小判断
                    ElementDefault.messageError('图片大小不能超过2.5M');
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
                ElementDefault.messageError('图片类型必须是.gif,jpeg,jpg,png中的一种');
                event.target.value = '';
                return false;
            }
            if (!this._isConformSize(file.size)) { // 大小判断
                ElementDefault.messageError('图片大小不能超过2.5M');
                event.target.value = '';
                return false;
            }
            // 矫正文件名和类型
            this.curType = this.typeMap.image;
            this.cropOption.fileName = file.name || 'image.png';
            this.cropOption.outputType = file.type ? file.type.split('/')[1] : 'jpeg';
            this._judgePic(file, this.cropOptionWidth, this.cropOptionHeight)
                .then(({ isConfirmWH }) => {
                    if (isConfirmWH) { // 符合宽高 直接上传原图
                        this.cropOption.isDirectConfirm = true;
                        this.cropOption.directConfirmFile = file;
                        this.cropOption.canMove = false;
                        this.cropOption.canMoveBox = false;
                        this.cropOption.canScale = false;
                    } else { // 否则走裁剪
                        this.cropOption.isDirectConfirm = false;
                        this.cropOption.directConfirmFile = '';
                        this.cropOption.canMove = true;
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
                        this.cropOptionImg = tmpData;
                    };
                    reader.readAsArrayBuffer(file); // 转化为blob
                });
        },
        handleShowFlv(link) {
            window.open(link);
        },
        playerStateChanged(playerCurrentState) {
            // console.log('video-player: state changed', playerCurrentState)
        },
        playerIsReady(player) {
            // console.log('video-player ready!', player)
            // player.hotkeys && player.hotkeys({
            //   volumeStep: 0.1,
            //   seekStep: 5,
            //   enableModifiersForNumbers: false,
            //   fullscreenKey: function (event, player) {
            //     // override fullscreen to trigger when pressing the F key or Ctrl+Enter
            //     return ((event.which === 70) || (event.ctrlKey && event.which === 13))
            //   }
            // })
        }
    }
};
</script>

<style lang="scss">
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
    .show-position__img-main {
      width: 200px;
      height: 150px;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      cursor: pointer;
    }
  }

  .cropper-menu {
    &__reload {
      display: inline-block;
      margin-right: 10px;
    }
  }
</style>

