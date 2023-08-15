<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="TriggerConfig"
        aciveId="triggerConfigId"
        fieldsList="name,entityCode,actionType,actionContent,priority,isDisabled,modifiedOn"
        @goDetial="goDetial"
        :checkCodes="['actionType','name']"
        :codeErrMsg="['请选择触发器','请输入名称']"
        :showFormItem="[{'label':'名称','code':'name','type':'1'}]"
        from-entity-label="请选择源实体"
        :tableColumn="tableColumn"
        defalutSortField="modifiedOn"
        defaultFilter="name"
    >
        <template #addbutton>
            <el-button type="primary" @click="addClick">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
        <template #formitem="{dialogForm}">
            <el-form-item label="选择触发器">
                <el-select
                    v-model="dialogForm.form.actionType"
                    placeholder="请选择触发器"
                    style="width: 80%;"
                >
                    <el-option
                        :label="op.label"
                        :value="op.code"
                        v-for="(op,inx) of triggerList"
                        :key="inx"
                    />
                </el-select>
            </el-form-item>
        </template>
    </mlEntityMenuAndList>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
let mlEntityMenuAndListRef = ref("");
let tableColumn = ref([
    {
        prop: "name",
        label: "名称",
        sortable: true,
        highlight: true,
    },
    {
        prop: "entityCode",
        label: "源实体",
        entityCode: true,
        sortable: true,
    },
    {
        prop: "actionType",
        label: "触发类型",
        align: "center",
        needField:"label",
    },
    {
        prop: "actionContent",
        label: "触发动作",
        align: "center",
        customSolt: "actionContent",
    },
    {
        prop: "isDisabled",
        label: "启用",
        align: "center",
        width: 60,
        isDisabled: true,
    },
    {
        prop: "modifiedOn",
        label: "修改时间",
        align: "center",
        width: 100,
        fromNow: true,
    },
]);
let triggerList = ref([
    {
        label: "字段更新",
        code: 1,
    },
    {
        label: "字段聚合",
        code: 2,
    },
    {
        label: "数据效验",
        code: 4,
    },
    {
        label: "发送通知",
        code: 5,
    },
    {
        label: "自动审批",
        code: 6,
    },
    {
        label: "自动撤销审批",
        code: 7,
    },
    {
        label: "自动删除",
        code: 12,
    },
    {
        label: "回调URL",
        code: 14,
    },
]);
// 添加触发
const addClick = () => {
    mlEntityMenuAndListRef.value.editApproval("add");
};

// 跳转详情
const goDetial = (row) => {
    console.log(row)
};
</script>

<style>
</style>