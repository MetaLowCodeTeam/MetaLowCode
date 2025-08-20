<template>
    <div class="chart-styles">
        <div class="c-s-t">入口样式</div>
        <el-form-item label="布局">
            <el-radio-group v-model="optionModel.setQuickNavConf.type">
                <el-radio :value="1">
                    <span class="radio-span">列表</span>
                </el-radio>
                <el-radio :value="2">
                    <span class="radio-span">卡片</span>
                </el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="宽度" v-if="cutDevice == 'pc'">
            <el-input-number v-model="optionModel.setQuickNavConf.itemWidth" :min="100"></el-input-number>
        </el-form-item>
        <el-form-item label="宽度(删格)" v-if="cutDevice == 'mobile'">
            <el-radio-group v-model="optionModel.setQuickNavConf.itemCol">
                <el-radio :value="1">
                    <span class="radio-span">12</span>
                </el-radio>
                <el-radio :value="2">
                    <span class="radio-span">24</span>
                </el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="边框是否显示">
            <el-switch v-model="optionModel.setQuickNavConf.borderIsShow"></el-switch>
        </el-form-item>

        <div class="c-s-t mt-20">入口列表</div>
        <span class="ml-a-span" @click="openAddDialog(1,null)">+ 添加入口</span>
    </div>
    <div class="sortable-box clearfix mt-5">
        <VueDraggableNext
            ghost-class="ghost"
            chosen-class="chosenClass"
            animation="300"
            :force-fallback="false"
            handle=".paren-div"
            :list="quickNavConf.inletList"
        >
            <div class="parent-li" v-for="(item,inx) of quickNavConf.inletList" :key="inx">
                <div class="paren-div">
                    <div class="fl item text-ellipsis">
                        <el-icon class="span-icon" v-if="!item.useIcon">
                            <Notebook />
                        </el-icon>
                        <el-icon class="span-icon" v-else :color="item.iconColor">
                            <component :is="item.useIcon" />
                        </el-icon>
                        {{ item.name }}
                    </div>
                    <div class="action-box fl">
                        <span class="action-icon edit mr-5" @click.stop="openAddDialog(2,item)">
                            <el-icon>
                                <EditPen />
                            </el-icon>
                        </span>
                        <span class="action-icon del" @click.stop="deleteInlet(item)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </span>
                    </div>
                </div>
            </div>
        </VueDraggableNext>
    </div>
    <QuickNavInletDialog ref="QuickNavInletDialogRefs" @onConfirm="inletConfirm" />
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
// 入口弹框
import QuickNavInletDialog from "./components/QuickNavInletDialog.vue";
// 拖拽组件
import { VueDraggableNext } from "vue-draggable-next";
import { useRouter } from "vue-router";

defineOptions({
    name: "setQuickNavConf-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});

const Router = useRouter();

const emits = defineEmits(["update:optionModel"]);

let quickNavConf = ref({});
let myOptionModel = ref({});

let cutDevice = ref("pc");

watch(
    () => props.optionModel,
    () => {
        initQuickNavConf();
    },
    { deep: true }
);
onMounted(() => {
    document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    cutDevice.value = Router.currentRoute.value.query.type;
    initQuickNavConf();
});

const initQuickNavConf = () => {
    myOptionModel.value = props.optionModel;
    quickNavConf.value = props.optionModel.setQuickNavConf;
};

const deleteInlet = (item) => {
    quickNavConf.value.inletList = quickNavConf.value.inletList.filter(el => el.guid != item.guid);
    emits('update:optionModel',{
        ...myOptionModel.value,
        setQuickNavConf: quickNavConf.value
    })
}

/**
 * 添加入口
 */
let QuickNavInletDialogRefs = ref("");

const openAddDialog = (type, cut) => {
    QuickNavInletDialogRefs.value.openDialog(
        type,
        cut,
        quickNavConf.value.inletList
    );
};

// 入口确认
const inletConfirm = (list) => {
    quickNavConf.value.inletList = JSON.parse(JSON.stringify(list));
};
</script>
<style lang="scss" scoped>
.chart-styles {
    padding-top: 20px;
    .c-s-t {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
    }
    .question-icon {
        cursor: pointer;
        margin-left: 5px;
        position: relative;
        top: 4px;
    }
    .currency-symbol {
        .user-left {
            display: inline-block;
            width: calc(100% - 25px);
        }
    }
    .radio-span {
        font-size: 13px;
        position: relative;
        top: 1px;
    }
    .ml-a-span {
        font-size: 14px;
    }
}
.span-icon {
    position: relative;
    top: 2px;
}
.sortable-box {
    .parent-li {
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        padding-left: 5px;
        width: 100%;
        cursor: move;

        .item {
            width: calc(100% - 55px);
        }
        .action-box {
            width: 50px;
            display: none;
            .action-icon {
                display: inline-block;
                height: 32px;
                width: 20px;
                border-radius: 4px;
                cursor: pointer;
                text-align: center;
                .el-icon {
                    position: relative;
                    top: 1px;
                }
                &:hover {
                    color: var(--el-color-primary);
                }
            }
        }
        &:hover {
            background: #f5f6f8;
            .action-box {
                display: block;
            }
        }
    }
}

.ghost {
    background: #fff !important;
    border: 1px dashed #999;
    .mover,
    .item {
        opacity: 0;
    }
}
.chosenClass {
    background: #fff;
    // background-color: #f1f1f1;
}
</style>
