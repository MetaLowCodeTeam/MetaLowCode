<template>
    <div class="node-wrap">
        <div class="node-wrap-box" @click="show">
            <div class="title reviewed">
                <div v-if="style === 'weCom'" class="we-com-hr"></div>
                <el-icon class="icon">
                    <el-icon-user-filled />
                </el-icon>
                <span>{{ nodeConfig.nodeName }}</span>
                <el-icon class="close" @click.stop="delNode()">
                    <el-icon-close />
                </el-icon>
            </div>
            <div class="content reviewed">
                <div class="default-div">
                    <span v-if="toText(nodeConfig)">{{ toText(nodeConfig) }}</span>
                    <span v-else class="placeholder">请选择</span>
                </div>
            </div>
        </div>
        <add-node v-model="nodeConfig.childNode"></add-node>
        <el-drawer
            class="mlnode-drawer"
            title="审批人设置"
            v-model="drawer"
            destroy-on-close
            append-to-body
            :size="500"
        >
            <template #header>
                <div class="node-wrap-drawer__title">
                    <label @click="editTitle" v-if="!isEditTitle">
                        {{form.nodeName}}
                        <el-icon class="node-wrap-drawer__title-edit">
                            <el-icon-edit />
                        </el-icon>
                    </label>
                    <el-input
                        v-if="isEditTitle"
                        ref="nodeTitle"
                        v-model="form.nodeName"
                        clearable
                        @blur="saveTitle"
                        @keyup.enter="saveTitle"
                    ></el-input>
                </div>
            </template>
            <div class="work-flow-conditions mb-20">
                <div class="lable-title mb-3">由谁审批</div>
                <div class="mt-10">
                    <el-radio-group
                        class="radio-need-block"
                        v-model="form.nodeRoleType"
                        @change="nodeRoleTypeChange"
                    >
                        <el-radio :label="2">发起人自己</el-radio>
                        <el-radio :label="3">指定审批人</el-radio>
                    </el-radio-group>
                </div>
                <mlSelectUser
                    class="mt-5 mb-5"
                    v-if="form.nodeRoleType == 3"
                    v-model="form.nodeRoleList"
                    multiple
                    clearable
                />
                <div>
                    <el-checkbox v-model="form.userSelectFlag" label="同时允许自选" />
                </div>
                <div>
                    <el-checkbox v-model="form.transferApproval" label="允许审批人转审" />
                </div>
                <div>
                    <el-checkbox v-model="form.addSignaturesApproval" label="允许审批人加签" />
                </div>
                <div class="lable-title mb-10 mt-20">当有多人审批时</div>
                <div class="mt-10">
                    <el-radio-group class="radio-need-block" v-model="form.multiPersonApproval">
                        <el-radio :label="1">会签 (需所有审批人同意)</el-radio>
                        <el-radio :label="2">或签 (一名审批人同意或拒绝)</el-radio>
                    </el-radio-group>
                </div>
                <div class="lable-title mb-10 mt-20">允许修改字段</div>
                <div class="edit-field-list-box">
                    <div
                        class="edit-field-list"
                        v-for="(field,fieldInx) of form.modifiableFields"
                        :key="fieldInx"
                    >
                        {{ field.label }}
                        <span
                            class="fr del-icon"
                            @click="delSelectedField(fieldInx)"
                        >
                            <el-icon size="16">
                                <ElIconClose />
                            </el-icon>
                        </span>

                        <span class="required-icon fr" :title="field.reserved ? '系统字段无法修改' : ''">
                            <!-- <el-checkbox
                                @change="fieldEditChange(field)"
                                :disabled="field.reserved"
                                v-model="field.isEdit"
                                label="允许修改"
                            /> -->
                            <el-checkbox
                                @change="fieldRequiredChange(field)"
                                :disabled="field.reserved"
                                v-model="field.isRequired"
                                label="必填"
                            />
                        </span>
                    </div>
                </div>
                <div class="add-field-div mt-10">
                    <el-button icon="el-icon-plus" @click="openSelectFieldDialog">选择字段</el-button>
                </div>
            </div>

            <template #footer>
                <div style="flex: auto">
                    <el-button @click="drawer=false">取消</el-button>
                    <el-button type="primary" @click="save">保存</el-button>
                </div>
            </template>
            <mlSelectField
                ref="SelectFieldDialog"
                v-model="form.modifiableFields"
                title="选择可查看/修改字段"
                :entityName="myEntityName"
            />
        </el-drawer>
    </div>
