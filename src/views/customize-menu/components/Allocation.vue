<template>
    <ml-dialog title="数据导出" v-model="dialogShow" width="500px">
        <div v-loading="loading" class="main pr-30">
            <el-form label-width="120px">
                <el-form-item label="分配哪些记录" class="mb-10">选中的记录（{{ formData.list.length }} 条）</el-form-item>
                <el-form-item label="分配给谁" class="mb-10">
                    <mlSelectUser type="User" v-model="formData.allocationTo" clearable />
                </el-form-item>
                <el-form-item label=" " v-if="!formData.isAssociatedRecords">
                    <span class="ml-a-span" @click="showAssociatedRecords">同时分配关联记录</span>
                </el-form-item>
                <el-form-item label="选择相关记录" v-if="formData.isAssociatedRecords">
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
            </el-form>
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
import { assignRecord } from "@/api/crud";
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
});
const openDialog = (data) => {
    dialogShow.value = true;
    formData.list = [...data];
};

// 同时分配关联记录
const showAssociatedRecords = async () => {
    formData.isAssociatedRecords = true;
    loading.value = true;
    let entityCode = router.currentRoute.value.meta.entityCode;
    let res = await $API.common.queryEntityList(entityCode, false, false, true);
    if (res.code == 200) {
        entityList.value = res.data || [];
    } else {
        $ElMessage.error("获取相关记录失败：" + res.error);
    }
    loading.value = false;
};

// 确认
const confirm =async () => {
    if (!formData.allocationTo || formData.allocationTo.length < 1) {
        $ElMessage.warning("请选择分配给谁");
        return;
    }
    let param = {
        body: {
            toUser: formData.allocationTo[0].id,
            recordIds: formData.list.map((el) => el.demoCompanyId),
            cascades: formData.associatedRecords.map((el) => el),
        },
    };
    loading.value = true;
    let res = await assignRecord(param.body);
    if(res.code == 200){
        if(res.data > 0){
            $ElMessage.success("成功分配 " + res.data + " 条记录")
        }else {
            $ElMessage.success("分配成功")
        }
        dialogShow.value = false;
    }else {
        $ElMessage.error("分配失败：" + res.error)
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
}
</style>