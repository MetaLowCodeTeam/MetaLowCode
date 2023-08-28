<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="删除记录">
            <el-select
                v-model="trigger.actionContent.sendTo"
                multiple
                placeholder="选择删除记录"
                style="width: 100%"
                clearable
                filterable
            >
                <el-option v-for="(op,inx) of dataDeleteEntityList" :key="inx" :value="op" :label="op.label"></el-option>
            </el-select>
        </el-form-item>
    </div>
</template>

<script setup>
import { ref, onMounted,inject } from "vue";
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
let dataDeleteEntityList = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;
    getDataDeleteEntityList();
});

// 获取删除记录实体列表
const getDataDeleteEntityList= async ()=>{
    contentLoading.value = true;
    let res =await $API.trigger.detial.getDataDeleteEntityList(trigger.value.entityCode);
    if (res.code === 200) {
        dataDeleteEntityList.value = res.data;
    } else {
        $ElMessage.error("获取删除记录实体列表数据失败：" + res.error);
    }
    contentLoading.value = false;
}
</script>

<style>
</style>