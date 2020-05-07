<template lang="pug">
    pure-show-dialog(
        :visible.sync="clearDialog.visible"
        :appendToBody="clearDialog.appendToBody"
        :buttonLoading.sync="clearDialog.buttonLoading"
        :dialogData.sync="clearDialog.data"
        @confirmCb="confirmClearCb"
    )
        template(slot="body")
          el-form.c__dialog-cur__clear(size="small" label-position="right" label-width="120px")
            el-form-item(label="运营位名称：")
              span {{ clearDialog.data.posName }}
            el-form-item(label="运营位ID：")
              span {{ clearDialog.data.posId }}
</template>
<script>
import PureShowDialog from 'com/PureShowDialog';

export default {
    components: {
        PureShowDialog
    },
    props: {
        clearDialog: {}
    },
    methods: {
        confirmClearCb() {

            this.clearDialog.buttonLoading = true;
            this.$serv.opClear({
                posId: this.clearDialog.data.posId,
                projectId: this.$store.state.userInfo.projectId,
                lastModifyAccount: this.$store.state.userInfo.nickName,
                pageId: 402
            }).then(res => {
                this.$notifyOk('清除成功');
                this.$emit('confirmClear');
            }).finally(_ => {
                this.clearDialog.buttonLoading = false;
                this.clearDialog.visible = false;
            });
        }
    }
};
</script>
