<style lang="scss">
    .short {
        width: 100%;
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: -6px
    }
</style>
<template lang="pug">
    div(style="margin: 0 20px")
        el-dialog(:visible.sync="show" width="260px" :center="true")
            div(style="width: 100%;text-align: center")
                img(:src="imgSrc" style="width: 160px;height: 160px" v-if="imgSrc")
        p.explain 
            span.iconExplain
            span 您可在此对全部素材进行创建、失效、修改、查看等管理操作。
            button.btn(@click="editMaterial('create')") 创建新素材
        div(style="margin: 30px 0 40px")
            span 素材ID
            el-input(style="width: 140px; margin: 0 20px 0 10px" placeholder="请输入素材ID" v-model="id")
            span 标题
            el-input(style="width: 220px; margin: 0 20px 0 10px" placeholder="请输入标题" v-model="title")
            span 状态
            el-select(v-model="status" style="width: 140px; margin: 0 20px 0 10px")
                el-option(v-for="(item, index) in statusMap" :key="index" :label="item.name" :value="item.value")
            el-button(type="primary" @click="_getSearchData") 搜索
        el-table(:data="tableData" border)
            el-table-column(label="ID" prop="id" width="50px" align="center")
            el-table-column(label="标题" width="120px" header-align="center" align="left")
                template(slot-scope="scope")
                    p(v-if="scope.row.title.length <= 7") {{scope.row.title}}
                    el-popover(
                        v-if="scope.row.title.length > 7"
                        width="180"
                        placement="top"
                        trigger="hover"
                        :content="scope.row.title")
                        p(slot="reference").short {{scope.row.title}}
            el-table-column(label="简介" width="180px" header-align="center" align="left")
                template(slot-scope="scope")
                    p(v-if="scope.row.materialAbstract.length <= 10") {{scope.row.materialAbstract}}
                    el-popover(
                        v-if="scope.row.materialAbstract.length > 10"
                        width="180"
                        placement="top"
                        trigger="hover"
                        :content="scope.row.materialAbstract")
                        p(slot="reference").short {{scope.row.materialAbstract}}
            el-table-column(label="页面链接" align="center")
                template(slot-scope="scope")
                    div(v-if="scope.row.info.page_link")
                        p(v-if="scope.row.info.page_link.length <= 25") {{scope.row.info.page_link}}
                        el-popover(
                            v-if="scope.row.info.page_link.length > 25"
                            width="180"
                            placement="top"
                            trigger="hover"
                            :content="scope.row.info.page_link")
                            p(slot="reference").short {{scope.row.info.page_link}}
            //- el-table-column(label="二维码" width="120px" align="center")
                template(slot-scope="scope")
                    el-button(size="mini" v-if="scope.row.info.qr_code" @click="showImg(scope.row.info.qr_code)") 查看图片
                    p(v-else="scope.row.info.qr_code") 已失效
            el-table-column(label="状态" width="60px" align="center")
                template(slot-scope="scope")
                    p {{mapStatus(scope.row.status, 'name')}}
            el-table-column(label="操作" align="center")
                template(slot-scope="scope")
                    el-button(size="mini" @click="editMaterial('view', scope.row.id)") 查看
                    el-button(size="mini" @click="editMaterial('edit', scope.row.id)") 修改
                    el-button(size="mini" @click="switchStatus(scope.row)") {{mapStatus(scope.row.status, 'operate')}}
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
            status: '',
            id: '',
            title: '',
            statusMap: [
                {
                    value: '',
                    name: '全部',
                    operate: '',
                    status: ''
                }, {
                    value: 1,
                    name: '有效',
                    operate: '失效',
                    statusTo: 2
                }, {
                    value: 2,
                    name: '失效',
                    operate: '有效',
                    statusTo: 1
                }, {
                    value: 3,
                    name: '草稿',
                    operate: '删除',
                    statusTo: -1
                }
            ],
            tableData: [
            ],
            show: false,
            imgSrc: '',
            pageSize: 10,
            pageNo: 1,
            total: 1
        };
    },
    activated() {
        this._getSearchData();
    },
    watch: {
        pageSize(val, oldV) {
            this._getSearchData();
        },
        pageNo(val, oldV) {
            this._getSearchData();
        }
    },
    methods: {
        _getSearchData() {
            const _this = this;
            const { title, id, status, pageNo, pageSize } = this;
            if (title.length > 99) {
                this.$notifyErr('搜索的标题长度过长');
            } else {
                const { projectId } = this.$store.state.userInfo;
                this.$serv.materialList({
                    projectId,
                    title,
                    id,
                    status,
                    pageNo,
                    pageSize
                }).then(res => {
                    if(res) {
                        const { total, list } = res;
                        _this.total = total;
                        _this.tableData = list.map(item => {
                            return Object.assign(item, { info: JSON.parse(item.info) });
                        });
                    }
                });
            }
        },
        mapStatus(status, type) {
            for (const item of this.statusMap) {
                if (status === item.value) return item[type];
            }
        },
        switchStatus(row) {
            const _this = this;
            const { id, status, title } = row;
            for (const item of this.statusMap) {
                if (status === item.value) {
                    const { statusTo } = item;
                    let msgtitle = item.operate, message = `是否对【${title}】进行${item.operate}操作？`;
                    if (item.operate === '失效') {
                        message = `失效后，素材【${title}】无法被访问，且无法在专题中展示。`;
                        msgtitle = '失效素材';
                    } else if (item.operate === '有效') {
                        message = `恢复后，素材【${title}】可以被访问，将在专题中展示。`;
                        msgtitle = '恢复素材';
                    }
                    MessageBox.confirm(message, msgtitle, {
                        confirmButtonClass: 'confirmBtn',
                        cancelButtonClass: 'cancelBtn'
                    }).then(_ => {
                        this.$serv.materialDetail({
                            id
                        }).then(res => {
                            const { id, projectId, title, materialAbstract, content } = res;
                            _this.$serv.editMaterial({
                                id, projectId, title, materialAbstract, content,
                                status: statusTo
                            }).then(res => {
                                if (res) {
                                    _this._getSearchData();
                                }
                            });
                        });
                    });
                }
            }
        },
        showImg(link) {
            console.log(link);
            if (link) {
                this.imgSrc = link;
                this.show = true;
            }
        },
        handleSizeChange(val) {
            this.pageSize = val;
        },
        handleCurrentChange(val) {
            this.pageNo = val;
        },
        editMaterial(mode, id) {
            this.$router.push({
                name: 'editMaterial',
                query: {
                    id,
                    mode
                }
            });
        }
    }
};
</script>