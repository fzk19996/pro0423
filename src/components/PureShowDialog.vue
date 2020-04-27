<template>
  <el-dialog
    class="p__el-dialog"
    :title="dialogData.title"
    :visible.sync="curVisible"
    :append-to-body="appendToBody || false"
    :show-close="false"
    :before-close="handleBeforeClose"
    @close="handleClose">
    <slot name="body">
      <section class="dialog-content dialog-content__cur" v-html="dialogData.body"></section>
    </slot>
    <div slot="footer" class="dialog-footer dialog-footer__cur">
      <el-button
        size="small"
        type="primary"
        :loading="buttonLoading"
        @click="handleConfirm">
          {{ buttonLoading ? '修改中' : '确 定' }}
      </el-button>
      <el-button size="small" @click="handleCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
    props: ['visible', 'appendToBody', 'buttonLoading', 'dialogData'],
    data() {
        return {
            curVisible: this.visible
        };
    },
    watch: {
        visible(newV) {
            this.curVisible = newV;
        }
    },
    methods: {
        handleBeforeClose(done) {
            // this.$confirm('确认关闭？')
            //   .then(_ => {
            //     done()
            //   })
            //   .catch(_ => {})
        },
        handleClose() {
            // 重置非 title body 项
            const tmpDialogData = {};
            for (const key in this.dialogData) {
                if (this.dialogData.hasOwnProperty(key)) {
                    if (key !== 'title' && key !== 'body') {
                        tmpDialogData[key] = '';
                    } else {
                        tmpDialogData[key] = this.dialogData[key];
                    }
                }
            }
            this.$emit('update:dialogData', tmpDialogData);
            this.$emit('update:visible', false);
        },
        handleConfirm() {
            // this.$emit('update:visible', false)
            this.$emit('update:buttonLoading', true);
            this.$emit('confirmCb', this.dialogData);
        },
        handleCancel() {
            this.$emit('update:visible', false);
        }
    }
};
</script>
<style lang="css">
/* hack 由于全局设置了 el-dialog */
/*      要修改当前dialog属性必须去掉 scoped */
/*      但当前又成了全局 */
/*      所以dialog相关样式 最好多设置一个 保证当前权重最大 怕影响全局 */
.p__el-dialog .el-dialog {
  /* max-height: calc(40% - 30px) !important; */
  max-width: calc(35% - 30px) !important;
}
.p__el-dialog .el-dialog .el-dialog__body {
  overflow: auto;
}
.dialog-content.dialog-content__cur {
  text-align: center;
  color: #303133;
  font-size: 16px;
}
.dialog-footer.dialog-footer__cur {
  text-align: center;
}
</style>
