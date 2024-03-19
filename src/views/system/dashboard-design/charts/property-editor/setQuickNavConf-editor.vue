<template>
    <div class="chart-styles">
        <div class="c-s-t">入口样式</div>
        <el-radio-group v-model="optionModel.setQuickNavConf.type">
            <el-radio :label="1">
                <span class="radio-span">列表</span>
            </el-radio>
            <el-radio :label="2">
                <span class="radio-span">卡片</span>
            </el-radio>
        </el-radio-group>
        <div class="c-s-t mt-20">入口列表</div>
        <span class="ml-a-span" @click="openAddDiaog">+ 添加入口</span>
    </div>
    <QuickNavInletDialog ref="QuickNavInletDialogRefs" />
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
// 入口弹框
import QuickNavInletDialog from "./components/QuickNavInletDialog.vue";
defineOptions({
    name: "setQuickNavConf-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});

let quickNavConf = ref({});

watch(
    () => props.optionModel,
    () => {
        initQuickNavConf();
    },
    { deep: true }
);
onMounted(() => {
    initQuickNavConf();
});

const initQuickNavConf = () => {
    quickNavConf.value = props.optionModel.setQuickNavConf;
};

/**
 * 添加入口
 */
let QuickNavInletDialogRefs = ref("");
let navList = ref([]);

const openAddDiaog = () => {
    QuickNavInletDialogRefs.value.openDialog(1);
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
}
</style>
