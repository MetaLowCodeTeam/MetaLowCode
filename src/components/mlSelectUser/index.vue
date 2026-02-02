<!--
 * @Descripttion: 用户选择器组件
 * @version: 1.0
 * @Author: 邪七
 * @Date: 2023年6月28日11:30:05
 * @LastEditors: 邪七
 * @LastEditTime: 2023年6月28日11:30:56
-->
<template>
    <el-select
        ref="selectRefs"
        v-model="defaultValue"
        :size="size"
        :clearable="clearable"
        multiple
        :collapse-tags="collapseTags"
        :collapse-tags-tooltip="collapseTagsTooltip"
        :filterable="filterable"
        :placeholder="placeholder"
        :disabled="disabled"
        :filter-method="filterMethod"
        @remove-tag="removeTag"
        @visible-change="visibleChange"
        @clear="clear"
        :style="{'width': cardWidth}"
        class="ml-select-user"
    >
        <template #empty>
            <div class="ml-select-user-content" v-loading="loading">
                <el-row :gutter="20" class="mb-10">
                    <el-col :span="19">
                        <el-input
                            placeholder="请输入关键词搜索"
                            v-model="keyword"
                            clearable
                            @clear="getData"
                            @keyup.enter="getData"
                        ></el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="getData">查询</el-button>
                    </el-col>
                </el-row>
                <div class="mb-10">
                    <el-tabs
                        type="border-card"
                        class="ml-select-user-tabs"
                        v-model="cutTabCode"
                        @tab-change="getData"
                        v-if="tabList.length > 1"
                    >
                        <el-tab-pane
                            :name="tab.name"
                            :label="tab.label"
                            v-for="(tab,inx) of tabList"
                            :key="inx"
                        >
                            <div class="item-li-box" v-if="isTreeMode">
                                <el-tree
                                    :ref="(el) => setTreeRef(el, tab.name)"
                                    :data="tabData"
                                    :props="treeProps"
                                    :node-key="treeIdKey"
                                    :default-expand-all="true"
                                    :show-checkbox="multiple"
                                    :check-strictly="false"
                                    :highlight-current="!multiple"
                                    :filter-node-method="filterTreeNode"
                                    @check-change="handleTreeCheckChange"
                                    @node-click="handleTreeNodeClick"
                                />
                            </div>
                            <div class="item-li-box" v-else>
                                <div
                                    class="tab-item-li"
                                    v-for="(item,itemInx) of tabData"
                                    :key="itemInx"
                                    @click="selectUser(item,tab)"
                                >
                                    {{ item[tab.itemName] }}
                                    <div class="tab-item-icon fr" v-if="item.isActive">
                                        <el-icon class="tab-item-icon-el">
                                            <ElIconSelect />
                                        </el-icon>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <div class="ml-select-tab item-li-box" v-else>
                        <template v-if="isTreeMode">
                            <el-tree
                                ref="singleTreeRef"
                                :data="tabData"
                                :props="treeProps"
                                :node-key="treeIdKey"
                                :default-expand-all="true"
                                :show-checkbox="multiple"
                                :check-strictly="false"
                                :highlight-current="!multiple"
                                :filter-node-method="filterTreeNode"
                                @check-change="handleTreeCheckChange"
                                @node-click="handleTreeNodeClick"
                            />
                        </template>
                        <template v-else>
                            <div
                                class="tab-item-li"
                                v-for="(item,itemInx) of tabData"
                                :key="itemInx"
                                @click="selectUser(item,cutTabItem)"
                            >
                                {{ item[cutTabItem.itemName] }}
                                <div class="tab-item-icon fr" v-if="item.isActive">
                                    <el-icon class="tab-item-icon-el">
                                        <ElIconSelect />
                                    </el-icon>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </template>
    </el-select>
</template>

