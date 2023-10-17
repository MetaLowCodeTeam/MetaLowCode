<template>
    <div class="branch-wrap">
        <div class="branch-box-wrap">
            <div class="branch-box">
                <el-button class="add-branch" type="success" plain round @click="addTerm">添加条件</el-button>
                <div class="col-box" v-for="(item,index) in nodeConfig.conditionNodes" :key="index">
                    <div class="condition-node">
                        <div class="condition-node-box">
                            <div class="auto-judge" @click="show(index)">
                                <div
                                    class="sort-left"
                                    v-if="index!=0"
                                    @click.stop="arrTransfer(index,-1)"
                                >
                                    <el-icon>
                                        <el-icon-arrow-left />
                                    </el-icon>
                                </div>
                                <div class="title branch">
                                    <div v-if="style === 'weCom'" class="we-com-hr"></div>
                                    <span class="node-title">{{ item.nodeName }}</span>
                                    <span class="priority-title">优先级{{index + 1}}</span>
                                    <el-icon class="close" @click.stop="delTerm(index)">
                                        <el-icon-close />
                                    </el-icon>
                                </div>
                                <div class="content branch">
                                    <div class="default-div">
                                        <span>{{ toText(nodeConfig, index) }}</span>
                                    </div>
                                </div>
                                <div
                                    class="sort-right"
                                    v-if="index!=nodeConfig.conditionNodes.length-1"
                                    @click.stop="arrTransfer(index)"
                                >
                                    <el-icon>
                                        <el-icon-arrow-right />
                                    </el-icon>
                                </div>
                            </div>
                            <add-node v-model="item.childNode"></add-node>
                        </div>
                    </div>
                    <slot v-if="item.childNode" :node="item"></slot>
                    <div class="top-left-cover-line" v-if="index==0"></div>
                    <div class="bottom-left-cover-line" v-if="index==0"></div>
                    <div
                        class="top-right-cover-line"
                        v-if="index==nodeConfig.conditionNodes.length-1"
                    ></div>
                    <div
                        class="bottom-right-cover-line"
                        v-if="index==nodeConfig.conditionNodes.length-1"
                    ></div>
                </div>
            </div>
            <add-node v-model="nodeConfig.childNode"></add-node>
        </div>
        <el-drawer
            title="条件设置"
            v-model="drawer"
            destroy-on-close
            append-to-body
            :size="600"
            class="mlnode-drawer"
        >
            <template #header>
                <div class="node-wrap-drawer__title">
                    <label @click="editTitle" v-if="!isEditTitle">
                        {{form.nodeName}}111
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
            <div class="last-nodes" v-if="lastNodes">该分支将作为最终分支匹配其他条件</div>
            <div class="work-flow-conditions mb-20" :class="{'mt-30':lastNodes}">
                <mlSetConditions ref="mlSetConditionsRef" v-model="conditionConf" :entityName="entityCode"/>
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
import mlSetConditions from '@/components/mlSetConditions/index.vue';
import { onMounted, reactive, ref, watch, nextTick, inject } from "vue";
import usePpprovalProcessStore from "@/store/modules/approvalProcess";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
const router = useRouter();
let message = inject("$ElMessage");
const { style } = storeToRefs(usePpprovalProcessStore());
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue"]);
let nodeConfig = ref({});
let drawer = ref(false);
let isEditTitle = ref(false);
let cutIndex = ref(0);
let form = reactive({});
let conditionConf = reactive({});
let mlSetConditionsRef = ref();
// 最终分支
let lastNodes = ref(false);
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

const show = (index) => {
    cutIndex.value = index;
    form = Object.assign(form, nodeConfig.value.conditionNodes[index]);
    lastNodes.value = false;
    if (index === nodeConfig.value.conditionNodes.length - 1) {
        lastNodes.value = true;
    }
    let { filter } = JSON.parse(JSON.stringify(form));
    filter = initFilter(filter);
    conditionConf = filter;
    drawer.value = true;
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
let nodeTitle = ref("");
const editTitle = async () => {
    isEditTitle.value = true;
    await nextTick();
    nodeTitle.value.focus();
};
const saveTitle = () => {
    isEditTitle.value = false;
};
const save = () => {
    if (!mlSetConditionsRef.value.checkConditionList()) {
        return;
    }
    let { items, equation } = conditionConf;
    Object.assign(form.filter, { equation, items });
    nodeConfig.value.conditionNodes[cutIndex.value] = form;
    emit("update:modelValue", nodeConfig.value);
    drawer.value = false;
};
const addTerm = () => {
    let len = nodeConfig.value.conditionNodes.length + 1;
    nodeConfig.value.conditionNodes.push({
        nodeName: "条件" + len,
        type: 3,
        priorityLevel: len,
        conditionMode: 1,
        conditionList: [],
        conditionExpression: "",
        filter: {
            equation: "",
            items: [],
        },
    });
};
const delTerm = (index) => {
    nodeConfig.value.conditionNodes.splice(index, 1);
    if (nodeConfig.value.conditionNodes.length == 1) {
        if (nodeConfig.value.childNode) {
            if (nodeConfig.value.conditionNodes[0].childNode) {
                reData(
                    nodeConfig.value.conditionNodes[0].childNode,
                    nodeConfig.value.childNode
                );
            } else {
                nodeConfig.value.conditionNodes[0].childNode =
                    nodeConfig.value.childNode;
            }
        }
        emit("update:modelValue", nodeConfig.value.conditionNodes[0].childNode);
    }
};
const reData = (data, addData) => {
    if (!data.childNode) {
        data.childNode = addData;
    } else {
        reData(data.childNode, addData);
    }
};
const arrTransfer = (index, type = 1) => {
    nodeConfig.value.conditionNodes[index] =
        nodeConfig.value.conditionNodes.splice(
            index + type,
            1,
            nodeConfig.value.conditionNodes[index]
        )[0];
    nodeConfig.value.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1;
    });
    emit("update:modelValue", nodeConfig.value);
};
const toText = (nodeConfig, index) => {
    var { filter } = nodeConfig.conditionNodes[index];
    if (index === nodeConfig.conditionNodes.length - 1) {
        return `其他条件`;
    }
    if (filter && filter.items && filter.items.length > 0) {
        return `已设置条件（${filter.items.length}）`;
    } else {
        return `请设置条件`;
    }
};
</script>

<style lang="scss" scoped>
.last-nodes {
    position: absolute;
    top: 62px;
    left: 0;
    height: 34px;
    line-height: 34px;
    background: #f7b904;
    width: 100%;
    font-size: 14px;
    color: #fff;
    padding: 0 20px;
}
</style>
