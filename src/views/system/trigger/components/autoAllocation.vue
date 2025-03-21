<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="分配类型">
            <el-radio-group v-model="trigger.actionContent.assignType">
                <el-radio :value="1">跟随主实体</el-radio>
                <el-radio :value="2" :disabled="(trigger.whenNum & 16)> 0" title="分配时 触发不支持 自定义">自定义</el-radio>
                <el-radio :value="3" :disabled="(trigger.whenNum & 16)> 0" title="分配时 触发不支持 根据字段分配">根据字段分配</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="mt-20" label="分配给谁" v-if="trigger.actionContent.assignType == 2">
            <mlSelectUser v-model="trigger.actionContent.allocationWhos" multiple clearable />
        </el-form-item>
        <el-form-item class="mt-20" label="(多人)分配规则" v-if="trigger.actionContent.assignType == 2">
            <el-radio-group v-model="trigger.actionContent.assignRule">
                <el-radio :value="1">依次平均分配</el-radio>
                <el-radio :value="2">随机分配</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="mt-20" label="分配指定字段" v-if="trigger.actionContent.assignType == 3">
            <el-select
                v-model="trigger.actionContent.assignToField"
                placeholder="请选择分配指定字段"
                style="width: 100%"
                clearable
                filterable
                v-loading="loadUserFieldsLoading"
            >
                <el-option
                    v-for="(op,inx) of userFields"
                    :key="inx"
                    :value="op.fieldName"
                    :label="op.fieldLabel"
                ></el-option>
            </el-select>
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
import { ref, onMounted, inject, watch } from "vue";
import { queryEntityFields } from "@/api/crud";
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
watch(
    () => trigger.value.whenNum,
    () => {
        if (
            (trigger.value.whenNum & 16) > 0 &&
            (trigger.value.actionContent.assignType == 2 || trigger.value.actionContent.assignType == 3)
        ) {
            trigger.value.actionContent.assignType = 1;
        }
    },
    { deep: true }
);
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
    // 获取用户字段
    getUserFields();
});

// 获取 同时分配关联记录 实体列表
const getAssignEntityList = async () => {
    contentLoading.value = true;
    let res = await $API.trigger.detail.getAssignEntityList(
        trigger.value.entityCode
    );
    if (res) {
        assignEntityList.value = res.data;
        if (trigger.value.actionContent.assignTo?.length > 0) {
            let idToIdNameRes = await $API.trigger.detail.idToIdName(
                trigger.value.actionContent.assignTo
            );
            if (idToIdNameRes) {
                trigger.value.actionContent.allocationWhos = idToIdNameRes.data;
            }
        } else {
            trigger.value.actionContent.allocationWhos = [];
        }

    } 
    contentLoading.value = false;
};

let userFields = ref([]);
let loadUserFieldsLoading = ref(false);
const getUserFields = async () => {
    loadUserFieldsLoading.value = false;
    let res = await queryEntityFields(trigger.value.entityCode, true, true, true, true);
    if (res) {
        let formReferenceName = ["User", "Department", "Role", "Team"];
        userFields.value = res.data.filter(el => el.fieldType == "Reference" && formReferenceName.includes(el.referenceName) ||
            el.fieldType == "ReferenceList" && formReferenceName.includes(el.referenceName)
        );
    }
    loadUserFieldsLoading.value = false;
}
</script>

<style>
</style>