<script setup>
import { ref, watch, onMounted, inject, nextTick, reactive, computed } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
const api = inject("$API");
const cloneDeep = inject("$CloneDeep");
const props = defineProps({
    modelValue: null,
    cardWidth: { type: String, default: "100%" },
    size: { type: String, default: "default" },
    clearable: { type: Boolean, default: false },
    placeholder: { type: String, default: "请选择" },
    multiple: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    collapseTags: { type: Boolean, default: false },
    collapseTagsTooltip: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: "all" },
    // 过滤条件
    filter: { 
        type: Object, 
            default: {
            User: {
                // 过滤对象，同listQuery fitler
                filter: null,
                // 过滤SQL， 同listQuery fitlerSql
                filterEasySql: null,
                // 过滤示例
                // filterEasySql: 'userName like "%006%"',
            },
            Role: {},
            Department: {},
            Team: {},
            JobPosition: {},
        } 
    }
});



const emit = defineEmits(["change", "update:modelValue"]);
// 加载状态
let loading = ref(false);
// 默认数据
let defaultValue = ref([]);
// 搜索值
let keyword = ref("");
// 是否是程序触发的勾选（避免触发自动关闭）
let isProgrammaticCheck = ref(false);
// 页签
let tabConfig = ref([
    {
        label: "用户",
        name: "User",
        itemId: "userId",
        itemName: "userName",
    },
    {
        label: "角色",
        name: "Role",
        itemId: "roleId",
        itemName: "roleName",
    },
    {
        label: "部门",
        name: "Department",
        itemId: "departmentId",
        itemName: "departmentName",
    },
    {
        label: "团队",
        name: "Team",
        itemId: "teamId",
        itemName: "teamName",
    },
]);
let tabList = ref([]);
// 页签数据
let tabData = ref([]);
// 当前页签
let cutTabCode = ref("User");
// 是否树形模式（用户、部门）
const isTreeMode = computed(() => cutTabCode.value === 'User' || cutTabCode.value === 'Department');
// 树 props/keys（用户/部门树均为 label/id）
const treeLabelKey = computed(() => 'label');
const treeIdKey = computed(() => 'id');
const treeProps = computed(() => ({ children: 'children', label: treeLabelKey.value }));
// el-tree 引用
let treeRefMap = reactive({});
let singleTreeRef = ref();
const setTreeRef = (el, key) => {
    if (el) {
        treeRefMap[key] = el;
    }
};
// 收集当前树的所有 id，便于与其它 Tab 选择合并不相互覆盖
const collectTreeIds = (nodes, acc = new Set()) => {
    if (!Array.isArray(nodes)) return acc;
    nodes.forEach((n) => {
        if (n && n[treeIdKey.value] != null) acc.add(n[treeIdKey.value]);
        if (Array.isArray(n?.children) && n.children.length > 0) collectTreeIds(n.children, acc);
    });
    return acc;
};
const processTreeData = (nodes) => {
    if (!Array.isArray(nodes)) return nodes;
    nodes.forEach((n) => {
        if (n && n.dingDepartmentId) {
            n.id = n.id + "department";
        }
        if (Array.isArray(n?.children) && n.children.length > 0) processTreeData(n.children);
    });
    return nodes;
};
let cutTabItem = reactive({});
watch(
    () => props.modelValue,
    () => {
        initData();
    },
    { deep: true }
);

onMounted(() => {
    if(publicSetting.value.openJobPosition){
        tabConfig.value.push({
            label: "岗位",
            name: "JobPosition",
            itemId: "jobPositionId",
            itemName: "jobTitle",
        });
    }
    initData();
});

// 初始化数据
const initData = () => {
    defaultValue.value = props.modelValue;
    autoCurrentLabel();
    if (props.type === "all") {
        tabList.value = cloneDeep(tabConfig.value);
    } else {
        let types = props.type.split();
        tabList.value = [];
        tabConfig.value.forEach((el) => {
            types.forEach((subEl) => {
                if (el.name == subEl) {
                    tabList.value.push(el);
                }
            });
        });
        cutTabCode.value = tabList.value[0].name;
    }
};

