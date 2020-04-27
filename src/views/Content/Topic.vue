<style lang="scss">
        @mixin icon-font2018 ($icon-code, $font-size, $position: 'before') {
        font-family: "icon2018" !important;
        font-size: $font-size;
        font-style: normal;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        @if $position == 'before' {
            &::before {
                content: $icon-code;
            }
        }

        @else {
            &::after {
                content: $icon-code;
            }
        }
    }
    .iconExplain {
        @include icon-font2018 ('\e9e9', 16px, 'after');
        color: #FC634D;
        margin-right: 10px
    }
    .explain {
        padding: 40px 0;
        color: #333;
        font-size: 14px;
        position: relative;

        .btn {
            background-color: #FC634D;
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
    
</style>
<template lang="pug">
    div(style="margin: 0 20px")
        el-dialog(:visible.sync="imgVisible" width="280px" :modal="false" style="text-align: center" top="25vh")
            img(:src="imgLink" v-if="imgLink" style="width: 160px; height: 160px; margin: 0 auto")
        div.explain 
            span.iconExplain
            span 主推专题将展示在小程序【发现】页上
            button(style="float: right" @click="edit(null, 'create')").btn 创建新专题
        el-table(:data="tableData" border)
            el-table-column(label="专题id" prop="id" width="80px" align="center")
            el-table-column(label="专题标题" width="100px" align="left" header-align="center")
                template(slot-scope="scope")
                    p(v-if="scope.row.title.length <= 5") {{scope.row.title}}
                    el-popover(
                        v-if="scope.row.title.length > 5"
                        width="180"
                        placement="top"
                        trigger="hover"
                        :content="scope.row.title")
                        p(slot="reference").short {{scope.row.title}}
            el-table-column(label="专题简介" header-align="center" align="left")
                template(slot-scope="scope")
                    p(v-if="scope.row.topicAbstract.length <= 12") {{scope.row.topicAbstract}}
                    el-popover(
                        v-if="scope.row.topicAbstract.length > 12"
                        width="180"
                        placement="top"
                        trigger="hover"
                        :content="scope.row.topicAbstract")
                        p(slot="reference").short {{scope.row.topicAbstract}}
            el-table-column(label="专题页面链接" align="center")
                template(slot-scope="scope")
                    p(v-if="scope.row.info.page_link.length <= 25") {{scope.row.info.page_link}}
                    el-popover(
                        v-if="scope.row.info.page_link.length > 25"
                        width="180"
                        placement="top"
                        trigger="hover"
                        :content="scope.row.info.page_link")
                        p(slot="reference").short {{scope.row.info.page_link}}
            //- el-table-column(label="二维码" width="103px" align="center")
                template(slot-scope="scope")
                    el-button(size="mini" v-if="scope.row.info.qr_code" @click="showImg(scope.row.info.qr_code)") 查看图片
            el-table-column(label="专题页面状态" width="120px" align="center")
                template(slot-scope="scope")
                    p {{scope.row.status===3?'主推':scope.row.status===2?'隐藏':'正常'}}
            el-table-column(label="操作" align="center")
                template(slot-scope="scope")
                    el-button(@click="edit(scope.row.id, 'edit')" size="small") 编辑
                    el-button(@click="toggleHide(scope.row)" size="small" v-if="scope.row.status !== 3") {{scope.row.status === 1 ? '隐藏' : '取消隐藏'}}
        el-pagination(
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="pageNo"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total")
</template>
<script>
import { MessageBox } from 'element-ui';

export default {
    data() {
        return {
            mainId: 1,
            tableData: [],
            pageSize: 10,
            pageNo: 1,
            projectId: '',
            total: 0,
            imgVisible: false,
            imgLink: ''
        };
    },
    watch: {
        pageSize(val, oldV) {
            this._getSearchData();
        },
        pageNo(val, oldV) {
            this._getSearchData();
        }
    },
    activated() {
        this.projectId = this.$store.state.userInfo.projectId;
        this._getSearchData();
    },
    methods: {
        _getSearchData() {
            const _this = this;
            const { pageNo, pageSize, projectId } = this;
            this.$serv.topicList({
                pageNo, pageSize, projectId
            }).then(res=>{
                if (res) {
                    const { list, total } = res;
                    if (list && list[0]) {
                        if (list[0].id && list[0].status === 3) {
                            _this.mainId = list[0].id;
                        }
                    }
                    _this.tableData = list.map(item => {
                        return Object.assign(item, { info: JSON.parse(item.info) });
                    });
                    _this.total = total;
                }
            });
        },
        showImg(link) {
            this.imgLink = link;
            this.imgVisible = true;
        },
        handleSizeChange(val) {
            this.pageSize = val;
        },
        handleCurrentChange(val) {
            this.pageNo = val;
        },
        edit(id, mode) {
            this.$router.push({
                name: 'editTopic',
                query: {
                    id,
                    mode
                }
            });
        },
        toggleHide(row) {
            const _this = this;
            const { projectId } = this.$store.state.userInfo;
            const { title, topicAbstract, status, id } = row;
            if (status === 1) {
                MessageBox.confirm(`确定要隐藏【${title}】？隐藏后用户将无法查看该页面`, '隐藏专题', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn',
                    center: true
                }).then(()=>{
                    _this.$serv.topicEdit({
                        id,
                        projectId,
                        topicAbstract,
                        title,
                        status: 2
                    }).then(res => {
                        _this._getSearchData();
                    });
                });
            } else if (status === 2) {
                MessageBox.confirm(`确定要取消隐藏【${title}】？恢复后用户可以查看该页面`, '取消隐藏专题', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    cancelButtonClass: 'cancelBtn',
                    confirmButtonClass: 'confirmBtn',
                    center: true
                }).then(()=>{
                    _this.$serv.topicEdit({
                        id,
                        projectId,
                        topicAbstract,
                        title,
                        status: 1
                    }).then(res => {
                        _this._getSearchData();
                    });
                });
            }
        }
    }
};
</script>