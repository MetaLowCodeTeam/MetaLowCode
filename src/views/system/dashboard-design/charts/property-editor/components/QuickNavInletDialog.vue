<template>
    <mlDialog title="添加快捷入口" v-model="isShow" width="480px">
        <div v-loading="loading">
            <el-tabs v-model="cutMenu.type">
                <el-tab-pane label="关联项" :name="1"></el-tab-pane>
                <el-tab-pane label="外部地址" :name="2"></el-tab-pane>
                <el-tab-pane label="自定义页面" :name="3"></el-tab-pane>
            </el-tabs>
            <div v-if="cutMenu.type == 1" class="content-box">
                <el-select
                    v-model="cutMenu.entityCode"
                    filterable
                    placeholder="选择关联项"
                    class="w-100"
                    @change="associationChange"
                    size="default"
                >
                    <el-option-group
                        v-for="group in getGroupEntityList()"
                        :key="group.label"
                        :label="group.label"
                    >
                        <el-option
                            v-for="(op,inx) of group.options"
                            :key="inx"
                            :value="op.entityCode"
                            :label="op.label"
                        />
                    </el-option-group>
                </el-select>
            </div>
            <div class="mt-10 content-box">
                <el-input
                    v-model="cutMenu.name"
                    placeholder="入口名称"
                    class="ml-el-select-input"
                    clearable
                    size="default"
                >
                    <template #prepend>
                        <span class="select-icon-span" title="选择图标" @click="openSelectIconDialog">
                            <el-icon class="icon" v-if="!cutMenu.useIcon">
                                <SetUp />
                            </el-icon>
                            <el-icon class="icon" v-else :color="cutMenu.iconColor">
                                <component :is="cutMenu.useIcon" />
                            </el-icon>
                        </span>
                    </template>
                </el-input>
            </div>
        </div>
        <template #footer>
            <div class="footer-div">
                <el-button @click="isShow = false" :loading="loading" size="default">取消</el-button>
                <el-button type="primary" @click="layoutSave" :loading="loading" size="default">保存</el-button>
            </div>
        </template>
    </mlDialog>
    <mlSelectIcon v-model="isShowIconDialog" :useIcon="cutMenuIcon" @confirmIcon="selectIcon" />
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
// 获取实体Store
import useCommonStore from "@/store/modules/common";
// 选择图标组件
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import { ElMessage } from "element-plus";
// 取所有实体
const { unSystemEntityList } = storeToRefs(useCommonStore());

const props = defineProps({
    modelValue: null,
});

const emit = defineEmits(["update:modelValue"]);

let isShow = ref(false);

/**
 * 初始数据
 */
let loading = ref(false);
// 页面状态 1新建 2编辑
let pageStatus = ref(1);
// 当前操作菜单
let cutMenu = ref({
    type: 1,
});

// 打开数据弹框
const openDialog = (status, data) => {
    cutMenu.value = data ? { ...data } : { type: 1 };
    pageStatus.value = status;
};

// 实体分组
const getGroupEntityList = () => {
    let systemOptions = [
        {
            label: "部门用户",
            entityCode: 22,
            name: "Department",
        },
        {
            label: "权限角色",
            entityCode: 23,
            name: "Role",
        },
        {
            label: "团队",
            entityCode: 24,
            name: "Team",
        },
        // {
        //     label: "跟进",
        //     entityCode: 54,
        //     name: "FollowUp",
        // },
        // {
        //     label: "待办",
        //     entityCode: 55,
        //     name: "TodoTask",
        // },
    ];
    let newEntityList = [
        {
            label: "自定义实体",
            options: [...getEntityList()],
        },
        {
            label: "系统内置",
            options: [...systemOptions],
        },
        {
            label: "审批流程",
            options: [
                {
                    label: "待我处理",
                    name: "approvalHandle",
                    entityCode: "approvalHandle",
                },
                {
                    label: "我提交的",
                    name: "approvalSubmit",
                    entityCode: "approvalSubmit",
                },
                {
                    label: "抄送我的",
                    name: "capprovalCc",
                    entityCode: "capprovalCc",
                },
            ],
        },
    ];
    return newEntityList;
};

// 格式化实体
const getEntityList = () => {
    return unSystemEntityList.value.filter((el) => !el.detailEntityFlag);
};

// 选择实体触发
const associationChange = (entityCode) => {
    let linkEntity;
    for (let index = 0; index < getGroupEntityList().length; index++) {
        const element = getGroupEntityList()[index];
        for (let j = 0; j < element.options.length; j++) {
            const subEl = element.options[j];
            if (subEl.entityCode == entityCode) {
                linkEntity = subEl;
                continue;
            }
        }
    }
    // console.log(linkEntity, "linkEntity");
    // cutMenu.value.linkEntity = linkEntity;
    cutMenu.value.name = linkEntity.label;
    cutMenu.value.entityCode = linkEntity.entityCode;
    cutMenu.value.entityName = linkEntity.name;
};

/**
 * 图标弹框
 */

let isShowIconDialog = ref(false);
// 当前菜单ICON
let cutMenuIcon = ref({});

// 打开选择图标弹框
const openSelectIconDialog = () => {
    isShowIconDialog.value = true;
    cutMenuIcon.value = {
        name: cutMenu.value.useIcon,
        color: cutMenu.value.iconColor || "",
    };
};

// 选择图标
const selectIcon = ({ name, color }) => {
    cutMenu.value.useIcon = name;
    cutMenu.value.iconColor = color;
    isShowIconDialog.value = false;
};

/**
 * 最终保存
 */
// 系统内置
const SystemEntityName = [
    "Department",
    "Role",
    "Team",
    "approvalHandle",
    "approvalSubmit",
    "capprovalCc",
];
const SystemEntityPath = {
    Department: "entity-user",
    Role: "entity-role",
    Team: "entity-team",
    approvalHandle: "approval-handle",
    approvalSubmit: "approval-submit",
    capprovalCc: "approval-cc",
};

// 弹框保存
const layoutSave = () => {
    let { type, entityCode, entityName } = cutMenu.value;
    if (type == 1 && !entityCode) {
        ElMessage.warning("请选择关联项");
        return;
    }
    // 如果是系统内置
    if (SystemEntityName.includes(entityName)) {
        cutMenu.value.isSystemEntity = true;
        cutMenu.value.outLink = SystemEntityPath[cutMenu.value.entityName];
    }
    console.log(cutMenu.value, "cutMenu.value");
};

/**
 * 导出
 */

defineExpose({
    openDialog,
});
</script>

<style lang="scss" scoped>
.content-box {
    box-sizing: border-box;
    padding: 0 8px;
}
.select-icon-span {
    // padding: 0 10px;
    // background: #fff;
    border-radius: 4px 0 0 4px;
    cursor: pointer;
    position: relative;
    width: 30px;
    height: 32px;
    .icon {
        font-size: 18px;
        position: absolute;
        left: 6px;
        top: 7px;
        // color: #404040;
    }
    &:hover {
        background: #eeeeee;
    }
}
</style>
