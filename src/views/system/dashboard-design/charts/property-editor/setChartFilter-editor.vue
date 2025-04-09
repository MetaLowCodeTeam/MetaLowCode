<template>
    <el-form-item label="过滤条件" v-if="!optionModel.dsEnabled">
        <el-button @click="setCondition">{{ setConditionText }}</el-button>
        <!-- <div class="ml-a-span" @click="setCondition" v-else></div> -->
    </el-form-item>
    <mlDialog title="过滤条件" append-to-body width="37%" v-model="dialogIsShow">
        <mlSetConditions
            v-if="dialogIsShow"
            v-model="conditionConf"
            footer
            @cancel="dialogIsShow = false"
            @confirm="conditionConfirm"
            :entityName="cutEntityName"
        >
        </mlSetConditions>
    </mlDialog>
</template>
<script setup>
import { ref, watch, onMounted, inject, watchEffect } from "vue";
const $ElMessage = inject("$ElMessage");
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { allEntityName } = storeToRefs(useCommonStore());
defineOptions({
    name: "setChartFilter-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
const emits = defineEmits(["update:optionModel"]);
let cutOption = ref({});

let cutEntityName = ref("");


/***
 *  ****************************************** 过滤条件相关 beg
 */

let conditionConf = ref({});
let dialogIsShow = ref(false);
let setConditionText = ref("");
// 设置条件
const setCondition = () => {
    if (!props.optionModel.dataEntity) {
        $ElMessage.warning("请先选择图标数据实体");
        return;
    }
    let actionFilter = initFilter({ ...cutOption.value?.setChartFilter });
    conditionConf.value = JSON.parse(JSON.stringify(actionFilter));
    dialogIsShow.value = true;
};
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

// 获取设置条件文案
const getSetConditionText = () => {
    let actionFilter = { ...cutOption.value?.setChartFilter };
    let length =
        actionFilter && actionFilter?.items ? actionFilter?.items.length : 0;

    setConditionText.value =
        length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    cutOption.value.setChartFilter = Object.assign({}, e);
    dialogIsShow.value = false;
    emits("update:optionModel", cutOption.value);
};

watchEffect(()=>{
    cutOption.value = props.optionModel;
    cutEntityName.value = cutOption.value.dataEntity == 33 ? "ApprovalTask" : allEntityName.value[cutOption.value.dataEntity];
    getSetConditionText();
})

/***
 *  ****************************************** 过滤条件相关 end
 */
</script>
<style lang="scss" scoped>
</style>
