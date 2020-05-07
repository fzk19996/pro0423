<script>
import TableSearch from 'com/TableSearch/TableSearch';
import PopUpdate from './PopUpdate';
import ShowImage from 'com/ShowImage';
import DateUtil from 'lib/date';

import operUpdate from './operUpdate';
import indexMenu from './index/indexMenu';

import { DefaultPhotoDomain, DefaultPhoto220x165 } from 'conf/domain';
import {
    posCleaEnum
} from 'conf/enum';

export default {
    components: {
        TableSearch,
        PopUpdate,
        ShowImage,
        operUpdate,
        indexMenu
    },
    data() {
        return {
            active: 'home',
            dialog: {
                update: {
                    visible: false,
                    posId: ''
                },
                look: {
                    visible: false,
                    data: {
                        src: '',
                        alt: ''
                    }
                }
            },
            getDataAPI: this.$serv.opList,
            // 筛选项配置
            searchConfig: {
                data: [
                    {
                        model: 'projectId',
                        modelValue: this.$store.state.userInfo.projectId
                    }
                ]
            },
            // 表格配置
            tableConfig: [
                {
                    label: '运营位名称',
                    prop: 'name'

                },
                {
                    label: '运营位描述',
                    prop: 'description',
                    align: 'left'
                },
                {
                    label: '最近更新时间',
                    prop: 'updateTime',
                    width: 200,
                    format(v) {
                        return DateUtil.format(new Date(v), 'yyyy-MM-dd hh:mm:ss');
                    }
                },
                {
                    label: '操作人',
                    prop: 'lastModifyAccount'
                },
                {
                    label: '操作',
                    width: 100,
                    render: (h, scope) => <el-button type="primary" size="small" on-click={() => this.handleUpdate(scope.row)}>更新</el-button>
                },
                {
                    label: '是否可清除',
                    prop: 'clearEnable',
                    width: 100,
                    format(val) {
                        return posCleaEnum[val];
                    }
                }
            ]
        };
    },
    methods: {
    // 更新
        handleUpdate(item) {
            // if (item.status === 1) {
            //     // 不可用
            //     this.$notifyErr('正处于广告展示期，无法进行操作！');
            //     return;
            // }
            this.dialog.update.posId = item.posId;
            this.dialog.update.visible = true;
        },
        // 点击查看
        handleLook(item) {
            this.dialog.look.data.src = item.previewUrl
                ? item.previewUrl
                : `${DefaultPhotoDomain}${DefaultPhoto220x165}`;
            this.dialog.look.data.alt = item.posName;
            this.dialog.look.visible = true;
        },
        confirmUpdateCb() {
            this.$refs.table.search();
        },
        handleEdit(index, row) {
            console.log(index, row);
            console.log(this.items);
        }
    },
    mounted() {
        
    }
};
</script>
<template lang="pug">
    div(style="margin: 30px 20px 0")
        el-tabs(v-model="active" type="card")
            el-tab-pane(label="首页菜单管理" name="home")
                indexMenu
            el-tab-pane(label="首页内容推荐" name="recommend")
                div(style="margin: 25px 0 20px")
                    span.iconExplain
                    span(style="font-size: 14px; color: #333") 小程序首页内容管理
                table-search(
                    ref="table"
                    :hidePagenation="true"
                    :searchConfig="searchConfig"
                    :tableConfig="tableConfig"
                    :getDataAPI="getDataAPI"
                    )
                    div(slot="operate"  slot-scope="scope")


                //- pop-update(
                //-   :visible.sync="dialog.update.visible"
                //-   :posId="dialog.update.posId"
                //-   @confirmCb="confirmUpdateCb"
                //- )
                oper-update(
                :visible.sync="dialog.update.visible"
                :posId="dialog.update.posId"
                @confirmCb="confirmUpdateCb"
                )
                show-image(
                :visible.sync="dialog.look.visible"
                :dialogData="dialog.look.data"
                )
        div(style="height: 40px")
</template>
<style lang="scss" scope>
</style>
