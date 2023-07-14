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
                                <div class="title">
                                    <span class="node-title">{{ item.nodeName }}</span>
                                    <span class="priority-title">优先级{{item.priorityLevel}}</span>
                                    <el-icon class="close" @click.stop="delTerm(index)">
                                        <el-icon-close />
                                    </el-icon>
                                </div>
                                <div class="content">
                                    <span>{{ toText(nodeConfig, index) }}</span>
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
            <div class="last-nodes" v-if="lastNodes">该分支将作为最终分支匹配其他条件</div>
            <div class="work-flow-conditions mb-20" :class="{'mt-30':lastNodes}">
                <mlSetConditions ref="mlSetConditions" v-model="conditionConf" />
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

<script>
import addNode from "./addNode.vue";

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
            index: 0,
            form: {},
            conditionConf: {},
            // 最终分支
            lastNodes: false,
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
        show(index) {
            this.index = index;
            this.form = {};
            this.form = JSON.parse(
                JSON.stringify(this.nodeConfig.conditionNodes[index])
            );
            this.lastNodes = false;
            if (index === this.nodeConfig.conditionNodes.length - 1) {
                this.lastNodes = true;
            }
            let { filter } = this.$CloneDeep(this.form);
            filter = this.initFilter(filter);
            this.conditionConf = filter;
            this.drawer = true;
        },
        initFilter: (filter) => {
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
        save() {
            if (!this.$refs.mlSetConditions.checkConditionList()) {
                return;
            }
            let { items, equation } = this.conditionConf;
            Object.assign(this.form.filter, { equation, items });
            this.nodeConfig.conditionNodes[this.index] = this.form;
            this.$emit("update:modelValue", this.nodeConfig);
            this.drawer = false;
        },
        addTerm() {
            let len = this.nodeConfig.conditionNodes.length + 1;
            this.nodeConfig.conditionNodes.push({
                nodeName: "条件" + len,
                type: 3,
                priorityLevel: len,
                conditionMode: 1,
                conditionList: [],
            });
        },
        delTerm(index) {
            this.nodeConfig.conditionNodes.splice(index, 1);
            if (this.nodeConfig.conditionNodes.length == 1) {
                if (this.nodeConfig.childNode) {
                    if (this.nodeConfig.conditionNodes[0].childNode) {
                        this.reData(
                            this.nodeConfig.conditionNodes[0].childNode,
                            this.nodeConfig.childNode
                        );
                    } else {
                        this.nodeConfig.conditionNodes[0].childNode =
                            this.nodeConfig.childNode;
                    }
                }
                this.$emit(
                    "update:modelValue",
                    this.nodeConfig.conditionNodes[0].childNode
                );
            }
        },
        reData(data, addData) {
            if (!data.childNode) {
                data.childNode = addData;
            } else {
                this.reData(data.childNode, addData);
            }
        },
        arrTransfer(index, type = 1) {
            this.nodeConfig.conditionNodes[index] =
                this.nodeConfig.conditionNodes.splice(
                    index + type,
                    1,
                    this.nodeConfig.conditionNodes[index]
                )[0];
            this.nodeConfig.conditionNodes.map((item, index) => {
                item.priorityLevel = index + 1;
            });
            this.$emit("update:modelValue", this.nodeConfig);
        },
        toText(nodeConfig, index) {
            var { filter } = nodeConfig.conditionNodes[index];
            if (index === nodeConfig.conditionNodes.length - 1) {
                return `其他条件`;
            }
            if (filter && filter.items && filter.items.length > 0) {
                return `已设置条件（${filter.items.length}）`;
            } else {
                return `请设置条件`;
            }
        },
    },
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
