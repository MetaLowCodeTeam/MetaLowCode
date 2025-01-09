<template>
    <mlSingleList
        ref="mlSingleListRef"
        title="API秘钥"
        mainEntity="MetaApi"
        fieldsList="appId,appSecret,bindUser,isDeleted,createdBy,createdOn"
        :sortFields="sortFields"
        fieldName="appid"
        :tableColumn="tableColumn"
        @changeSwitch="changeSwitch"
    >
        <template #addButton>
            <el-button type="primary" @click="addClick">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100" fixed="right">
                <template #default="scope">
                    <!-- <el-button size="small" type="primary" link @click="editClick(scope.row)">
                        <span class="mr-3">
                            <el-icon>
                                <ElIconEdit />
                            </el-icon>
                        </span>
                        <span>编辑</span>
                    </el-button>-->
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
    <!-- 列表页面新增、编辑通用弹框 -->
    <ml-dialog v-model="mlDialogConf.isShow" :title="mlDialogConf.title" width="30%">
        <el-form label-width="120px" v-loading="mlDialogConf.loading" @submit.prevent>
            <el-form-item label="绑定用户">
                <mlSelectUser
                    v-model="mlDialogConf.bindUser"
                    type="User"
                    clearable
                    style="width: 80%;"
                />
            </el-form-item>
            <el-form-item>
                <el-button @click="saveApiKey" type="primary">保存</el-button>
                <el-button @click="mlDialogConf.isShow = false">取消</el-button>
            </el-form-item>
        </el-form>
    </ml-dialog>
</template>
   
<script setup>
import { ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
import { saveRecord, deleteRecord } from "@/api/crud";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import http from "@/utils/request";
const router = useRouter();
const $ElMessage = inject("$ElMessage");

// 默认排序
let sortFields = ref([
    {
        fieldName: "createdOn",
        type: "DESC",
    },
]);
let tableColumn = ref([
    {
        prop: "appId",
        label: "appId",
        align: "center",
        width: 250,
    },
    {
        prop: "appSecret",
        label: "appSecret",
        align: "center",
        columnType: "password",
        actionBtnShow: true,
    },
    {
        prop: "bindUser.name",
        label: "绑定用户",
        align: "center",
        formatter: (row) => {
            return row.bindUser?.name;
        },
        width: 120,
    },
    // {
    //     prop: "isDisabled",
    //     label: "启用",
    //     align: "center",
    //     customSlot: "switch",
    //     isNegation: true,
    //     width: 80,
    // },
    {
        prop: "createdOn",
        label: "创建时间",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.modifiedOn);
        },
        width: 160,
    },
    {
        prop: "createdBy.name",
        label: "创建用户",
        align: "center",
        formatter: (row) => {
            return row.createdBy?.name;
        },
        width: 160,
    },
]);

// 添加触发
let mlDialogConf = ref({
    isShow: false,
    bindUser: [],
    title: "",
    loading: false,
});

// 新增
const addClick = () => {
    mlDialogConf.value.isShow = true;
    mlDialogConf.value.title = "添加API秘钥";
    mlDialogConf.value.bindUser = [];
    mlDialogConf.value.loading = false;
};
// 编辑
const editClick = (row) => {
    // dialogConf.isShow = true;
    // dialogConf.chartName = row.chartName;
    // dialogConf.chartId = row.chartId;
    // dialogConf.title = "编辑仪表盘";
};
// 删除
const delCick = (row) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await deleteRecord(row.metaApiId);
            mlSingleListRef.value.loading = true;
            if (res) {
                $ElMessage.success("删除成功");
                mlSingleListRef.value.getTableList();
            }
            mlSingleListRef.value.loading = false;
        })
        .catch(() => {});
};

const saveApiKey = async () => {
    let { bindUser } = mlDialogConf.value;
    if (bindUser.length < 1) {
        ElMessage.error("请选择绑定用户");
        return;
    }
    mlDialogConf.value.loading = true;

    let res = await http.post("/metaApiConfig/saveRecord?id=", {
        bindUser: bindUser[0].id,
    });
    if (res) {
        ElMessage.success("添加成功");
        mlSingleListRef.value.getTableList();
        mlDialogConf.value.isShow = false;
    }
    mlDialogConf.value.loading = false;
    // let tempForm = { ...row };
    // tempForm.bindUser = row.bindUser.id;
    // let res = await http.post(
    //     "/metaApiConfig/saveRecord?id=" + tempForm.metaApiId,
    //     tempForm
    // );
    // console.log(res, "res");
    // if (res) {
    //     ElMessage.success("切换成功");
    // }
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
const changeSwitch = async (row) => {
    mlSingleListRef.value.loading = true;

    let tempForm = { ...row };
    tempForm.bindUser = row.bindUser.id;
    let res = await http.post(
        "/metaApiConfig/saveRecord?id=" + tempForm.metaApiId,
        tempForm
    );
    console.log(res, "res");
    if (res) {
        ElMessage.success("切换成功");
    }
    mlSingleListRef.value.loading = false;
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