<template>
    <ml-dialog title="数据导出" v-model="dialogShow" width="500px">
        <div v-loading="loading">
            <div class="label-title mb-3">选择数据范围</div>
            <div class="mb-10 mt-10">
                <el-radio-group class="radio-need-block" v-model="selection">
                    <el-radio :value="1">当前页的记录 (共 {{ formData.size }} 条)</el-radio>
                    <el-radio :value="2">查询后的记录 (共 {{ formData.total }} 条)</el-radio>
                    <el-radio :value="3">全部数据</el-radio>
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
    let queryParm = JSON.parse(JSON.stringify(formData.queryParm));
    if (selection.value == 2) {
        queryParm.pageSize = formData.total;
    }
    if (selection.value == 3) {
        queryParm.pageNo = null;
        queryParm.pageSize = null;
    }
    if(formData.noExportColumns.length > 0) {
        let newFieldsList = [];
        let oldFieldsList = queryParm.fieldsList.split(',');
        oldFieldsList.forEach(el => {
            if(formData.noExportColumns.includes(el)) {
                return
            }
            newFieldsList.push(el);
        })
        queryParm.fieldsList = newFieldsList.join(',');
    }
    loading.value = true;
    let res = await $API.layoutConfig.excelDataExcel(queryParm);
    if(res){
        window.open(import.meta.env.VITE_APP_BASE_API + "/excelData/downloadExcelFile?key=" + res.data)
        $ElMessage.success("导出成功！")
    }
    loading.value = false;

};


defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>

.label-title {
    font-size: 14px;
    font-weight: bold;
    color: #666;
    line-height: 24px;
}
</style>