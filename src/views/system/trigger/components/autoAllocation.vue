<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="分配类型">
            <el-radio-group v-model="trigger.actionContent.assignType">
                <el-radio :label="1">跟随主实体</el-radio>
                <el-radio :label="2">自定义</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="mt-20" label="分配给谁" v-if="trigger.actionContent.assignType == 2">
            <mlSelectUser v-model="trigger.actionContent.allocationWhos" multiple clearable />
        </el-form-item>
        <el-form-item class="mt-20" label="(多人)分配规则" v-if="trigger.actionContent.assignType == 2">
            <el-radio-group v-model="trigger.actionContent.assignRule">
                <el-radio :label="1">依次平均分配</el-radio>
                <el-radio :label="2">随机分配</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="mt-20" label="同时分配关联记录">
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
    // 初始化分配类型
    if (!trigger.value.actionContent.assignType) {
        trigger.value.actionContent.assignType = 2;
    }
    // 初始化分配规则
    if (!trigger.value.actionContent.assignRule) {
        trigger.value.actionContent.assignRule = 1;
    }
    // 初始化关联记录
    if (!trigger.value.actionContent.cascades) {
        trigger.value.actionContent.cascades = [];
    }
    getAssignEntityList();
});

// 获取 同时分配关联记录 实体列表
const getAssignEntityList = async () => {
    contentLoading.value = true;
    let res = await $API.trigger.detial.getAssignEntityList(
        trigger.value.entityCode
    );
    if (res.code === 200) {
        assignEntityList.value = res.data;
        if (trigger.value.actionContent.assignTo?.length > 0) {
            let idToIdNameRes = await $API.trigger.detial.idToIdName(
                trigger.value.actionContent.assignTo
            );
            if (idToIdNameRes.code == 200) {
                trigger.value.actionContent.allocationWhos = idToIdNameRes.data;
            }
        } else {
            trigger.value.actionContent.allocationWhos = [];
        }

        contentLoading.value = false;
    } else {
        $ElMessage.error("获取同时分配关联记录实体列表数据失败：" + res.error);
        contentLoading.value = false;
    }
};
</script>

<style>
</style>