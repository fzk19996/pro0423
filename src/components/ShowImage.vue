<template>
  <el-dialog
		:visible.sync="curVisible"
		@close="handleClose">
		<img width="100%" :src="dialogData.src" :alt="dialogData.alt">
	</el-dialog>
</template>
<script>
export default {
    props: ['visible', 'dialogData'],
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
        handleClose() {
            this.$emit('update:visible', false);
        }
    }
};
</script>
