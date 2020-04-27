 <template lang="pug">
 div.mask(v-if="value" @click="close")
      div.close
        i.el-icon-close

      div.cur-body(@click.stop="carouselClick")
        el-carousel(
          indicator-position="outside"
          height="600px"
          :interval="6000")
          el-carousel-item(
            v-for="(item, index) in help"
            :key="index")
            img(:src="item.url")
            p.step
                pre {{item.content}}
</template>

<script>
export default {
    props: {
        value: false
    },
    data() {
        return {
            help: []
        };
    },
    methods: {
        close() {
            this.$emit('input', false);
        },
        carouselClick() {
        }
    },

    watch: {
        async value(v) {
            if (v) {
                const help = await this.$serv.indexHelp();
                // this.help = help.sort((h1, h2) => h1.order > h2.order);
                const temp  = help.sort((h1, h2) => h1.order > h2.order);
                this.help = temp.map(item => {
                    return Object.assign({}, item, {
                        content: item.content.replace(/\\n/gm, '\n')
                    });
                });
            }
        }
    }
};
</script>

<style lang="stylus" scoped>
.mask
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.8);
    font-size: 14px;
    color: white;
    .close
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 20px;
.cur-body
    width: 830px;
    height: 620px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    .step
        margin-top: 20px;
    img
        width: 830px;
        height: 510px;
    h3
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
    p
        text-align: center;
        font-size: 20px;
        pre
            white-space: pre-wrap;
    .el-carousel
        overflow-y: hidden;
</style>
