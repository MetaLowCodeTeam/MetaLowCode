<template>
    <mlSingleList
        ref="mlSingleListRef"
        title="仪表盘"
        mainEntity="Chart"
        fieldsList="chartName,ownerUser,ownerDepartment,modifiedOn,modifiedBy,defaultChart"
        :sortFields="sortFields"
        fieldName="chartName"
        :tableColumn="tableColumn"
    >
        <template #addButton>
            <el-button 
                type="primary" 
                @click="addClick" 
                :disabled="!$TOOL.checkRole('r52-2')"
            >
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
                    <el-switch v-model="scope.row.defaultChart" @change="changeDefault(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="操作" :align="'center'" width="230" fixed="right">
                <template #default="scope">
                    <el-dropdown
                        trigger="click"
                        @command="(command)=> handleCommand(command,scope.row)"
                    >
                        <el-button
                            size="small"
                            type="primary"
                            link
                            style="position: relative;top: 2px;left: -5px;"
                            :disabled="!$TOOL.checkRole('r52-3')"
                        >
                            <span class="mr-3">
                                <el-icon>
                                    <ElIconFilm />
                                </el-icon>
                            </span>
                            <span>设计</span>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="pc">PC</el-dropdown-item>
                                <el-dropdown-item command="mobile">移动端</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-button 
                        size="small" 
                        type="primary" 
                        link 
                        @click="allowOpenDialog(scope.row)"
                        :disabled="!$TOOL.checkRole('r52-5')"
                    >
                        <span class="mr-3">
                            <el-icon>
                                <ElIconShare />
                            </el-icon>
                        </span>
                        <span>分配</span>
                    </el-button>
                    <el-button 
                        size="small" 
                        type="primary" 
                        link 
                        @click="editClick(scope.row)"
                        :disabled="!$TOOL.checkRole('r52-3')"
                    >
                        <span class="mr-3">
                            <el-icon>
                                <ElIconEdit />
                            </el-icon>
                        </span>
                        <span>编辑</span>
                    </el-button>
                    <el-button 
                        size="small" 
                        link 
                        type="primary" 
                        @click="delClick(scope.row)"
                        :disabled="!$TOOL.checkRole('r52-4')"
                    >
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
            <el-form label-width="80px" @submit.prevent>
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
    <!-- 分配 -->
    <Allocation 
        ref="allocationRefs" 
        :layoutConfig="{'idFieldName': 'chartId'}" 
        @allocationSuccess="allocationSuccess" 
    />
</template>
   
<script setup>
import { ref, inject, reactive } from "vue";
import { $fromNow } from "@/utils/util";
import { saveRecord, deleteRecord } from "@/api/crud";
import { updateDefault } from "@/api/chart.js";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import Allocation from "@/views/customize-menu/components/Allocation.vue";
const router = useRouter();
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");

// 默认排序
let sortFields = ref([
    {
        fieldName: "createdOn",
        type: "DESC",
    },
]);
let tableColumn = ref([
    {
        prop: "chartName",
        label: "名称",
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
const delClick = (row) => {
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
    // 新建
    if (!dialogConf.chartId) {
        param.formModel.defaultChart = false;
    }
    let res = await saveRecord(param.entity, param.id, param.formModel);
    if (res) {
        dialogConf.isShow = false;
        mlSingleListRef.value.getTableList();
    }
    mlSingleListRef.value.loading = false;
};

// 默认视图切换
const changeDefault = async (row) => {
    mlSingleListRef.value.loading = true;
    let res = await updateDefault(row.chartId, row.defaultChart);
    if (res) {
        dialogConf.isShow = false;
        mlSingleListRef.value.getTableList();
    }
    mlSingleListRef.value.loading = false;
};

const appPath = import.meta.env.VITE_APP_PATH;
const handleCommand = (command, row) => {
    let routerData = {
        path: appPath + "dashboard-design",
        query: {
            chartId: row.chartId,
            type: command,
        },
    };
    let newUrl = router.resolve(routerData);
    window.open(newUrl.href);
};

/**
 * 分配
 */
let allocationRefs = ref("");

const allowOpenDialog = (row) => {
    allocationRefs.value.openDialog({
        type: "allocation",
        pageType: "dashboardList",
        list: [row],
    });
};

const allocationSuccess = () => {
    mlSingleListRef.value.getTableList();
};
</script>
<style lang="scss" scoped>
</style>