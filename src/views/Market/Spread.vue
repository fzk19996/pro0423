<script>
import TableSearch from 'com/TableSearch/TableSearch';

export default {
    components: {
        TableSearch
    },
    data() {
        return {
            getDataAPI: this.$serv.opList,
            type:1,
            // 筛选项配置
            searchConfig: {
                data: [
                    {
                        model: 'projectId',
                        modelValue: this.$store.state.userInfo.projectId
                    },
                    {
                        type: 'input',
                        title: '页面名称',
                        model: 'page',
                        modelValue: '',
                        placeholder: '请输入页面名称'
                    },
                    {
                        type: 'input',
                        title: '推广位名称',
                        model: 'op',
                        modelValue: '',
                        placeholder: '请输入推广位名称'
                    },
                    {
                        type: 'date',
                        title: '展示周期',
                        model: 'date',
                        modelValue: '',
                        placeholder: '选择日期'
                    },
                    {
                        type: 'select',
                        selectType: 'keyValue',
                        title: '状态',
                        model: 'role',
                        modelValue: 0,
                        placeholder: '正常',
                        list: {
                            0: '正常',
                            1: '全部',
                            2: '失效'
                        }
                    }
                ]
            },
            // 表格配置
            tableConfig: [
                {
                    label: '推广位名称',
                    prop: 'description',
                    align: 'left',
                    width: 250
                },
                {
                    label: '推广位说明',
                    prop: 'updateTime',
                    align: 'left',
                    width: 300
                },
                {
                    label: '展示周期',
                    prop: 'name',
                    width: 280
                },
                {
                    label: '状态',
                    prop: 'status',
                    width:110
                },
                {
                    label: '操作',
                    
                    render: (h, scope) => 
                        <div>
                            <el-button type="primary" size="mini" on-click={() => this.handleAdd(scope.row)}>新建</el-button>
                            <el-button type="primary" size="mini" on-click={() => this.handleCheck(scope.row)}>查看</el-button>
                        </div>
                }
            ]
        };
    },
    methods: {
        handleAdd(row) {
            this.mode = 'create';
            this.$router.push({
                name: 'spreadAdd',
                params: {
                    mode: this.mode,
                    row: row
                }
            });
        },
        handleCheck(row) {
            this.mode = 'check';
            console.log(row.updateTime);
            this.$router.push({
                name: 'spreadAdd',
                params: {
                    mode: this.mode,
                    row: row
                }
            });
        },
        edit(id, mode) {
            this.$router.push({
                name: 'spreadAdd',
                query: {
                    id,
                    mode
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
                        @click="edit(null, 'create')"
                        ) 创建新推广
        div(style = "width:100%;height:0.5px;background:#D5D5D5;")
        table-search(
            ref="table"
            :searchConfig="searchConfig"
            :tableConfig="tableConfig"
            :getDataAPI="getDataAPI"
        )
            div(slot="operate"  slot-scope="scope" style = "margin-left:10px")
                <el-button type="primary"  class = "search_button" >搜索</el-button>

</template>
<style lang="scss" scope></style>
