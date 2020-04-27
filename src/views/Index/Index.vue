<template lang="pug">
div.index-wrap
    div.welecom
      div.txt
        h1.name {{userInfo.nickName}}
        p.sub-name 欢迎您使用搜狐焦点文旅·{{userInfo.projectName}}管理系统！
    div.introduce
      div.section.border
        p.content-tips 以下是{{userInfo.projectName}}的专属链接

        div.section-left-item.x-c
          img.img(
            id="wechatCode"
            :src="userInfo.qrCodeUrl"
            :alt="userInfo.projectName + '小程序'"
          )

        div.section-left-item.right-item.x-c-title(style="padding-top:0")
          p.wap-img.login-img-title {{userInfo.projectName}}小程序
          txt-button.button-copy(
            type="small"
            color="gray"
            txt="下载小程序码"
            :click="downloadWechatCode"
          )
          p.instruction
            span 如果您需要将{{userInfo.projectName}}链接到您项目微信公众号下，请
            span.link(@click="showModel") 查看指引
      div.section.second
        p.content-tips 为使您的地产项目更具吸引力，您可以：
        div.second-right-wrap
          div.section-right-item
            p.catalog 1. 配置您的个性化首页
            router-link(to="/content")
                span.link-style(v-if="!recommend.existMainPage") 去设置
                span.link-style.done(v-else) 已设置
          div.section-right-item
            p.catalog 2. 配置您项目的关键地标
            span.link-style.todo 功能开发中…
          div.section-right-item
            p.catalog 3. 为用户推荐更好的游玩路线
            span.link-style.todo 功能开发中…
          div.section-right-item
            p.catalog 4. 配置并及时更新您的房源信息
            span.link-style.todo 功能开发中…

    guide(v-model="visiable")
</template>
<script>
import Guide from './PopGuide';
export default {
    components: { Guide },
    data() {
        return {
            recommend: {
                "existMainPage": false,
                "existKeyLandMark": false,
                "existRecommendRoute": false,
                "existHouseSource": false
            },
            visiable: false
        };
    },

    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        }
    },

    methods: {
        showModel() {
            this.visiable = true;
        },
        downloadWechatCode() {
            const url = this.$el.querySelector('#wechatCode').src;
            if (window.IEVersion() <= 11) {
                window.open(url);
                return;
            }
            if (!HTMLCanvasElement.prototype.toBlob) {
                Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
                    value: function(callback, type, quality) {
                        var binStr = atob(this.toDataURL(type, quality).split(",")[1]),
                            len = binStr.length,
                            arr = new Uint8Array(len);
                        for (var i = 0; i < len; i++) {
                            arr[i] = binStr.charCodeAt(i);
                        }
                        callback(new Blob([arr], { type: type || "image/png" }));
                    }
                });
            }
            const img = new Image();
            const canvas = document.createElement('canvas');
            img.setAttribute("crossOrigin",'anonymous');
            img.onload = function(e) {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                canvas.toBlob(blob =>{
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = url;
                    link.click();
                });
            };
            img.src = url;
        }
    },

    async created() {
        this.recommend = await this.$serv.indexRecommend();
    }
};

</script>
<style scoped lang="stylus">
.index-wrap
    padding: 0px 55px

.welecom
    position: relative
    height: 184px
    background: url('./images/welecom.png') 10px 77px no-repeat
    border-bottom: solid 1px #D5D5D5
    .txt
        position: absolute
        padding: 0px 75px 0px 29px
        left: 133px
        top: 45px
        min-width: 434px
        height: 110px
        background: #F8F8F8
        border: 1px solid #D5D5D5
        border-radius: 4px
        border-bottom-left-radius: 0px
        box-sizing: border-box
        &:before
            position: relative
            display: inline-block
            left: -41px
            bottom: -95px
            width: 12px
            height: 14px
            content: ""
            background: url('./images/arrow.jpg') no-repeat
        .name
            font-size: 28px
            color: #333
            font-weight: bold
        .sub-name
            margin-top: 5px
            font-size: 20px
            color: #666

.introduce
    margin-top: 72px
    .section
        display: inline-block
        // width: 500px
        height: 286px
        vertical-align: top
        .content-tips
            margin-bottom: 30px
            font-size: 16px
            color: #333
        &.border
            border-right: solid 1px #D5D5D5
        &.second
            padding-left: 45px
            box-sizing: border-box
            .second-right-wrap
                width: 330px

.section-left-item
    display: inline-block
    vertical-align: top
    .img
        width: 120px
        height: 120px
    .img-tips
        width: 120px
        margin-top: 11px
        font-size: 12px
        color: #666
        text-align: center
    .login-img
        margin-top: 10px
    &.right-item
        margin-left: 30px
        font-size: 16px
        color: #333333
    .href-url
        display: block
        margin: 10px 0px
        width: 300px
        color: #333
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis
    .button-copy
        margin-top: 10px
        &.bottom
            margin-bottom: 32px
    &.x-c
        margin-top: 22px
    &.x-c-title
        margin-top: 22px
        padding-top: 34px
        width: 330px
        margin-right 40px

.section-right-item
    position: relative
    height: 16px
    line-height: 16px
    margin-bottom: 22px
    .catalog
        font-size: 16px;
        color: #333
    .link-style
        position: absolute
        display: inline-block
        right: 0
        top: 0
        height: 16px
        line-height: 16px
        font-size: 14px
        color: #FC634D
        &:before
            display: inline-block
            margin-right: 4px
            width: 16px
            height: 16px
            content: ""
            background: url('./images/icon-err.png') no-repeat
            vertical-align: bottom
        &.done
            color: #66BB33
        &.done:before
            background: url('./images/right-icon.png') no-repeat
        &.todo
            color: #333
            &:before
                display: none

.instruction
    font-size: 14px
    line-height: 20px
    margin-top: 15px
    .link
        color: #FF6246
        cursor: pointer
</style>
