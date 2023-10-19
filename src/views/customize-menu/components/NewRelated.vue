<template>
    <!--  -->
    <el-dropdown trigger="click" @command="handleCommand">
        <el-button icon="plus">新建相关</el-button>
        <template #dropdown>
            <el-dropdown-menu>
                <template v-if="addConf?.config">
                    <el-dropdown-item v-for="(item,inx) of JSON.parse(addConf.config)" :key="inx" :command="item">
                        {{ item.columnAliasName || item.entityLabel }}
                    </el-dropdown-item>
                </template>
                <el-dropdown-item divided command="openSetDialog">配置新建项</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
    <DetailTabsSet
        ref="detailTabsSetRefs"
        :entityCode="entityCode"
        :entityName="entityName"
        @confirm="confirm"
        applyType="ADD"
    />
</template>

<script setup>
import { ref } from "vue";
import DetailTabsSet from "./DetailTabsSet.vue";
const props = defineProps({
    entityName: { type: String, default: "" },
    entityCode: { type: Number },
    addConf: { type: Object, default: () => {} },
});
const emits = defineEmits(["confirm",'add']);
// let addConfList = ref([]);

const handleCommand = (e) => {
    if (e === "openSetDialog") {
        openSetDialog();
    } else {
        emits("add",e)
    }
};

// 打开新建配置弹框
let detailTabsSetRefs = ref();
const openSetDialog = () => {
    detailTabsSetRefs.value.openDialog(props.addConf);
};
// 保存新建配置
const confirm = () => {
    emits('confirm')
};
</script>
<style lang='scss' scoped>
</style>