<template>
    <!--  -->
    <div class="ml-list-advanced-query">
        <el-select ref="selectRefs" style="width: 210px;" v-model="defaultValue" @focus="showAdvfilter = false">
            <template #empty>
                <div class="select-content">
                    <div
                        class="item"
                        :class="{'is-active':defaultId == op.layoutConfigId}"
                        v-for="(op,inx) of opList"
                        :key="inx"
                        @click="changeOp(op)"
                    >
                        <div class="item-text fl text-ellipsis">{{ op.configName }}</div>
                        <div
                            class="item-icon fl"
                            v-if="op.layoutConfigId !== 'all' && $TOOL.checkRole('r6008')"
                        >
                            <span class="icon-span add-icon mr-5" @click.stop="editAdv(op)">
                                <el-icon size="15">
                                    <ElIconEditPen />
                                </el-icon>
                            </span>
                            <span class="icon-span" @click.stop="deleteConfig(op,inx)">
                                <el-icon size="16">
                                    <ElIconCloseBold />
                                </el-icon>
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </el-select>
        <div class="select-filter" @click="showAdvfilter = !showAdvfilter">
            <el-icon class="select-filter-icon" size="16">
                <ElIconFilter />
            </el-icon>
            <span v-if="isShowTag" class="select-filter-tag">●</span>
        </div>
        <div class="dropdown-menu-advfilter" :class="{'isShow':showAdvfilter}">
            <div class="close-icon" @click="showAdvfilter = false">
                <el-icon><CircleClose /></el-icon>
            </div>
            <div class="conditionConf">
                <mlSetConditions
                    ref="mlSetConditionsRefs"
                    v-model="conditionConf"
                    @confirm="conditionConfirm"
                    :entityName="entityName"
                />
            </div>
            <div class="footer-box">
                <el-dropdown
                    split-button
                    type="primary"
                    @click="queryNow"
                    trigger="click"
                    popper-class="advfilter-popper"
                    @command="handleCommand"
                >
                    <el-icon>
                        <ElIconSearch />
                    </el-icon>立即查询
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="save">保存到常用查询</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-button class="ml-10" style="margin-top:-4px;height: 33px;" @click="refresh">
                    <el-icon>
                        <ElIconRefreshLeft />
                    </el-icon>重置
                </el-button>
            </div>
        </div>
        <mlDialog title="保存高级查询" width="600" v-model="saveDialog.isShow">
            <div class="save-dialog" style="padding-right: 50px;" v-loading="saveLoading">
                <el-form label-width="120px" @submit.prevent>
                    <el-form-item label="名称" class="mb-10">
                        <el-input v-model="saveDialog.configName" />
                    </el-form-item>
                    <el-form-item label=" " class="mb-10" v-if="$TOOL.checkRole('r6008')">
                        <mlShareTo v-model="saveDialog.shareTo" />
                    </el-form-item>
                    <el-form-item label=" ">
                        <el-button type="primary" style="width: 80px;" @click="saveConfirm">确定</el-button>
                        <el-button style="width: 80px;" @click="saveDialog.isShow = false">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </mlDialog>
        <mlDialog
            title="修改高级查询"
            width="600"
            v-model="editAdvDailog.isShow"
            v-if="editAdvDailog.isShow"
        >
            <div class="save-dialog" v-loading="saveLoading">
                <div class="conditionConf">
                    <mlSetConditions
                        ref="mlSetConditionsRefs"
                        v-model="editAdvDailog.config"
                        @confirm="editConditionsConfirm"
                        :entityName="entityName"
                    />
                </div>

                <div style="border-top: 1px solid #eee;padding-top: 20px;">
                    <el-form label-width="40px">
                        <el-form-item label="名称" class="mb-10">
                            <el-input v-model="editAdvDailog.configName" />
                        </el-form-item>
                        <el-form-item label=" " class="mb-10" v-if="$TOOL.checkRole('r6008')">
                            <mlShareTo v-model="editAdvDailog.shareTo" />
                        </el-form-item>
                        <el-form-item label=" ">
                            <el-button type="primary" style="width: 80px;" @click="editConfirm">确定</el-button>
                            <el-button style="width: 80px;" @click="editAdvDailog.isShow = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </mlDialog>
    </div>
</template>

