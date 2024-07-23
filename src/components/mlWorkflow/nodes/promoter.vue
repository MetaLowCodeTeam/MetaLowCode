<template>
    <div class="node-wrap">
        <div class="node-wrap-box start-node" @click="show">
            <div class="title promoter">
                <div v-if="style === 'weCom'" class="we-com-hr"></div>
                <el-icon class="icon">
                    <el-icon-user-filled />
                </el-icon>
                <span>{{ nodeConfig.nodeName }}</span>
            </div>
            <div class="content promoter">
                <div class="default-div">{{ toText(nodeConfig) }}</div>
            </div>
        </div>
        <add-node v-model="nodeConfig.childNode"></add-node>
        <el-drawer
            class="mlnode-drawer"
            title="发起人"
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
                <div class="lable-title mb-3">谁可以发起此审批</div>
                <div class="mb-10 mt-10">
                    <el-radio-group
                        class="radio-need-block"
                        v-model="form.nodeRoleType"
                        @change="nodeRoleTypeChange"
                    >
                        <el-radio :label="1">所有人</el-radio>
                        <el-radio :label="2">记录所属用户</el-radio>
                        <el-radio :label="3">指定用户</el-radio>
                    </el-radio-group>
                </div>
                <mlSelectUser
                    v-if="form.nodeRoleType == 3"
                    v-model="form.nodeRoleList"
                    multiple
                    clearable
                />
                <div class="lable-title mb-10 mt-20">发起条件</div>
                <div class="ml-a-span mb-3" @click="setCondition">{{ getSetConditionText() }}</div>
                <div class="info-text">符合条件的记录才可以使用/选择此流程</div>
                <div class="lable-title mb-10 mt-20">同步审批状态</div>
                <div class="mt-10">
                    <MlAssociatedRecords
                        v-model="form.cascades"
                        :entityCode="entityCode"
                        @loadDataFinish="associatedRecordsFinish"
                    />
                </div>
                <div class="info-text mt-5">同步审批状态会强制修改相关数据的审批状态，请谨慎选择！！</div>
            </div>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="drawer=false">取消</el-button>
                    <el-button type="primary" @click="save">保存</el-button>
                </div>
            </template>
        </el-drawer>
        <div v-if="dialogIsShow">
            <mlDialog title="发起条件" append-to-body width="37%" v-model="dialogIsShow">
                <mlSetConditions
                    v-model="conditionConf"
                    footer
                    @cancel="dialogIsShow = false"
                    @confirm="conditionConfirm"
                    :entityName="entityCode"
                />
            </mlDialog>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch, nextTick, inject } from "vue";
import addNode from "./addNode.vue";
import MlAssociatedRecords from "@/components/mlAssociatedRecords/index.vue";
import usePpprovalProcessStore from "@/store/modules/approvalProcess";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
const router = useRouter();
let message = inject("$ElMessage");
const $API = inject("$API");
let cloneDeep = inject("$CloneDeep");
const { style } = storeToRefs(usePpprovalProcessStore());
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
});

const emit = defineEmits(["update:modelValue"]);
let nodeConfig = ref({});
let drawer = ref(false);
let isEditTitle = ref(false);
let form = reactive({});
let dialogIsShow = ref(false);
let conditionConf = reactive({});
const nodeTitle = ref();
let entityCode = ref("");
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
    entityCode.value = router.currentRoute.value.query?.entityCode;
});

let associatedEntityList = ref([]);
const associatedRecordsFinish = (v) => {
    associatedEntityList.value = v;
    if(form.cascades){
        form.cascades.forEach((el,inx) => {
            let findEl = associatedEntityList.value.filter(subEl => subEl.entityName == el.entityName && subEl.fieldName == el.fieldName);
            if(findEl.length > 0){
                form.cascades[inx] = {...findEl[0]};
            }
        })
    }
}

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
const nodeRoleTypeChange = () => {
    if (form.nodeRoleType !== 3) {
        form.nodeRoleList = [];
    }
};
// 获取设置条件文案
const getSetConditionText = () => {
    let { filter } = form;
    let length = filter.items.length;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};
// 设置条件
const setCondition = () => {
    let { filter } = cloneDeep(form);
    filter = initFilter(filter);
    conditionConf = filter;
    dialogIsShow.value = true;
};
const initFilter = (filter) => {
    let { equation } = filter;
    if (!equation || equation === "OR") {
        filter.type = 1;
        filter.equation = "OR";
    } else if (equation === "AND") {
        filter.type = 2;
        filter.equation = "AND";
    } else {
        filter.type = 3;
    }
    return filter;
};
// 确认条件
const conditionConfirm = (conf) => {
    Object.assign(form.filter, conf);
    emit("update:modelValue", form);
    dialogIsShow.value = false;
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
const toText = (nodeConfig) => {
    if (nodeConfig.nodeRoleType == 2) {
        return "记录所属用户";
    } else if (nodeConfig.nodeRoleType == 3) {
        if (nodeConfig.nodeRoleList && nodeConfig.nodeRoleList.length > 0) {
            return nodeConfig.nodeRoleList.map((item) => item.name).join("、");
        }
    } else {
        return "所有人";
    }
};
</script>

<style lang="scss" scoped>
</style>