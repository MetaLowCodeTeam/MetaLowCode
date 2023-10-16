<template>
    <mlSingleList
        ref="mlSingleListRef"
        title="仪表盘"
        mainEntity="Chart"
        fieldsList="chartName,ownerUser,ownerDepartment,modifiedOn,modifiedBy,default"
        :sortFields="sortFields"
        fieldName="chartName"
        :tableColumn="tableColumn"
        :filterItems="filterItems"
        @highlightClick="highlightClick"
    >
        <template #addbutton>
            <!-- <el-button type="primary" @click="markAllRead">全部设为已读</el-button> -->
            <el-button type="primary" @click="addClick">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
        <template #activeRow>
            <!-- default -->
            <el-table-column label="默认视图" :align="'center'" width="100">
                <template #default="scope">
                    <el-switch v-model="scope.row.default" @change="changeDefault"/>
                </template>
            </el-table-column>
            <el-table-column label="操作" :align="'center'" width="140" fixed="right">
                <template #default="scope">
                    <el-button size="small" type="primary" link @click="editClick(scope.row)">
                        <span class="mr-3">
                            <el-icon>
                                <ElIconEdit />
                            </el-icon>
                        </span>
                        <span>编辑</span>
                    </el-button>
                    <el-button size="small" link type="primary" @click="delCick(scope.row)">
                        <span class="mr-3">
                            <el-icon>
                                <ElIconDelete />
                            </el-icon>
                        </span>
                        <span>删除</span>
                    </el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
    <ml-dialog :title="dialogConf.title" v-model="dialogConf.isShow" width="600">
        <div style="padding-right: 60px;">
            <el-form label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="dialogConf.chartName" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onConfirm">确定</el-button>
                    <el-button @click="dialogConf.isShow = false">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </ml-dialog>
</template>
   
<script setup>
import { ref, inject, reactive } from "vue";
import { $fromNow } from "@/utils/util";
import { saveRecord, deleteRecord } from "@/api/crud";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();
const $ElMessage = inject("$ElMessage");

// 默认排序
let sortFields = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);
// 过滤条件
let filterItems = ref([]);
let tableColumn = ref([
    {
        prop: "chartName",
        label: "名称",
        highlight: true,
    },

    {
        prop: "modifiedOn",
        label: "修改时间",
        formatter: (row) => {
            return $fromNow(row.modifiedOn);
        },
    },
    {
        prop: "modifiedBy.name",
        label: "修改用户",
        formatter: (row) => {
            return row.modifiedBy?.name;
        },
    },
    {
        prop: "ownerUser.name",
        label: "所属用户",
        formatter: (row) => {
            return row.ownerUser?.name;
        },
    },
    {
        prop: "ownerDepartment.name",
        label: "所属部门",
        formatter: (row) => {
            return row.ownerDepartment?.name;
        },
    },
]);



// 添加触发
let dialogConf = reactive({
    isShow: false,
    chartName: "",
    chartId: "",
    title: "",
});

// 新增
const addClick = () => {
    dialogConf.isShow = true;
    dialogConf.chartName = "";
    dialogConf.chartId = "";
    dialogConf.title = "新建仪表盘";
};
// 编辑
const editClick = (row) => {
    dialogConf.isShow = true;
    dialogConf.chartName = row.chartName;
    dialogConf.chartId = row.chartId;
    dialogConf.title = "编辑仪表盘";
};
// 删除
const delCick = (row) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await deleteRecord(row.chartId);
            mlSingleListRef.value.loading = true;
            if (res) {
                $ElMessage.success("删除成功");
                mlSingleListRef.value.getTableList();
            }
            mlSingleListRef.value.loading = false;
        })
        .catch(() => {});
};

// 确认
let mlSingleListRef = ref();
const onConfirm = async () => {
    mlSingleListRef.value.loading = true;
    let param = {
        entity: "Chart",
        formModel: { chartName: dialogConf.chartName },
        id: dialogConf.chartId,
    };
    let res = await saveRecord(param.entity, param.id, param.formModel);
    if (res) {
        dialogConf.isShow = false;
        mlSingleListRef.value.getTableList();
    }
    mlSingleListRef.value.loading = false;
};

// 默认视图切换
const changeDefault = async ()=>{
    // mlSingleListRef.value.loading = true;
    mlSingleListRef.value.getTableList();
}

// 高亮字段点击
const highlightClick = (row) => {
    let routerData = {
        path: "/web/dashboard-design",
        query: {
            chartId: row.chartId,
        },
    };
    router.push(routerData);
};
</script>
<style lang="scss" scoped>
</style>