<script setup>
import {
    ref,
    watch,
    onMounted,
    inject,
    nextTick,
    reactive,
    onBeforeMount,
    onBeforeUnmount,
} from "vue";
import mlShareTo from "@/components/mlShareTo/index.vue";
const $ElMessage = inject("$ElMessage");
import { ElMessageBox } from "element-plus";
const $API = inject("$API");
const $TOOL = inject("$TOOL");
const props = defineProps({
    modelValue: null,
    entityName: { type: String, default: "" },
    entityCode: { 
        type: [Number, String],
        default: "" 
    },
    filter: { type: Array, default: () => [] },
    // 实体模块名称
    modelName: {
        type: String,
        default: "",
    },
});
const emits = defineEmits([
    "queryNow",
    "refresh",
    "changeAdvFilter",
    "onAddAdv",
]);
// 默认选中
let defaultValue = ref("");
let defaultId = ref("");
// 下拉框元素
let selectRefs = ref("");
// 下拉元素
let opList = ref([
    {
        configName: "全部数据",
        layoutConfigId: "all",
    },
]);
// 是否显示高级查询条件
let showAdvfilter = ref(false);
let mlSetConditionsRefs = ref("");
// 是否显示小标识
let isShowTag = ref(false);
watch(
    () => props.modelValue,
    () => {
        initData();
    },
    { deep: true }
);
watch(
    () => props.filter,
    () => {
        initData();
    },
    { deep: true }
);

onBeforeMount(() => {
    // document.addEventListener("click", (e) => {
    //     let skipClass = [
    //         "field-one",
    //         "el-icon remove-icon",
    //         "el-overlay-dialog",
    //         "el-picker-panel__body-wrapper",
    //         "el-picker-panel__body"
    //     ];
    //     let isSkipClass = skipClass.includes(
    //         e.target.parentElement?.parentElement?.className
    //     );
    //     if (isSkipClass) {
    //         return;
    //     }
    //     console.log(e.target.className,'e.target.className')
    //     if (skipClass.includes(e.target.className)) {
    //         return;
    //     }
    //     let box = document.querySelector(".dropdown-menu-advfilter");
    //     let box2 = document.querySelector(".select-filter");
    //     let box3 = document.querySelector(".advfilter-popper");
    //     let box4 = document.querySelector(".el-overlay-dialog");
    //     let box5 = document.querySelector(".save-dialog");
    //     let box6 = document.querySelector(".mlselect-user-content");
    //     let box7 = document.querySelector(".reference-dialog");
    //     if (
    //         (box && box.contains(e.target)) ||
    //         (box2 && box2.contains(e.target)) ||
    //         (box3 && box3.contains(e.target)) ||
    //         (box4 && box4.contains(e.target)) ||
    //         (box5 && box5.contains(e.target)) ||
    //         (box6 && box6.contains(e.target)) ||
    //         (box7 && box7.contains(e.target))
    //     ) {
    //         // 不隐藏
    //     } else {
    //         showAdvfilter.value = false;
    //     }
    // });
});
onBeforeUnmount(() => {
    // document.removeEventListener("click", null);
});
onMounted(() => {
    initData();
});

// 初始化数据
const initData = () => {
    // console.log(props.filter,'filter')
    opList.value = [...props.filter];
    opList.value.unshift({
        configName: "全部数据",
        layoutConfigId: "all",
    });
    autoCurrentLabel(props.modelValue);
};

// 自动模拟options赋值
const autoCurrentLabel = (key) => {
    nextTick(() => {
        let findOp = opList.value.filter((el) => el.layoutConfigId == key);
        if(findOp && findOp.length > 0) {
            defaultValue.value = findOp[0].configName;
            defaultId.value = findOp[0].layoutConfigId;
        }
    });
};

const changeOp = (op) => {
    autoCurrentLabel(op.layoutConfigId);
    selectRefs.value.visible = false;
    emits("changeAdvFilter", op.config ? JSON.parse(op.config) : {});
    $API.layoutConfig.saveUserLayoutCache(
        "FILTER:" + props.entityName,
        op.layoutConfigId
    );
};

/***
 *  ****************************************** 过滤条件相关 beg
 */
// 条件框传值
let conditionConf = ref({
    type: 1,
    items: [],
    equation: "OR",
});

// 初始化条件
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

// 当前操作
let cutAction = ref("");

// 保存弹框
let saveDialog = reactive({
    isShow: false,
    filter: {},
    shareTo: "SELF",
});

let saveLoading = ref(false);

// 保存确认
let saveConfirm = async () => {
    let { configName, shareTo, filter } = saveDialog;
    if (!configName) {
        $ElMessage.warning("请填写名称");
        return;
    }
    let param = {
        configName,
        shareTo,
        config: JSON.stringify(filter),
        entityCode: props.entityCode,
    };
    saveLoading.value = true;
    let res = await $API.layoutConfig.saveConfig(
        saveDialog.layoutConfigId,
        "FILTER",
        param,
        props.modelName
    );
    if (res) {
        $ElMessage.success("保存成功");
        saveDialog.isShow = false;
        editAdvDailog.isShow = false;
        showAdvfilter.value = false;
        emits("onAddAdv");
    }
    saveLoading.value = false;
};

