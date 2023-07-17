<template>
    <div class="node-wrap">
        <div class="node-wrap-box" @click="show">
            <div class="title ccto">
                <div v-if="style === 'weCom'" class="we-com-hr"></div>
                <el-icon class="icon">
                    <el-icon-promotion />
                </el-icon>
                <span>{{ nodeConfig.nodeName }}</span>
                <el-icon class="close" @click.stop="delNode()">
                    <el-icon-close />
                </el-icon>
            </div>
            <div class="content ccto">
                <div class="default-div">
                    <span v-if="toText(nodeConfig)">{{ toText(nodeConfig) }}</span>
                    <span v-else class="placeholder">请选择人员</span>
                </div>
            </div>
        </div>
        <add-node v-model="nodeConfig.childNode"></add-node>
        <el-drawer
            title="抄送人设置"
            v-model="drawer"
            destroy-on-close
            append-to-body
            :size="500"
            class="mlnode-drawer"
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
                <div class="lable-title mb-3">审批结果抄送给谁</div>
                <mlSelectUser class="mt-5 mb-5" v-model="form.nodeUserList" multiple clearable />
                <div>
                    <el-checkbox v-model="form.userSelectFlag" label="同时允许自选" />
                </div>
                <div>
                    <el-checkbox v-model="form.automaticSharing" label="抄送人无读取权限时自动共享" />
                </div>
                <div class="lable-title mb-3 mt-20">抄送给外部人员</div>
                <mlSelectUser class="mt-5 mb-5" v-model="form.externalUserList" multiple clearable />
                <div class="info-text">选择外部人员的电话 (手机) 或邮箱字段</div>
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
import mlSelectField from "@/components/mlSelectField/index.vue";
import { onMounted, reactive, ref, watch, nextTick, inject } from "vue";
import usePpprovalProcessStore from "@/store/modules/approvalProcess";
import { storeToRefs } from "pinia";
let message = inject("$ElMessage");
const { style } = storeToRefs(usePpprovalProcessStore());
const props = defineProps({
    modelValue: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue"]);
let nodeConfig = reactive({});
let isEditTitle = ref(false);
let form = reactive({});
let drawer = ref(false);
let nodeTitle = ref();
watch(
    () => props.modelValue,
    () => {
        nodeConfig = Object.assign(nodeConfig, props.modelValue);
    },
    {
        deep: true,
    }
);
onMounted(() => {
    nodeConfig = Object.assign(nodeConfig, props.modelValue);
});

const show = () => {
    form = {};
    form = JSON.parse(JSON.stringify(nodeConfig));
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
    emit("update:modelValue", form);
    drawer.value = false;
};
const delNode = () => {
    emit("update:modelValue", nodeConfig.childNode);
};
const toText = (nodeConfig) => {
    if (nodeConfig.nodeUserList && nodeConfig.nodeUserList.length > 0) {
        const users = nodeConfig.nodeUserList
            .map((item) => item.name)
            .join("、");
        return users;
    } else {
        if (nodeConfig.userSelectFlag) {
            return "发起人自选";
        } else {
            return false;
        }
    }
};
</script>

<style>
</style>
