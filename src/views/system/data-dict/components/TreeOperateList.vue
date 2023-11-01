<template>
    <el-container class="main-container">
        <el-aside width="300px">
            <div class="fields-list" style="height: 100%;">
                <div class="fields-list-header">{{ title }}</div>
                <div class="fields-list-box" v-loading="treeLoading">
                    <el-scrollbar>
                        <el-tree
                            ref="treeRefs"
                            :data="treeList"
                            :props="treeProps"
                            highlight-current
                            empty-text="没有字段数据"
                            check-strictly
                            node-key="$inx"
                            @node-click="handleTreeNodeClick"
                        />
                    </el-scrollbar>
                </div>
            </div>
        </el-aside>
        <el-container class="main-container">
            <el-header class="main-header w-100">
                <div class="title fl">{{ cutNode.label }}</div>
                <div class="section-fr fr">
                    <el-button @click.stop="operateItem(false,'add')" :disabled="treeList.length < 1">
                        <span class="btn-icon-t1">
                            <el-icon>
                                <ElIconPlus />
                            </el-icon>
                        </span>
                        新增选项
                    </el-button>
                    <!-- <el-button type="primary" @click="onSave" :loading="mainLoading" :disabled="treeList.length < 1">保存</el-button> -->
                </div>
            </el-header>
            <el-main class="mian-box" v-loading="mainLoading">
                <el-scrollbar>
                    <el-empty v-if="mainList.length == 0" description="没有数据" />
                    <div class="op-item" v-for="(item,inx) of mainList" :key="inx">
                        <div class="op-item-text yichu" :title="item.label">{{ item.label }}</div>
                        <div class="op-icon-box">
                            <span title="插入" @click.stop="operateItem(inx,'ins')">
                                <el-icon>
                                    <ElIconPlus />
                                </el-icon>
                            </span>
                            <span title="上移" @click.stop="moveItem(inx,'top')">
                                <el-icon>
                                    <ElIconTop />
                                </el-icon>
                            </span>
                            <span title="下移" @click.stop="moveItem(inx,'down')">
                                <el-icon>
                                    <ElIconBottom />
                                </el-icon>
                            </span>
                            <span title="编辑" @click.stop="operateItem(inx,'edit',item)">
                                <el-icon>
                                    <ElIconEdit />
                                </el-icon>
                            </span>
                            <span title="删除" @click.stop="delItem(inx,item)">
                                <el-icon>
                                    <ElIconDelete />
                                </el-icon>
                            </span>
                        </div>
                    </div>
                </el-scrollbar>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { inject, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import http from "@/utils/request";
const props = defineProps({
    title: { type: String, default: "" },
    getTreeFn: { type: Function },
    getMainFn: { type: Function },
    saveFn: { type: Function },
});
const $ElMessage = inject("$ElMessage");
// 搜索参数
let keyword = ref("");
// 左侧树loading
let treeLoading = ref(false);
let treeList = ref([]);
let treeProps = reactive({
    children: "children",
    label: "label",
});
let treeRefs = ref("");
// 选中节点
let cutNode = ref({});
// 右侧主体loading
let mainLoading = ref(false);
let mainList = ref([]);
onMounted(() => {
    getTreeList();
});

// 获取tree数据
const getTreeList = async () => {
    treeLoading.value = true;
    mainLoading.value = true;
    let res = await props.getTreeFn();
    if (res) {
        treeList.value = formatTree(res.data || []);
        if (treeList.value.length > 0) {
            cutNode.value = treeList.value[0].children[0];
            nextTick(() => {
                treeRefs.value.setCurrentKey("1-1");
                getMainList();
            });
        } else {
            mainLoading.value = false;
        }
    } else {
        mainLoading.value = false;
    }
    treeLoading.value = false;
};
// 格式化Tree数据
const formatTree = (data) => {
    let formatArr = [];
    data.forEach((el, inx) => {
        let obj = {
            label: el.entityLabel,
            name: el.entityName,
            $inx: `${inx + 1}`,
            children: [],
        };
        el.fieldList.forEach((subEl, subInx) => {
            let subObj = {
                label: subEl.fieldLabel,
                name: subEl.fieldName,
                parentName: el.entityName,
                $inx: `${inx + 1}-${subInx + 1}`,
            };
            obj.children.push(subObj);
        });
        if (obj.children.length > 0) {
            formatArr.push(obj);
        }
    });
    return formatArr;
};

// 节点点击
const handleTreeNodeClick = (node) => {
    if (!node.children) {
        cutNode.value = node;
        getMainList();
    }
};

// 获取主体数据
const getMainList = async () => {
    mainLoading.value = true;
    let res = await props.getMainFn(
        cutNode.value.parentName,
        cutNode.value.name
    );
    if (res) {
        mainList.value = res.data || [];
    }
    mainLoading.value = false;
};

// 新增、插入、编辑
const operateItem = (inx, targe, item) => {
    let infoText = "";
    let inputValue = null;
    if (targe == "edit") {
        infoText = "请修改选项名称";
        inputValue = item.label;
    } else {
        infoText = "请输入选项名称";
    }
    ElMessageBox.prompt(infoText, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue,
        inputPattern:
            /^[A-Za-z\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d\d]+$/ /* 匹配由字母大小写、汉字或数字组成的字符串 */,
        inputErrorMessage: "输入不正确",
        beforeClose: (action, instance, done) => {
            if (action === "confirm") {
                if (instance.inputValue) {
                    let newItem = {
                        label: instance.inputValue,
                        value: getOptionMaxValue(),
                        saved: false,
                    };
                    console.log(newItem.label, "label");
                    //  判断选项是否存在
                    for (
                        let index = 0;
                        index < mainList.value.length;
                        index++
                    ) {
                        const el = mainList.value[index];
                        if (el.label == newItem.label) {
                            $ElMessage.warning(
                                "已存在【" + instance.inputValue + "】选项"
                            );
                            return;
                        }
                    }
                    // 插入
                    if (targe == "ins") {
                        mainList.value.splice(inx + 1, 0, newItem);
                    }
                    // 新增
                    else if (targe == "add") {
                        mainList.value.push(newItem);
                    }
                    // 编辑
                    else {
                        mainList.value[inx].label = newItem.label;
                    }
                }
            }
            done();
        },
    })
        .then(() => {
            onSave();
        })
        .catch(() => {});
};
const getOptionMaxValue = () => {
    let maxValue = 0;
    mainList.value.forEach((item, idx) => {
        if (item.value > maxValue) {
            maxValue = item.value;
        }
    });
    return maxValue + 1;
};
// 上移下移
const moveItem = (inx, target) => {
    let prevItem = { ...mainList.value[inx - 1] };
    let nextItem = { ...mainList.value[inx + 1] };
    if (target == "top") {
        if (inx == 0) {
            $ElMessage.warning("已经在最上面了");
        } else {
            mainList.value[inx - 1] = mainList.value[inx];
            mainList.value[inx] = prevItem;
        }
    } else {
        if (inx == mainList.value.length - 1) {
            $ElMessage.warning("已经在最下面面了");
        } else {
            mainList.value[inx + 1] = mainList.value[inx];
            mainList.value[inx] = nextItem;
        }
    }
    onSave();
};

