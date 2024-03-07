<template>
    <!-- 树状分组筛选 -->
    <el-tree
        :data="treeData"
        :props="treeProps"
        :accordion="myTreeGroupConf.isAccordion"
        v-loading="loading"
        show-checkbox
        class="flow-tree"
        node-key="treeId"
        @check-change="handleCheckChange"
        @check="handleCheck"
        ref="TreeRef"
        @node-expand="nodeExpand"
    />
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
/**
 * API
 */
import { groupTreeQuery } from "@/api/crud";
// @node-click="handleNodeClick"
const props = defineProps({
    treeGroupConf: {
        type: Object,
        default: () => {},
    },
    entityName: {
        type: String,
        default: "",
    },
});

const emits = defineEmits(["check"]);

// 树状分组配置
let myTreeGroupConf = ref({});
// 树数据
let treeData = ref([]);
// 树结构
let treeProps = ref({
    children: "children",
    label: "label",
});
// 默认展开节点-防止el-tree多次请求后折叠
let expaAndList = ref([]);
// 加载状态
let loading = ref(false);
watch(
    () => props.treeGroupConf,
    () => {
        initMyTreeGroupConf();
    },
    {
        deep: true,
    }
);

onMounted(() => {
    initMyTreeGroupConf();
});

const initMyTreeGroupConf = () => {
    myTreeGroupConf.value = JSON.parse(JSON.stringify(props.treeGroupConf));
    let { groupList } = myTreeGroupConf.value;
    if (groupList) {
        treeData.value = groupList[0].fieldGroup.map((el, inx) => {
            el.label = el.label;
            el.children = [{}];
            el.treeIndex = 0;
            el.treeId = inx + 1;
            el.isSelected = false;
            return el;
        });
    }
};

// 节点展开触发
const nodeExpand = async (data) => {
    if (data.children && JSON.stringify(data.children) != "[{}]") {
        return;
    }
    loading.value = true;
    let list = await getGroupTree(data);
    data.children = JSON.parse(JSON.stringify(list));
    loading.value = false;
};

const getGroupTree = async (node) => {
    if (node.name) {
        let param = {
            entityName: props.entityName,
            groupField: node.name,
            filterEasySql: node.filterSql,
            filterList: [],
        };
        let nodeChildren = [];
        let res = await groupTreeQuery(param);
        if (res) {
            nodeChildren = formatNodeChildren(
                res.data,
                node.treeId,
                node.treeIndex
            );
        }
        return nodeChildren;
    } else {
        if(node.treeIndex == myTreeGroupConf.value.groupList.length - 1){
            return null;
        }
        return myTreeGroupConf.value.groupList[
            node.treeIndex + 1
        ].fieldGroup.map((el, inx) => {
            el.label = el.label;
            el.treeIndex = node.treeIndex + 1;
            el.filterSql = node.filterSql;
            el.treeId = node.treeId + "-" + (inx + 1);
            el.children = [{}];
            el.isSelected = false;
            return el;
        });
    }
};

const formatNodeChildren = (list, treeId, treeIndex) => {
    let newList = list.map((el, inx) => {
        el.treeIndex = treeIndex;
        el.treeId = treeId + "-" + (inx + 1);
        el.isSelected = false;
        el.children =
            el.children && el.children.length > 0
                ? formatNodeChildren(el.children, el.treeId, treeIndex)
                : [{}];
        return el;
    });
    return list;
};

let TreeRef = ref("");
const handleCheckChange = (data, checked, indeterminate) => {
    data.isSelected = checked;
};

const getFilterSqlList = (list, sqlList) => {
    if (!list || list.length == 0) {
        return;
    }
    list.forEach((el) => {
        if (el.isSelected) {
            if (el.filterSql) {
                sqlList.push(el.filterSql);
            }
        } else {
            getFilterSqlList(el.children, sqlList);
        }
    });
};

const handleCheck = () => {
    let sqlList = [];
    getFilterSqlList(treeData.value, sqlList);
    let sqlStr = "";
    if (sqlList && sqlList.length > 0) {
        sqlStr = sqlList.join(" OR ");
    }
    emits("check", sqlStr);
};
</script>
<style lang='scss' scoped>
.flow-tree {
    // box-sizing: border-box;
    // overflow: auto !important;
    :deep(.el-tree-node__content) {
        // display: block !important;
        align-self: baseline;
    }
    :deep(.el-tree-node__children) {
        // overflow: visible !important;
    }
    // 　　.el-tree-node__content{
    // 　　　　display: block!important;
    // 　　}
    // 　　.el-tree-node__children{
    // 　　　　overflow: visible!important;
    // 　　}
}
</style>