// 获取数据
let getData = async () => {
    loading.value = true;
    // 查询参数（列表模式用；树模式优先本地过滤）
    let param = {
        search: keyword.value,
    };
    // 当前tab
    cutTabItem = tabList.value.filter((el) => cutTabCode.value == el.name)[0];
    // 当前默认选中的IDs - 根据当前tab的itemId字段提取
    let cutSelectedIds = defaultValue.value
        ? defaultValue.value.map((el) => el.id)
        : [];
    tabData.value = [];
    // 获取当前tab接口
    let res;
    if (isTreeMode.value) {
        const query = Object.assign({}, props.filter[cutTabCode.value] || {});
        const apiName = cutTabCode.value === 'User' ? 'getUserTreeData' : 'getDepartmentTreeData';
        res = await api.common[apiName](query);
    } else {
        res = await api.common["get" + cutTabCode.value](param, props.filter[cutTabCode.value]);
    }
    if (res) {
        if (isTreeMode.value) {
            tabData.value = res.data || [];
            if(cutTabCode.value === 'User') {
                tabData.value = processTreeData(tabData.value);
            }
            isProgrammaticCheck.value = true;
            // 默认勾选/高亮
            await nextTick();
            const currentTreeRef = treeRefMap[cutTabCode.value] || singleTreeRef.value;
            if (currentTreeRef && currentTreeRef.store) {
                // 仅勾选属于当前树的数据，避免误勾选并确保与其他Tab合并
                const presentIds = Array.from(collectTreeIds(tabData.value));
                const toCheck = cutSelectedIds.filter((id) => id && presentIds.includes(id));
                if (props.multiple) {
                    currentTreeRef.setCheckedKeys && currentTreeRef.setCheckedKeys(toCheck);
                } else if (cutSelectedIds && cutSelectedIds.length > 0) {
                    currentTreeRef.setCurrentKey && currentTreeRef.setCurrentKey(toCheck[0]);
                }
            }
            await nextTick();
            isProgrammaticCheck.value = false;
        } else {
            tabData.value = (res.data || []).map((el) => {
                el.isActive = false;
                // 如果该ID已在选中集里，默认选中
                if (cutSelectedIds.includes(el[cutTabItem.itemId])) {
                    el.isActive = true;
                }
                return el;
            });
        }
    }
    // 树模式：使用本地过滤，不再调接口
    if (isTreeMode.value) {
        const currentTreeRef = treeRefMap[cutTabCode.value] || singleTreeRef.value;
        nextTick(() => {
            if (currentTreeRef && currentTreeRef.filter) {
                currentTreeRef.filter(keyword.value || '');
            }
        })
    }
    loading.value = false;
};

let selectRefs = ref("");

// 自动模拟options赋值
let autoCurrentLabel = () => {
 
    nextTick(() => {
        selectRefs.value.states.selected.forEach((item) => {
            item.currentLabel = item.value.name;
        });
    });
};
// 选择用户
let selectUser = (item, tab) => {
    if (!item.isActive) {
        item.isActive = true;
        let value = {
            name: item[tab.itemName],
            id: item[tab.itemId],
        };
        if (props.multiple) {
            // 合并不同Tab选择，避免覆盖
            const exists = (defaultValue.value || []).some((v) => v.id === value.id);
            if (!exists) defaultValue.value.push(value);
        } else {
            // 单选：仅替换同域数据
            const others = (defaultValue.value || []).filter((v) => v.id !== value.id);
            defaultValue.value = [...others, value];
        }
    } else {
        item.isActive = false;
        defaultValue.value.forEach((el, inx) => {
            if (el.id === item[tab.itemId]) {
                defaultValue.value.splice(inx, 1);
            }
        });
    }
    autoCurrentLabel();
    emit("update:modelValue", defaultValue.value);
    emit("change", defaultValue.value);
};
// 树-勾选变更
let handleTreeCheckChange = (data, checked, indeterminate) => {
    const currentTreeRef = treeRefMap[cutTabCode.value] || singleTreeRef.value;
    if (!currentTreeRef || !currentTreeRef.getCheckedNodes) return;
    // 部门需要包含父节点，用户只包含子节点
    const leafOnly = cutTabCode.value === 'Department' ? false : true;
    const nodes = currentTreeRef.getCheckedNodes(leafOnly);
    // 合并：保留其它Tab已选；仅用当前树的选择替换同域
    const presentIdSet = collectTreeIds(tabData.value);
    const others = (defaultValue.value || []).filter((v) => !presentIdSet.has(v.id));
    const current = nodes.map((n) => ({ id: n[treeIdKey.value], name: n[treeLabelKey.value] }));
    defaultValue.value = [...others, ...current];
    autoCurrentLabel();
    emit("update:modelValue", defaultValue.value);
    emit("change", defaultValue.value);

    if (checked && isTreeMode.value && !isProgrammaticCheck.value) {
        const nodeRef = currentTreeRef.getNode && currentTreeRef.getNode(data);
        const isRoot = nodeRef && nodeRef.level === 1;
        if (isRoot) {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (selectRefs.value && typeof selectRefs.value.blur === 'function') {
                        selectRefs.value.blur();
                    }
                }, 0);
            })
        }
    }
};
// 树-节点点击（单选）
let handleTreeNodeClick = (data) => {
    if (props.multiple) return;
    defaultValue.value = [{ id: data[treeIdKey.value], name: data[treeLabelKey.value] }];
    autoCurrentLabel();
    emit("update:modelValue", defaultValue.value);
    emit("change", defaultValue.value);
};
// 表格显示隐藏回调
let visibleChange = (visible) => {
    if (visible) {
        keyword.value = null;
        getData();
    } else {
        autoCurrentLabel();
    }
};

