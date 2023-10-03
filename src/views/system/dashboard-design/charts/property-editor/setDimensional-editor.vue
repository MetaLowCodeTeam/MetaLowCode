<template>
    <el-form-item label="维度指标设置">
        <el-button @click="drawer = true">点击设置</el-button>
    </el-form-item>
    <el-drawer v-model="drawer" title="维度指标设置" size="460">
        <div class="drawer-main">
            <div class="form-box" ref="formBoxRefs">
                <el-form>
                    <el-form-item label="维度">
                        <div class="input-box">
                            <VueDraggableNext
                                class="draggable-box"
                                group="list"
                                @add="(e) => addCom(e,'dimension')"
                            >
                                <DimensionCom v-model="dimension" @onSort="onSort" isDimension />
                            </VueDraggableNext>
                        </div>
                    </el-form-item>
                    <el-form-item label="指标">
                        <div class="input-box">
                            <VueDraggableNext
                                class="draggable-box"
                                group="list"
                                @add="(e) => addCom(e,'metrics')"
                            >
                                <DimensionCom v-model="metrics" @onSort="onSort" />
                            </VueDraggableNext>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            <div class="item-box" ref="itemBoxRefs" :style="{'height': setItemBoxHeight()}">
                <div class="item-title">可用字段</div>
                <div class="item-list-box">
                    <el-scrollbar>
                        <VueDraggableNext
                            :list="fields"
                            :group="{ name: 'list', pull: 'clone',put: false }"
                        >
                            <div
                                class="item-list yichu"
                                v-for="(item,inx) of fields"
                                :key="inx"
                                :title="item.label"
                            >
                                <span class="lh">{{ item.type }}</span>
                                {{ item.label }}
                            </div>
                        </VueDraggableNext>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <template #footer>
            <div style="flex: auto;padding-top: 10px;">
                <el-button size="default" @click="onCancel">取消</el-button>
                <el-button size="default" type="primary" @click="drawer = false">确认</el-button>
            </div>
        </template>
    </el-drawer>
