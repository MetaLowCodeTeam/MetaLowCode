<template>
    <ml-dialog :title="labelData.label" v-model="dialogShow" width="560px" append-to-body>
        <div v-loading="loading" class="main" v-if="labelData.type != 'del'">
            <el-form label-width="140px">
                <el-form-item
                    :label="labelData.label + '哪些记录'"
                    class="mb-10"
                    v-if="labelData.pageType == 'list'"
                >选中的记录（{{ formData.list.length }} 条）</el-form-item>
                <el-form-item
                    :label="labelData.label + '给谁'"
                    class="mb-10"
                    v-if="labelData.type != 'unShare'"
                >
                    <mlSelectUser
                        v-if="labelData.type == 'allocation'"
                        type="User"
                        v-model="formData.allocationTo"
                        clearable
                    />
                    <mlSelectUser
                        type="all"
                        v-else
                        v-model="formData.allocationTo"
                        multiple
                        clearable
                    />
                </el-form-item>
                <el-form-item label="取消哪些用户" class="mb-5" v-if="labelData.type == 'unShare'">
                    <div class="w-100">
                        <el-radio-group v-model="formData.userType">
                            <el-radio :label="1">全部用户</el-radio>
                            <el-radio :label="2">指定用户</el-radio>
                        </el-radio-group>
                        <mlSelectUser
                            v-if="formData.userType == 2"
                            type="all"
                            v-model="formData.allocationTo"
                            multiple
                            clearable
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    label=" "
                    v-if="!formData.isAssociatedRecords && labelData.type != 'unShare'"
                    class="mb-5"
                >
                    <span
                        class="ml-a-span"
                        @click="showAssociatedRecords"
                    >同时{{ labelData.label }}关联记录</span>
                </el-form-item>
                <el-form-item label="选择相关记录" v-if="formData.isAssociatedRecords" class="mb-10">
                    <el-select
                        v-model="formData.associatedRecords"
                        multiple
                        filterable
                        class="w-100"
                        value-key="label"
                    >
                        <el-option
                            v-for="item in entityList"
                            :key="item.value"
                            :label="item.label"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label=" " v-if="labelData.type == 'share'">
                    <el-checkbox v-model="formData.withUpdate" label="允许编辑 (不勾选则仅共享读取权限)" />
                </el-form-item>
            </el-form>
        </div>
        <div v-loading="loading" class="del-box" v-else>
            <div class="del-title">
                <span class="del-icon">
                    <el-icon>
                        <ElIconWarnTriangleFilled />
                    </el-icon>
                </span>
                确认删除选中的 {{ formData.list.length }} 条记录？
            </div>
            <div class="mt-10">
                <el-checkbox
                    @change="delRecordsChange"
                    v-model="formData.isAssociatedRecords"
                    label="同时删除关联记录"
                />
            </div>
            <div class="mt-10" v-if="formData.isAssociatedRecords">
                <el-select
                    v-model="formData.associatedRecords"
                    multiple
                    filterable
                    class="w-100"
                    value-key="label"
                >
                    <el-option
                        v-for="item in entityList"
                        :key="item.value"
                        :label="item.label"
                        :value="item"
                    />
                </el-select>
            </div>
        </div>
        <template #footer>
            <el-button @click="dialogShow=false" :loading="loading">取消</el-button>
            <el-button @click="confirm" :loading="loading" type="primary">确定</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { reactive, ref, inject } from "vue";
import { useRouter } from "vue-router";
import { assignRecord, shareRecord, cancelShareRecord,deleteRecords } from "@/api/crud";
const emits = defineEmits("allocationSuccess");
const props = defineProps({
    idFiledName: { type: String, default: "" },
});
const router = useRouter();
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
let dialogShow = ref(false);
let loading = ref(false);
// 分配实体列表
let entityList = ref([]);
let formData = reactive({
    // 分配哪些记录
    list: [],
    // 分配给谁
    allocationTo: [],
    // 同时分配关联记录
    isAssociatedRecords: false,
    // 选择的相关记录
    associatedRecords: [],
    // 取消哪些用户
    userType: 1,
    // 允许编辑
    withUpdate: false,
});
let labelData = reactive({
    type: "",
    label: "",
    pageType:"list",
});
const openDialog = (data) => {
    dialogShow.value = true;
    formData.list = [...data.list];
    formData.allocationTo = [];
    formData.isAssociatedRecords = false;
    formData.associatedRecords = [];
    formData.userType = 1;
    formData.withUpdate = false;
    labelData.type = data.type;
    labelData.pageType = data.pageType;
    labelData.label =
        data.type == "allocation"
            ? "分配"
            : data.type == "share"
            ? "共享"
            : "取消共享";
};

// 删除关联记录切换
const delRecordsChange = async (v) => {
    // console.log(v);
    if (v) {
        showAssociatedRecords();
    }
};

// 同时分配关联记录
const showAssociatedRecords = async () => {
    formData.isAssociatedRecords = true;
    loading.value = true;
    let entityCode = router.currentRoute.value.meta.entityCode;
    let res = await $API.common.queryEntityList(
        entityCode,
        false,
        labelData.type == "share" || labelData.type == "del" ? true : false,
        true
    );
    if (res.code == 200) {
        entityList.value = res.data || [];
    } else {
        $ElMessage.error("获取相关记录失败：" + res.error);
    }
    loading.value = false;
};

// 确认
const confirm = async () => {
    if (
        labelData.type != "unShare" && labelData.type != "del"  && 
        (!formData.allocationTo || formData.allocationTo.length < 1)
    ) {
        $ElMessage.warning("请选择" + labelData.label + "给谁");
        return;
    }

    loading.value = true;
    let res;
    // 分配
    if (labelData.type == "allocation") {
        let param = {
            body: {
                toUser: formData.allocationTo[0].id,
                recordIds: formData.list.map((el) => el[props.idFiledName]),
                cascades: formData.associatedRecords.map((el) => el),
            },
        };
        res = await assignRecord(param.body);
    }
    // 共享
    else if (labelData.type == "share") {
        let param = {
            body: {
                toUsersId: formData.allocationTo.map((el) => el.id),
                recordIds: formData.list.map((el) => el[props.idFiledName]),
                cascades: formData.associatedRecords.map((el) => el),
                withUpdate: formData.withUpdate,
            },
        };
        res = await shareRecord(param.body);
    }
    // 取消共享
    else if (labelData.type == "unShare") {
        let param = {
            body: {
                toUsersId: formData.allocationTo.map((el) => el.id),
                recordIds: formData.list.map((el) => el[props.idFiledName]),
            },
        };
        res = await cancelShareRecord(param.body, formData.userType);
    } 
    // 删除
    else {
        let param = {
            body: {
                recordIds: formData.list.map((el) => el[props.idFiledName]),
                cascades: formData.associatedRecords.map((el) => el),
            },
        };
        res = await deleteRecords(param.body);
    }
    if (res.code == 200) {
        if (res.data > 0) {
            $ElMessage.success(`成功${labelData.label} ${res.data} 条记录`);
        } else {
            $ElMessage.success(`${labelData.label}成功`);
        }
        emits("allocationSuccess");
        dialogShow.value = false;
    } else {
        $ElMessage.error(`${labelData.label}失败：${res.error}`);
    }
    loading.value = false;
};

defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
.main {
    line-height: 0;
    padding-right: 60px;
}
.del-box {
    line-height: 0;
    text-align: center;
    padding: 0 60px;
    .del-title {
        font-weight: bold;
        .del-icon {
            font-size: 24px;
            color: #ea4335;
            position: relative;
            top: 6px;
        }
    }
}
</style>