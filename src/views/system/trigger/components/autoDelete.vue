<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="删除记录">
            <el-select
                v-model="trigger.actionContent.items"
                multiple
                placeholder="选择删除记录"
                style="width: 100%"
                clearable
                filterable
                value-key="label"
            >
                <el-option
                    v-for="(op,inx) of dataDeleteEntityList"
                    :key="inx"
                    :value="op"
                    :label="op.label"
                ></el-option>
            </el-select>
            <div class="w-100 info-text mt-5">可删除源实体记录或其关联记录</div>
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
let dataDeleteEntityList = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;
    getDataDeleteEntityList();
});



// 获取删除记录实体列表
const getDataDeleteEntityList = async () => {
    contentLoading.value = true;
    let res = await $API.trigger.detail.getDataDeleteEntityList(
        trigger.value.entityCode
    );
    if (res) {
        dataDeleteEntityList.value = res.data;
    } 
    contentLoading.value = false;
};
</script>

<style>
</style>