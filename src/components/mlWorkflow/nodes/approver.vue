<template>
    <div class="node-wrap">
        <div class="node-wrap-box" :class="{'is-highlight': nodeConfig.highlightBefore}" @click="show">
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
        <add-node v-model="nodeConfig.childNode" :isHideAddNode="isHideAddNode" :isHighlight="nodeConfig.isHighlight"></add-node>
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
                <div class="label-title mb-3">由谁审批</div>
                <div class="mt-10">
                    <el-select
                        v-model="form.nodeRoleType"
                        placeholder="选择由谁审批"
                        style="width: 180px;"
                        @change="nodeRoleTypeChange"
                    >
                        <el-option
                            v-for="item in nodeRoleTypeList"
                            :key="item.type"
                            :label="item.label"
                            :value="item.type"
                        />
                    </el-select>
                    <div style="width: calc(100% - 200px);display: inline-block;margin-left: 10px;">
                        <mlSelectUser
                            v-if="form.nodeRoleType == 3"
                            v-model="form.nodeRoleList"
                            multiple
                            clearable
                        />
                        <el-select
                            v-model="form.nodeRoleList"
                            v-loading="departmentLoading"
                            clearable
                            multiple
                            value-key="name"
                            placeholder="请选择指定部门负责人"
                            v-if="form.nodeRoleType == 4"
                        >
                            <el-option
                                v-for="(item,depInx) in departmentList"
                                :key="depInx"
                                :disabled="item.name.indexOf('未设置负责人') != -1"
                                :label="item.name"
                                :value="item"
                            />
                        </el-select>
                        <el-select
                            v-model="form.deptLevel"
                            placeholder="请选择指定部门负责人"
                            v-if="form.nodeRoleType == 5 || form.nodeRoleType == 6"
                        >
                            <el-option
                                v-for="(item,depInx) in nodeRoleTypeChilerenList"
                                :key="depInx"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </div>
                </div>
                <div class="mt-10">
                    <el-checkbox v-model="form.userSelectFlag" label="同时允许自选" />
                </div>
                <div>
                    <el-checkbox v-model="form.transferApproval" label="允许审批人转审" />
                </div>
                <div>
                    <el-checkbox v-model="form.addSignaturesApproval" label="允许审批人加签" />
                </div>
                <div class="label-title mb-10 mt-20">当有多人审批时</div>
                <div class="mt-10">
                    <el-radio-group class="radio-need-block" v-model="form.multiPersonApproval">
                        <el-radio :value="1">会签 (需所有审批人同意)</el-radio>
                        <el-radio :value="2">或签 (一名审批人同意或拒绝)</el-radio>
                    </el-radio-group>
                </div>
                <div class="label-title mb-10 mt-20">高级扩展功能</div>
                <div class="mt-10">
                    <el-checkbox v-model="form.autograph" label="手写签名"/>
                </div>
                <div class="mt-10">
                    <el-checkbox v-model="form.completedCC" label="完成审批时抄送当前审批人"/>
                </div>
                 <!-- 允许修改字段 -->
                <div class="mt-20">
                    <ModifiableFields 
                        :formData="form" 
                        :entityName="myEntityName"
                    />
                </div>
            </div>

            <template #footer>
                <div style="flex: auto">
                    <el-button @click="drawer=false">取消</el-button>
                    <el-button type="primary" @click="save">保存</el-button>
                </div>
            </template>
        </el-drawer>
    </div>
</template>

<script setup>
import addNode from "./addNode.vue";
import { onMounted, reactive, ref, watch, nextTick, inject } from "vue";
import usePpprovalProcessStore from "@/store/modules/approvalProcess";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
// 允许修改字段组件
import ModifiableFields from "@/components/mlApprove/ModifiableFields.vue";
const router = useRouter();
let message = inject("$ElMessage");
let $API = inject("$API");
const { style } = storeToRefs(usePpprovalProcessStore());
const { allEntityName } = storeToRefs(useCommonStore());
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
    isHideAddNode: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);
let nodeConfig = ref({});
let isEditTitle = ref(false);
let form = reactive({});
let drawer = ref(false);
let nodeTitle = ref();
let myEntityName = ref("");
let nodeRoleTypeList = ref([
    {
        label: "指定审批人",
        type: 3,
    },
    {
        label: "指定部门负责人",
        type: 4,
    },
    {
        label: "发起人自己",
        type: 2,
    },
    {
        label: "发起人部门负责人",
        type: 5,
    },
    {
        label: "数据所属部门负责人",
        type: 6,
    },
]);

let nodeRoleTypeChilerenList = ref([
    {
        label: "当前部门",
        value: 0,
    },
    {
        label: "二级部门",
        value: 1,
    },
    {
        label: "三级部门",
        value: 2,
    },
    {
        label: "四级部门",
        value: 3,
    },
    {
        label: "五级部门",
        value: 4,
    },
    {
        label: "六级部门",
        value: 5,
    },
    {
        label: "七级部门",
        value: 6,
    },
    {
        label: "八级部门",
        value: 7,
    },
    {
        label: "九级部门",
        value: 8,
    },
    {
        label: "十级部门",
        value: 9,
    },
]);

watch(
    () => props.modelValue,
    () => {
        nodeConfig.value = props.modelValue;
    },
    {
        deep: true,
    }
);

let departmentList = ref([]);
let departmentLoading = ref(false);

onMounted(() => {
    nodeConfig.value = props.modelValue;
    let entityCode = router.currentRoute.value.query.entityCode;
    if (entityCode) {
        myEntityName.value = allEntityName.value[entityCode];
    }
    getDepartment();
});

const getDepartment = async () => {
    departmentLoading.value = true;
    let res = await $API.common.getDepartment();
    if (res && res.data) {
        let resData = res.data || [];
        departmentList.value = resData.map((el) => {
            let newData = {
                name: `${el.departmentName}(${
                    el.departmentOwnerUser
                        ? el.departmentOwnerUser.name
                        : "未设置负责人"
                })`,
                id: el.departmentId,
            };
            return newData;
        });
    }

    departmentLoading.value = false;
};

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
        message.error("请选择指定审批人");
        return;
    }
    if (nodeRoleType == 4 && nodeRoleList.length < 1) {
        message.error("请选择指定部门负责人");
        return;
    }
    emit("update:modelValue", form);
    drawer.value = false;
};
const delNode = () => {
    emit("update:modelValue", nodeConfig.value.childNode);
};

const nodeRoleTypeChange = () => {
    // if (form.nodeRoleType !== 3) {
    form.nodeRoleList = [];
    // }
};
const toText = (nodeConfig) => {
    if (nodeConfig.nodeRoleType == 2) {
        return "发起人自己";
    } else if (nodeConfig.nodeRoleType == 5) {
        return "发起人部门负责人";
    } else if (nodeConfig.nodeRoleType == 6) {
        return "数据所属部门负责人";
    } else {
        if (nodeConfig.nodeRoleList && nodeConfig.nodeRoleList.length > 0) {
            return nodeConfig.nodeRoleList.map((item) => item.name).join("、");
        }
    }
};
</script>

<style lang="scss" scoped>

</style>