</template>
<script setup>
import { onMounted, ref, watch, inject } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import DimensionCom from "./components/DimensionCom.vue";
defineOptions({
    name: "setDimensional-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});

const $ElMessage = inject("$ElMessage");

watch(
    () => props.optionModel,
    () => {
        initDimensional();
    },
    { deep: true }
);
onMounted(() => {
    initDimensional();
});
let myOptionModel = ref({});
// 维度
let dimension = ref([]);
// 指标
let metrics = ref([]);
// 初始化纬度、指标
const initDimensional = () => {
    myOptionModel.value = props.optionModel;
    dimension.value = props.optionModel.setDimensional?.dimension || [];
    metrics.value = props.optionModel.setDimensional?.metrics || [];
};

/**
 * 所有字段
 */
let fields = [
    {
        label: "学历",
        alias: "学历",
        code: "code1",
        type: "N",
        sort: "",
        showEdit: false,
        editAlias: "",
        list: [
            {
                name: "本科",
            },
            {
                name: "博士",
            },
            {
                name: "博士后",
            },
            {
                name: "高中",
            },
            {
                name: "硕士",
            },
            {
                name: "专科",
            },
        ],
    },
    {
        label: "身份证",
        alias: "身份证",
        code: "code2",
        type: "N",
        sort: "",
        showEdit: false,
        editAlias: "",
        list: [
            {
                name: "5",
            },
            {
                name: "3",
            },
            {
                name: "4",
            },
            {
                name: "2",
            },
            {
                name: "6",
            },
            {
                name: "1",
            },
        ],
    },
    {
        label: "人数",
        alias: "人数",
        code: "code3",
        type: "N",
        sort: "",
        showEdit: false,
        editAlias: "",
        list: [
            {
                name: "6",
            },
            {
                name: "1",
            },
            {
                name: "2",
            },
            {
                name: "4",
            },
            {
                name: "3",
            },
            {
                name: "5",
            },
        ],
    },
    {
        label: "字段4",
        alias: "字段4",
        code: "code4",
        type: "S",
        sort: "",
        showEdit: false,
        editAlias: "",
        list: [
            {
                name: "2",
            },
            {
                name: "7",
            },
            {
                name: "5",
            },
            {
                name: "5",
            },
            {
                name: "1",
            },
            {
                name: "0",
            },
        ],
    },
    {
        label: "字段5",
        alias: "字段5",
        code: "code5",
        type: "S",
        sort: "",
        showEdit: false,
        editAlias: "",
        list: [
            {
                name: "14",
            },
            {
                name: "1",
            },
            {
                name: "5",
            },
            {
                name: "4",
            },
            {
                name: "7",
            },
            {
                name: "5",
            },
        ],
    },
];

let drawer = ref(false);
const onCancel = () => {
    console.log(dimension.value);
    drawer.value = false;
};
// 设置可选字段高度
let formBoxRefs = ref();
let itemBoxRefs = ref();
const setItemBoxHeight = () => {
    let formHeight = formBoxRefs.value?.offsetHeight;
    if (formHeight) {
        formHeight += 60;
        return "calc(100% - " + formHeight + "px)";
    }
    return "calc(100% - 175px)";
};
/**
 * 拖拽
 */

// 新加字段
const addCom = (e, target) => {
    let cutField = { ...fields[e.oldIndex] };

    let checkHasDimension = dimension.value.filter(
        (el) => el.label == cutField.label
    );
    let checkHasMetrics = metrics.value.filter(
        (el) => el.label == cutField.label
    );
    if (checkHasDimension.length > 0) {
        $ElMessage.warning("添加失败，同一字段不能重复添加维度");
        return;
    }
    if (checkHasMetrics.length > 0) {
        $ElMessage.warning("添加失败，同一字段不能重复添加指标");
        return;
    }
    let dimensionLength = dimension.value.length;
    let metricsLength = metrics.value.length;
    let { type } = props.optionModel;
    let max3 = ["barChart"];
    if (target == "dimension") {
        // 1个维度或多个指标
        // 2个维度或1个指标
        if (max3.includes(type)) {
            if (dimensionLength > 1) {
                $ElMessage.warning("添加失败，最多添加2个维度");
                return;
            }
            if (metricsLength > 1 && dimensionLength.length > 0) {
                $ElMessage.warning("添加失败，多个指标最多只能添加1个维度");
                return;
            }
        }
        dimension.value.push(cutField);
    }
    if (target == "metrics") {
        // 1个维度或多个指标
        // 2个维度或1个指标
        if (max3.includes(type)) {
            if (dimensionLength > 1 && metricsLength > 0) {
                $ElMessage.warning("添加失败，2个维度最多只能添加1个指标");
                return;
            }
        }
        metrics.value.push(cutField);
    }
};
const onSort = (e) => {
    dimension.value.forEach((el) => {
        el.sort = "";
    });
    metrics.value.forEach((el) => {
        el.sort = "";
    });
    e.tag.sort = e.target;
};
</script>
<style lang="scss" scoped>
.drawer-main {
    // padding: 20px;
    height: 100%;
    border-bottom: 1px solid #e5e5e5;
    .form-box {
        border-top: 1px solid #e5e5e5;
        padding: 20px;
        padding-bottom: 0;
        .input-box {
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            padding: 3px 10px;
            width: 100%;
            min-height: 32px;
            .draggable-box {
                min-height: 32px;
                .item-list {
                    display: none;
                }
            }
        }
    }
    .item-box {
        border-top: 1px solid #e5e5e5;
        padding: 20px 0;
        .item-title {
            font-size: 14px;
            font-weight: bold;
            padding-left: 20px;
        }
        .item-list-box {
            height: calc(100% - 12px);
            .item-list {
                padding-left: 15px;
                height: 32px;
                line-height: 32px;
                cursor: all-scroll;
                user-select: none;
                .lh {
                    color: var(--el-color-primary);
                }
                &:hover {
                    background: #e6e6e6;
                }
            }
        }
    }
}
</style>
