<script>
import TableSearch from 'com/TableSearch/TableSearch';
import Alert from 'com/alert/index';
import { MessageBox } from 'element-ui';

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
            pageNo: 1,
            posName: '',
            pageName: '',
            date: '',
            status: '1'
        };
    },
    created() {
        this.getTableData();
    },
    watch: {
        pageSize(val, oldV) {
            this.getTableData();
        },
        pageNo(val, oldV) {
            this.getTableData();
        }
    },
    methods: {
        handleSizeChange(val) {
            this.pageSize = val;
        },
        handleCurrentChange(val) {
            this.pageNo = val;
        },
        getTableData() {
            const params = {};
            params.pageNo = this.pageNo;
            params.pageSize = this.pageSize;
            params.status = '2';
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
            MessageBox.confirm(`确定失效吗。`, '取消失效', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                cancelButtonClass: 'cancelBtn',
                confirmButtonClass: 'confirmBtn'
            }).then(() => {
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
            }).catch(() => {
                    
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
        },
        _getSearchData(){
            const params = {};
            params.posName = this.pageName + '-' + this.posName;
            params.date = this.date;
            params.status = this.status;
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
        rowStyle({ row, rowIndex }) {
            console.log(row);
            if (row.status === 0) {
                return { 'background-color':'grey',color:'#778899' };
            } else {
                return '';
            }
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
        div(style="margin: 30px 0 40px")
            span 页面名称
            el-input(style="width: 140px; margin: 0 20px 0 10px" placeholder="请输入素材ID" v-model="pageName")
            span 推广位名称
            el-input(style="width: 220px; margin: 0 20px 0 10px" placeholder="请输入标题" v-model="posName")
            span 展示周期
            el-date-picker(style="width: 220px; margin: 0 20px 0 10px" type='date' placeholder="请输入日期" value-format="yyyy-MM-dd" v-model="date")
            span 状态
            el-select(v-model="status" style="width: 140px; margin: 0 20px 0 10px")
                el-option(label='全部' value="2")
                el-option(label='正常' value="1")
                el-option(label='失效' value="0")
            el-button(type="primary" @click="_getSearchData") 搜索
        div(style = "width:100%;height:0.5px;background:#D5D5D5;")
        el-table(:data="tableData"  :row-style="rowStyle")
            el-table-column(label="页面名称" prop="pageName"  width="80px" align="center")
            el-table-column(label="推广位名称" prop="posName" width="100px" align="left" header-align="center")
            el-table-column(label="推广位说明" prop="description" header-align="center" align="left")
            el-table-column(label="展示周期" prop="schedule" align="center")
            el-table-column(label="状态" prop="status" width="120px" align="center")
                template(slot-scope="scope")
                    p {{scope.row.status===0?'失效':scope.row.status===1?'正常':''}}
            el-table-column(label="操作" align="center")
                template(slot-scope="scope")
                    el-button(@click="handleCheck(scope.row, 'edit')" size="small") 查看
                    el-button(@click="handleUneffect(scope.row)" size="small" v-if="scope.row.status === 1") 失效
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
<style lang="stylus" scoped>
  .success
    color:''
  .fail
    color:red
    background-color rgb(192,192,192)
</style>
