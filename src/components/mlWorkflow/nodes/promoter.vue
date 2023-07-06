<template>
    <div class="node-wrap">
        <div class="node-wrap-box start-node" @click="show">
            <div class="title" style="background: #576a95;">
                <el-icon class="icon">
                    <el-icon-user-filled />
                </el-icon>
                <span>{{ nodeConfig.nodeName }}</span>
            </div>
            <div class="content">
                <span>{{ toText(nodeConfig) }}</span>
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
                <div class="text-btn mb-3" @click="setCondition">{{ getSetConditionText() }}</div>
                <div class="info-text">符合条件的记录才可以使用/选择此流程</div>
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
                />
            </mlDialog>
        </div>
    </div>
</template>

<script>
import addNode from "./addNode";

export default {
    props: {
        modelValue: { type: Object, default: () => {} },
    },
    components: {
        addNode,
    },
    data() {
        return {
            nodeConfig: {},
            drawer: false,
            isEditTitle: false,
            form: {},
            dialogIsShow: false,
            conditionConf: {},
        };
    },
    watch: {
        modelValue() {
            this.nodeConfig = this.modelValue;
        },
    },
    mounted() {
        this.nodeConfig = this.modelValue;
    },
    methods: {
        show() {
            this.form = {};
            this.form = JSON.parse(JSON.stringify(this.nodeConfig));
            this.isEditTitle = false;
            this.drawer = true;
        },
        editTitle() {
            this.isEditTitle = true;
            this.$nextTick(() => {
                this.$refs.nodeTitle.focus();
            });
        },
        saveTitle() {
            this.isEditTitle = false;
        },
        nodeRoleTypeChange() {
            if (this.form.nodeRoleType !== 3) {
                this.form.nodeRoleList = [];
            }
        },
        // 获取设置条件文案
        getSetConditionText() {
            let { filter } = this.form;
            let length = filter.items.length;
            return length > 0 ? `已设置条件（${length}）` : "点击设置";
        },
        // 设置条件
        setCondition() {
            let { filter } = this.$CloneDeep(this.form);
            filter = this.$API.approval.setConditions.initFilter(filter);
            this.conditionConf = filter;
            this.dialogIsShow = true;
        },
        // 确认条件
        conditionConfirm(conf) {
            Object.assign(this.form.filter, conf);
            this.$emit("update:modelValue", this.form);
            this.dialogIsShow = false;
        },
        save() {
            let { nodeRoleType, nodeRoleList } = this.form;
            if (nodeRoleType == 3 && nodeRoleList.length < 1) {
                this.$message.error("请选择用户");
                return;
            }
            this.$emit("update:modelValue", this.form);
            this.drawer = false;
        },
        toText(nodeConfig) {
            if (nodeConfig.nodeRoleType == 2) {
                return "记录所属用户";
            } else if (nodeConfig.nodeRoleType == 3) {
                if (
                    nodeConfig.nodeRoleList &&
                    nodeConfig.nodeRoleList.length > 0
                ) {
                    return nodeConfig.nodeRoleList
                        .map((item) => item.name)
                        .join("、");
                }
            } else {
                return "所有人";
            }
        },
    },
};
</script>

<style lang="scss" scoped>
</style>