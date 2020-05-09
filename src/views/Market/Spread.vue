<script>
import TableSearch from 'com/TableSearch/TableSearch';
import Alert from 'com/alert/index';

export default {
    components: {
        TableSearch
    },
    data() {
        return {
            getDataAPI: this.$serv.adList,
            type:1,
            tableData:[],
            pageSize: 10,
            pageNo: 1
        };
    },
    activated() {
        this.getTableData();
    },
    methods: {
        getTableData() {
            const params = {};
            params.pageNo = this.pageNo;
            params.pageSize = this.pageSize;
            this.$serv.adList(params).
                then(res=>{
                    if(res){
                        this.tableData = res.list;
                        return;
                    }
                    Alert({
                        type: 'error',
                        message: '推广列表失败'
                    });
                });
        },
        handleUneffect(row) {
            const params = {};
            params.adUnitId = row.adUnitId;
            this.$serv.adUneffect(params).
                then(res=>{
                    if(res){
                        if(res.code==200&&res.msg=='success'){
                            console.log("失效成功");
                            return;
                        }
                    }
                    Alert({
                        type: 'error',
                        message:  '失效失败'
                    });
                    console.log('失效失败');
                });
        },
        handleCheck(row) {
            this.mode = 'check';
            this.$router.push({
                // path: 'market/spreadAdd',
                name:'spreadAdd',
                params: {
                    mode: this.mode,
                    row: row
                }
            });
        },
        handleCreate(id, mode) {
            this.$router.push({
                // path: '/market/spreadAdd',
                name:'spreadAdd',
                params: {
                    mode: mode
                }
            });
        }
    }
};
</script>
<template lang="pug">
    div(style="margin: 30px 20px 0")
        div(style="margin: 27px 0 27px; display:flex; justify-content:space-between; align-items:center;")
            div
                span.iconExplain
                span(style="font-size: 14px; color: #333") 使用推广管理功能，系统将根据展示周期，为您自动上下线推广活动。
            el-button(class = "newpropgation"
                        type="primary"
                        @click="handleCreate(null, 'create')"
                        ) 创建新推广
        div(style = "width:100%;height:0.5px;background:#D5D5D5;")
        el-table(:data="tableData" border)
            el-table-column(label="页面名称" prop="pageName" width="80px" align="center")
            el-table-column(label="推广位名称" prop="posName" width="100px" align="left" header-align="center")
            el-table-column(label="推广位说明" prop="description" header-align="center" align="left")
            el-table-column(label="展示周期" prop="schedule" align="center")
            el-table-column(label="状态" prop="status" width="120px" align="center")
                template(slot-scope="scope")
                    p {{scope.row.status===3?'主推':scope.row.status===2?'隐藏':'正常'}}
            el-table-column(label="操作" align="center")
                template(slot-scope="scope")
                    el-button(@click="handleCheck(scope.row, 'edit')" size="small") 查看
                    el-button(@click="handleUneffect(scope.row)" size="small" v-if="scope.row.status !== 3") 失效
        el-pagination(
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="pageNo"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total")
            div(slot="operate"  slot-scope="scope" style = "margin-left:10px")
                <el-button type="primary"  class = "search_button" >搜索</el-button>

</template>
<style lang="scss" scope></style>
