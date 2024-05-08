<template>
    <!-- 列表常用分组查询 -->
    <el-tree
        :data="treeData"
        :props="defaultProps"
        class="mb-5"
        @node-click="handleNodeClick"
        v-if="treeData.length > 0"
        highlight-current
        ref="TreeRef"
        node-key="layoutConfigId"
    >
        <template #default="{ node, data }">
            <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span v-if="data.layoutConfigId" class="custom-tree-btn">
                    <a @click.stop="editNode(data)">
                        <el-icon>
                            <ElIconEdit />
                        </el-icon>
                    </a>

                    <a style="margin-left: 8px" @click.stop="removeNode(data)">
                        <el-icon>
                            <ElIconDelete />
                        </el-icon>
                    </a>
                </span>
            </span>
        </template>
    </el-tree>
    <mlDialog title="常用分组查询保存" width="500" v-model="saveDialogConf.isShow">
        <div class="save-dialog" v-loading="saveLoading">
            <el-form label-width="40px" @submit.prevent>
                <el-form-item label="名称" class="mb-10">
                    <el-input v-model="saveDialogConf.configName" />
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <div class="footer-div">
                <el-button @click="saveDialogConf.isShow = false" :loading="saveLoading">取消</el-button>
                <el-button type="primary" @click="onSave" :loading="saveLoading">保存</el-button>
            </div>
        </template>
    </mlDialog>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
const props = defineProps({
    entityCode: { type: Number },
    layoutConfig: { type: Object, default: () => {} },
});
/**
 * API
 */
import layoutConfigApi from "@/api/layoutConfig";
import { ElMessage, ElMessageBox } from "element-plus";

const emits = defineEmits(["nodeClick", "onRefresh"]);

// 常用分组查询数据
let commonGroupFilterList = ref([]);
let myLayoutConf = ref({});
// 配置ID
let layoutConfigId = ref("");
// 保存loading
let saveLoading = ref(false);

let treeData = ref([]);

const defaultProps = {
    children: "children",
    label: "configName",
};

watch(
    () => props.layoutConfig,
    () => {
        loadLayoutConf();
    },
    {
        deep: true,
    }
);

onMounted(() => {
    loadLayoutConf();
});

// 初始化样式配置
const loadLayoutConf = () => {
    myLayoutConf.value = props.layoutConfig;
    let { COM_TREE_GROUP } = myLayoutConf.value;
    commonGroupFilterList.value = COM_TREE_GROUP || [];
    treeData.value = [];
    if (commonGroupFilterList.value.length > 0) {
        treeData.value = [
            {
                configName: "常用分组查询",
                children: [...commonGroupFilterList.value],
            },
        ];
    }
};

let TreeRef = ref("");

let filterEasySql = ref("");

// 树节点点击
const handleNodeClick = (node) => {
    // 点击标题无需处理
    if (node.configName == "常用分组查询") {
        return;
    }

    if (filterEasySql.value) {
        resetChecked();
    } else {
        filterEasySql.value = node.config;
    }

    emits("nodeClick", filterEasySql.value);
};

const editNode = (data) => {
    saveDialogConf.value = {
        isShow: true,
        filterEasySql: data.config,
        configName: data.configName,
    };
    layoutConfigId.value = data.layoutConfigId;
};

const removeNode = (data) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await layoutConfigApi.deleteConfig(data.layoutConfigId);
            if (res) {
                emits("onRefresh");
            }
        })
        .catch(() => {});
};
// 保存配置
let saveDialogConf = ref({
    isShow: false,
    filterEasySql: "",
    configName: "",
});

// 打开保存弹框
const openSaveDialog = (filterEasySql) => {
    saveDialogConf.value = {
        isShow: true,
        filterEasySql,
        configName: "",
    };
};

// 保存
const onSave = async () => {
    let { configName, filterEasySql } = saveDialogConf.value;
    let param = {
        configName,
        config: filterEasySql,
        entityCode: props.entityCode,
    };
    saveLoading.value = true;
    let res = await layoutConfigApi.saveConfig(
        layoutConfigId.value,
        "COM_TREE_GROUP",
        param
    );
    if (res) {
        ElMessage.success("保存成功");
        saveDialogConf.value.isShow = false;
        emits("onRefresh");
    }
    saveLoading.value = false;
};

const resetChecked = () => {
    filterEasySql.value = "";
    if (TreeRef.value) {
        TreeRef.value.setCurrentKey(null, false);
    }
};

defineExpose({
    openSaveDialog,
    resetChecked,
});
</script>
<style lang='scss' scoped>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    .custom-tree-btn {
        display: none;
    }
    &:hover {
        .custom-tree-btn {
            display: block;
        }
    }
}
</style>