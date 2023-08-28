<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="分配类型">
            <el-radio-group v-model="trigger.actionContent.assignType">
                <el-radio :label="1">轮询分配</el-radio>
                <el-radio :label="6">Option B</el-radio>
                <el-radio :label="9">Option C</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="同时分配关联记">
            <el-select
                v-model="trigger.actionContent.cascades"
                multiple
                placeholder="选择关联实体"
                style="width: 100%"
                clearable
                filterable
                value-key="label"
            >
                <el-option
                    v-for="(op,inx) of assignEntityList"
                    :key="inx"
                    :value="op"
                    :label="op.label"
                ></el-option>
            </el-select>
        </el-form-item>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);
// 数据源
let trigger = ref({
    actionContent: {},
});
let assignEntityList = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;
    getAssignEntityList();
});

// 获取 同时分配关联记录 实体列表
const getAssignEntityList = async () => {
    contentLoading.value = true;
    let res = await $API.trigger.detial.getAssignEntityList(
        trigger.value.entityCode
    );
    if (res.code === 200) {
        assignEntityList.value = res.data.filter((el) => el.fieldName);
    } else {
        $ElMessage.error("获取同时分配关联记录实体列表数据失败：" + res.error);
    }
    contentLoading.value = false;
};
</script>

<style>
</style>