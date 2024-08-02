<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item
            style="margin-bottom: 20px;"
            label="共享类型"
            v-if="trigger.actionType?.value == 9"
        >
            <el-radio-group v-model="trigger.actionContent.type">
                <el-radio :label="1">共享给指定人</el-radio>
                <el-radio :label="2">共享给指定字段</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item
            style="margin-bottom: 20px;"
            label="共享给谁"
            v-if="trigger.actionType?.value == 9 && trigger.actionContent.type == 1"
        >
            <mlSelectUser v-model="trigger.actionContent.toUsersId" multiple clearable />
        </el-form-item>
        <el-form-item
            style="margin-bottom: 20px;"
            label="共享指定字段"
            v-if="trigger.actionType?.value == 9 && trigger.actionContent.type == 2"
        >
         <el-select
                v-model="trigger.actionContent.toUserFields"
                multiple
                placeholder="请选择共享指定字段"
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
        <el-form-item :label="trigger.actionType?.value == 9 ? '同时共享关联记录' : '取消共享记录'">
            <el-select
                v-model="trigger.actionContent.items"
                multiple
                :placeholder="'选择关联实体' + trigger.actionType?.value == 9 ? '(可选)' : ''"
                style="width: 100%"
                clearable
                filterable
                value-key="label"
            >
                <el-option
                    v-for="(op,inx) of associatedRecords"
                    :key="inx"
                    :value="op"
                    :label="op.label"
                ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label=" ">
            <div class="w-100 mt-15" v-if="trigger.actionType?.value == 9">
                <el-checkbox v-model="trigger.actionContent.withUpdate" label="允许编辑 (不勾选则仅共享读取权限)" />
            </div>
            <div v-else class="w-100 info-text mt-5">可取消共享源实体记录或其关联记录</div>
        </el-form-item>
       
        <el-form-item
            style="margin-top: 20px;"
            label="取消哪些用户"
            v-if="trigger.actionType?.value == 10"
        >
            <mlSelectUser v-model="trigger.actionContent.toUsersId" multiple clearable />
            <div class="w-100 info-text mt-5">不选择则取消所有用户的</div>
        </el-form-item>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
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
let associatedRecords = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;
    if (!trigger.value.actionContent.toUsersId) {
        trigger.value.actionContent.toUsersId = [];
    }
    if (!trigger.value.actionContent.toUserFields) {
        trigger.value.actionContent.toUserFields = [];
    }
    if (!trigger.value.actionContent.type) {
        trigger.value.actionContent.type = 1;
    }
    getAssociatedRecords();
    // 获取用户字段
    getUserFields();
});

// 获取关联记录
const getAssociatedRecords = async () => {
    contentLoading.value = true;
    let res = await $API.common.queryEntityList(
        trigger.value.entityCode,
        false,
        true,
        true,
        false, false, 2
    );
    if (res) {
        associatedRecords.value = res.data;
    } 
    contentLoading.value = false;
};

let userFields = ref([]);
let loadUserFieldsLoading = ref(false);
const getUserFields = async () => {
    loadUserFieldsLoading.value = false;
    let res = await queryEntityFields(trigger.value.entityCode, false, true, true);
    if (res) {
        userFields.value = res.data.filter(el => el.fieldType == "Reference" && el.referenceName == "User");
    }
    loadUserFieldsLoading.value = false;
}
</script>

<style>
</style>