</template>

<script setup>
import addNode from "./addNode.vue";
import mlSelectField from "@/components/mlSelectField/index.vue";
import { onMounted, reactive, ref, watch, nextTick, inject } from "vue";
import usePpprovalProcessStore from "@/store/modules/approvalProcess";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
const router = useRouter();
let message = inject("$ElMessage");
const { style } = storeToRefs(usePpprovalProcessStore());
const { entityName } = storeToRefs(useCommonStore());
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue"]);
let nodeConfig = ref({});
let isEditTitle = ref(false);
let form = reactive({});
let drawer = ref(false);
let SelectFieldDialog = ref();
let nodeTitle = ref();
let myEntityName = ref("");
watch(
    () => props.modelValue,
    () => {
        nodeConfig.value = props.modelValue;
    },
    {
        deep: true,
    }
);
onMounted(() => {
    nodeConfig.value = props.modelValue;
    let entityCode = router.currentRoute.value.query.entityCode;
    if(entityCode){
        myEntityName.value = entityName.value[entityCode]
    }
    
    
});

const show = () => {
    form = Object.assign(form, nodeConfig.value);
    isEditTitle.value = false;
    drawer.value = true;
};
const editTitle = async () => {
    isEditTitle.value = true;
    await nextTick();
    nodeTitle.value.focus();
};
const saveTitle = () => {
    isEditTitle.value = false;
};

const save = () => {
    let { nodeRoleType, nodeRoleList } = form;
    if (nodeRoleType == 3 && nodeRoleList.length < 1) {
        message.error("请选择用户");
        return;
    }
    emit("update:modelValue", form);
    drawer.value = false;
};
const delNode = () => {
    emit("update:modelValue", nodeConfig.value.childNode);
};

const nodeRoleTypeChange = () => {
    if (form.nodeRoleType !== 3) {
        form.nodeRoleList = [];
    }
};
const toText = (nodeConfig) => {
    if (nodeConfig.nodeRoleType == 2) {
        return "发起人自己";
    } else {
        if (nodeConfig.nodeRoleList && nodeConfig.nodeRoleList.length > 0) {
            return nodeConfig.nodeRoleList.map((item) => item.name).join("、");
        }
    }
};
/**
 * 添加字段
 */
const openSelectFieldDialog = () => {
    SelectFieldDialog.value.openDialg();
};
// 删除选择字段
const delSelectedField = (inx) => {
    form.modifiableFields.splice(inx, 1);
};
// 字段是否允许修改切换
const fieldEditChange = (field) => {
    if (!field.isEdit && field.isRequired) {
        field.isRequired = false;
    }
};
// 字段是否必填切换
const fieldRequiredChange = (field) => {
    if (!field.isEdit && field.isRequired) {
        field.isEdit = true;
    }
};
</script>

<style lang="scss" scoped>
.edit-field-list-box {
    .edit-field-list {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        height: 38px;
        line-height: 38px;
        font-size: 13px;
        color: #404040;
        &:last-child {
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .del-icon {
            margin-right: 3px;
            position: relative;
            top: 2px;
            cursor: pointer;
            color: #999;
            &:hover {
                color: #6f6f6f;
            }
        }
        .required-icon {
            position: relative;
            top: 1px;
            margin-right: 30px;
        }
    }
}
</style>