// tags删除后回调
let removeTag = (item) => {
    // 列表模式：同步取消选中标记
    if (!isTreeMode.value) {
        let cutTabItem = tabList.value.filter(
            (el) => cutTabCode.value == el.name
        )[0];
        tabData.value.forEach((el) => {
            if (item.id == el[cutTabItem.itemId]) {
                el.isActive = false;
            }
        });
    } else {
        // 树模式：取消对应节点勾选
        const currentTreeRef = treeRefMap[cutTabCode.value] || singleTreeRef.value;
        if (currentTreeRef && currentTreeRef.setChecked) {
            currentTreeRef.setChecked(item.id, false, true);
        }
    }
    emit("update:modelValue", defaultValue.value);
};
//清空后的回调
let clear = () => {
    tabData.value.forEach((el) => {
        el.isActive = false;
    });
    emit("update:modelValue", defaultValue.value);
};
// 自定义搜索方法
let filterMethod = (keyword) => {
    if (!keyword) {
        keyword.value = null;
        // 树模式下清除过滤
        if (isTreeMode.value) {
            const currentTreeRef = treeRefMap[cutTabCode.value] || singleTreeRef.value;
            nextTick(() => currentTreeRef && currentTreeRef.filter(''))
        }
        return false;
    }
    keyword.value = keyword;
    if (isTreeMode.value) {
        const currentTreeRef = treeRefMap[cutTabCode.value] || singleTreeRef.value;
        nextTick(() => currentTreeRef && currentTreeRef.filter(keyword))
    } else {
        getData();
    }
};

// 树过滤方法
const filterTreeNode = (value, data) => {
    if (!value) return true;
    const label = (data && data[treeLabelKey.value]) || '';
    return String(label).toLowerCase().includes(String(value).toLowerCase());
};
</script>

<style lang="scss" scoped>
.ml-select-user-content {
    padding: 20px;
    .ml-select-tab {
        border: 1px solid #dcdfe6;
    }
    .item-li-box {
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .tab-item-title {
        font-size: 14px;
        box-sizing: border-box;
        display: flex;
        border-bottom: 1px solid #dcdfe6;
        border-top: 1px solid #dcdfe6;
        justify-content: center;
        align-items: center;
        height: 40px;
        background: #f5f7fa;
        .tab-item-check-box {
            width: 50px;
            border-right: 1px solid #dcdfe6;
        }
        .tab-item-title-text {
            flex: 1;
            font-weight: bold;
        }
    }
    .tab-item-li {
        font-size: 14px;
        cursor: pointer;
        line-height: 40px;
        border-bottom: 1px solid #dcdfe6;
        box-sizing: border-box;
        padding: 0 20px;
        &:last-child {
            border-bottom: 0;
        }
        &:hover {
            background: var(--el-color-primary);
            color: #fff;
        }
        .tab-item-icon {
            .tab-item-icon-el {
                position: relative;
                top: 2px;
            }
        }
    }
}
</style>