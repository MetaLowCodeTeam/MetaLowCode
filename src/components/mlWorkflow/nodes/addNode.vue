<template>
    <div class="add-node-btn-box">
        <div class="add-node-btn">
            <el-popover
                placement="right-start"
                :width="270"
                trigger="click"
                :hide-after="0"
                :show-after="0"
            >
                <template #reference>
                    <el-button type="primary" icon="el-icon-plus" circle></el-button>
                </template>
                <div class="add-node-popover-body">
                    <ul>
                        <li>
                            <el-icon style="color: #ff943e;" @click="addType(1)">
                                <el-icon-user-filled />
                            </el-icon>
                            <p>审批节点</p>
                        </li>
                        <li>
                            <el-icon style="color: #3296fa;" @click="addType(2)">
                                <el-icon-promotion />
                            </el-icon>
                            <p>抄送节点</p>
                        </li>
                        <li>
                            <el-icon style="color: #15BC83;" @click="addType(4)">
                                <el-icon-share />
                            </el-icon>
                            <p>条件分支</p>
                        </li>
                    </ul>
                </div>
            </el-popover>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: { type: Object, default: () => {} },
    },
    data() {
        return {};
    },
    mounted() {},
    methods: {
        addType(type) {
            var node = {};
            if (type == 1) {
                node = {
                    nodeName: "审批人",
                    type: 1,
                    nodeRoleType: 1,
                    nodeRoleList: [],
                    // 同时允许自选
                    userSelectFlag: true,
                    // 允许审批人转审
                    transferApproval: true,
                    // 允许审批人转审
                    addSignaturesApproval: true,
                    // 多人审批时
                    multiPersonApproval: 1,
                    // 可修改字段
                    modifiableFields: [],
                    childNode: this.modelValue,
                };
            } else if (type == 2) {
                node = {
                    nodeName: "抄送人",
                    type: 2,
                    // 同时允许自选
                    userSelectFlag: true,
                    // 抄送人无读取权限时自动共享
                    automaticSharing: false,
                    // 审批结果抄送给谁
                    nodeUserList: [],
                    // 抄送给外部人员
                    externalUserList: [],
                    childNode: this.modelValue,
                };
            } else if (type == 4) {
                node = {
                    nodeName: "条件路由",
                    type: 4,

                    conditionNodes: [
                        {
                            nodeName: "条件1",
                            type: 3,
                            conditionMode: 1,
                            conditionList: [],
                            conditionExpression: "",
                            priorityLevel:1,
                            filter: {
                                equation: "",
                                items: [],
                            },
                        },
                        {
                            nodeName: "条件2",
                            type: 3,
                            conditionMode: 1,
                            conditionList: [],
                            conditionExpression: "",
                            priorityLevel:2,
                            filter: {
                                equation: "",
                                items: [],
                            },
                        },
                    ],
                    childNode: this.modelValue,
                };
            }
            this.$emit("update:modelValue", node);
        },
    },
};
</script>

<style>
</style>
