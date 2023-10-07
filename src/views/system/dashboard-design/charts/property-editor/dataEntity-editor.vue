<template>
    <el-form-item label="图表数据实体">
        <el-select v-model="optionModel.dataEntity" filterable placeholder="选择实体">
            <el-option
                :label="op.label"
                :value="op.entityCode"
                v-for="(op,inx) of approveDialogEntityList"
                :key="inx"
            />
        </el-select>
    </el-form-item>
</template>
<script setup>
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { approveDialogEntityList } = storeToRefs(useCommonStore());
defineOptions({
    name: "dataEntity-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
</script>
<style lang="scss" scoped>
</style>
