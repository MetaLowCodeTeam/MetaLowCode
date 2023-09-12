<template>
    <ml-dialog title="数据导出" v-model="dialogShow" width="500px">
        <div v-loading="loading">
            <div class="lable-title mb-3">选择数据范围</div>
            <div class="mb-10 mt-10">
                <el-radio-group class="radio-need-block" v-model="selection">
                    <el-radio :label="1">当前页的记录 (共 {{ formData.size }} 条)</el-radio>
                    <el-radio :label="2">查询后的记录 (共 {{ formData.total }} 条)</el-radio>
                    <el-radio :label="3">全部数据</el-radio>
                </el-radio-group>
            </div>
        </div>
        <template #footer>
            <el-button @click="dialogShow=false" :loading="loading">取消</el-button>
            <el-button @click="exportFn" :loading="loading" type="primary">导出</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { reactive, ref, inject } from "vue";
import axios from "axios";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
let dialogShow = ref(false);
let loading = ref(false);
let formData = reactive({});
let selection = ref(1);

const openDialog = (data) => {
    dialogShow.value = true;
    formData = { ...data };
};

const exportFn = async () => {
    let queryParm = { ...formData.queryParm };
    if (selection.value == 2) {
        queryParm.pageSize = formData.total;
    }
    if (selection.value == 3) {
        queryParm.pageNo = null;
        queryParm.pageSize = null;
    }
    loading.value = true;
    let res = await $API.layoutConfig.excelDataExcel(queryParm);
    if(res && res.code == 200){
        window.open(import.meta.env.VITE_API_SERVER + "/excelData/downloadExcelFile?key=" + res.data)
        $ElMessage.success("导出成功！")
        loading.value = false;
    }else {
        $ElMessage.error("导出失败：" + res.error);
        loading.value = false;
    }
   

};


defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
.lable-title {
    font-size: 14px;
    font-weight: bold;
    color: #666;
}
</style>