let editAdvDailog = reactive({
    isShow: false,
});

// 编辑常量查询
const editAdv = (op) => {
    editAdvDailog = Object.assign(editAdvDailog, op);
    editAdvDailog.isShow = true;
    editAdvDailog.config = initFilter(JSON.parse(editAdvDailog.config));
    selectRefs.value.visible = false;
};

// 编辑条件调用
const editConditionsConfirm = (e) => {
    saveDialog = { ...editAdvDailog };
    saveDialog.isShow = false;
    saveDialog.filter = { ...editAdvDailog.config };

    saveConfirm();
};

// 编辑确认
const editConfirm = () => {
    mlSetConditionsRefs.value.confirm();
};

// 删除常用查询
const deleteConfig = (op, inx) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await $API.layoutConfig.deleteConfig(op.layoutConfigId);
            if (res) {
                // 如果删除的是当前选中
                if (defaultId.value == op.layoutConfigId) {
                    changeOp({
                        configName: "全部数据",
                        layoutConfigId: "all",
                    });
                    selectRefs.value.visible = false;
                }
                opList.value.splice(inx, 1);
            }
        })
        .catch(() => {});
};

// 高级查询确认
const conditionConfirm = (e) => {
    saveDialog.filter = { ...e };
    isShowTag.value = false;
    if(saveDialog.filter?.items?.length > 0) {
        isShowTag.value = true;
    }
    if (cutAction.value == "queryNow") {
        showAdvfilter.value = false;
        
        emits(cutAction.value, e);
    }
    if (cutAction.value == "save") {
        saveDialog.isShow = true;
    }
};

// 立即查询
const queryNow = () => {
    cutAction.value = "queryNow";
    mlSetConditionsRefs.value.confirm(true);
};
// 重置
const refresh = () => {
    emits("refresh");
    isShowTag.value = false;
    showAdvfilter.value = false;
};
// 保存到常量查询
const handleCommand = (e) => {
    if (e == "save") {
        cutAction.value = "save";
        mlSetConditionsRefs.value.confirm();
    }
};
</script>
<style lang='scss' scoped>
.ml-list-advanced-query {
    display: inline-block;
    position: relative;
    text-align: left;
}
.select-content {
    padding: 10px 0;
    font-size: 13px;
    line-height: 34px;
    color: #504e4e;
    min-width: 210px;
    text-align: left;
    .item {
        padding: 0 10px;

        &.is-active {
            color: var(--el-color-primary);
        }
        height: 34px;
        .item-text {
            width: calc(100% - 40px);
        }
        .item-icon {
            // margin-top: 2px;
            height: 20px;
            line-height: 20px;
            margin-top: 9px;
            display: none;
            .icon-span {
                color: #a1a1a1;
                cursor: pointer;
                &.add-icon {
                    position: relative;
                    top: -1px;
                }
                &:hover {
                    color: #666;
                }
            }
        }
        &:hover {
            background: #eeeeee;
            .item-icon {
                display: block;
            }
        }
    }
}
.select-filter {
    display: inline-block;
    line-height: 30px;
    border: 1px solid #dcdfe6;
    vertical-align: middle;
    border-left: 0;
    width: 30px;
    text-align: center;
    cursor: pointer;
    position: relative;
    &:hover {
        border-color: #c0c4cc;
    }
    .select-filter-icon {
        color: #504e4e;
        position: relative;
        top: 4px;
    }
    .select-filter-tag {
        color: #fdd455;
        position: absolute;
        right: 1px;
        top: -12px;
        // right: 0;
        // top: 0;
    }
}
.dropdown-menu-advfilter {
    position: absolute;
    top: 47px;
    left: 0;
    z-index: 1999;
    // border: 1px solid rgba(0,0,0,.125);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    display: none;
    width: 600px;
    padding: 20px 0;
    padding-bottom: 0;
    line-height: 34px;
    font-size: 14px;
    padding-top: 30px;
    &.isShow {
        display: block;
    }
    .footer-box {
        border-top: 1px solid #eee;
        padding: 10px 20px 10px 0;
        text-align: right;
    }
    .close-icon {
        width: 26px;
        height: 26px;
        text-align: center;
        line-height: 26px;
        position: absolute;
        right: 0;
        top: 0px;
        border-radius: 0 3px 0 0;
        cursor: pointer;
        font-size: 18px;
        box-sizing: border-box;
        padding-top: 4px;
        padding-left: 1px;
        color: #9c9da0;
        &:hover {
            background: #f2f6fc;
            color: #303030;
        }
    }
}
.conditionConf {
    padding: 0 20px;
    padding-bottom: 10px;
    line-height: 34px;
}
.quick-query {
    display: inline-block;
}
</style>