// 删除
const delItem = (inx, item) => {
    ElMessageBox.confirm("确定删除该选项?", "提示")
        .then(async () => {
            if (!item.saved) {
                mainList.value.splice(inx, 1);
                $ElMessage.success("删除成功");
                return;
            }
            //TODO：后台需要检查改选项是否已被实体记录所引用！！
            if (props.title == "单选项管理") {
                let res = await http.get("/systemManager/optionCanBeDeleted", {
                    entity: cutNode.value.parentName,
                    field: cutNode.value.name,
                    value: item.value,
                });
                if(res){
                    if(res.data){
                        mainList.value.splice(inx, 1);
                        $ElMessage.success("删除成功");
                    }else {
                        $ElMessage.warning("该选项有数据正在使用，无法删除。");
                    }
                }
            } else {
                mainList.value.splice(inx, 1);
                $ElMessage.success("删除成功");
            }
        })
        .catch(() => {});
};

// 保存
const onSave = async () => {
    mainLoading.value = true;
    let res = await props.saveFn(
        cutNode.value.parentName,
        cutNode.value.name,
        mainList.value
    );
    if (res) {
        $ElMessage.success("保存成功");
        getMainList();
    }

    mainLoading.value = false;
};

// const getApprovalList = () => {};
</script>
<style lang="scss" scoped>
.main-container {
    background: #fff;
}
.main-header,
.fields-list-header {
    font-size: 14px;
    height: 54px;
    line-height: 54px;
    border-bottom: 1px dashed #eeeeee;
}
.fields-list-header {
    text-align: center;
    font-size: 16px;
}
.fields-list-box {
    height: calc(100% - 55px);
}
.main-header {
    padding: 0 20px;
    .title {
        font-size: 16px;
    }
    .btn-icon-t1 {
        position: relative;
        top: 1px;
        margin-right: 3px;
    }
}
.mian-box {
    // background: red;
    padding: 0;
    .op-item {
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        padding-left: 20px;
        border-bottom: 1px solid #eeeeee;
        position: relative;
        .op-item-text {
            float: left;
            max-width: calc(100% - 160px);
        }
        .op-icon-box {
            float: left;
            width: 125px;
            margin-left: 30px;
            display: none;
            & > span {
                position: relative;
                top: 2px;
                cursor: pointer;
                margin-left: 5px;
                &:hover {
                    color: var(--el-color-primary);
                }
            }
        }
        &:hover {
            background: #f5f5f5;
            .op-icon-box {
                display: block;
            }
        }
    }
}
</style>
