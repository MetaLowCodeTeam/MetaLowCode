<template>
    <!--  -->
    <el-dropdown trigger="click" @command="handleCommand">
        <el-button type="primary" plain icon="plus">新建相关</el-button>
        <template #dropdown>
            <el-dropdown-menu>
                <template v-if="myAddConfig.length > 0">
                    <el-dropdown-item
                        v-for="(item,inx) of myAddConfig"
                        :key="inx"
                        :command="item"
                    >{{ item.columnAliasName || item.entityLabel }}</el-dropdown-item>
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
import { inject, ref, watchEffect } from "vue";
import DetailTabsSet from "./DetailTabsSet.vue";
const $TOOL = inject("$TOOL")
const props = defineProps({
    entityName: { type: String, default: "" },
    entityCode: { type: Number },
    addConf: { type: Object, default: () => {} },
    // 是否显示新建项
    checkNewRelatedFilter: {
        type: Object,
        default: () => ({})
    }
});
const emits = defineEmits(["confirm", "add"]);
let myAddConfig  = ref([]);
watchEffect(() => {
    myAddConfig.value = [];
    if(props.addConf?.config) {
        let config = JSON.parse(props.addConf.config);
        config.forEach((el,inx) => {
            if($TOOL.checkRole('r' + el.entityCode + '-2') && props.checkNewRelatedFilter[inx]){
                myAddConfig.value.push(el);
            }
        });
    }
})

const handleCommand = (e) => {
    if (e === "openSetDialog") {
        openSetDialog();
    } else {
        emits("add", e);
    }
};

// 打开新建配置弹框
let detailTabsSetRefs = ref();
const openSetDialog = () => {
    detailTabsSetRefs.value.openDialog(props.addConf);
};
// 保存新建配置
const confirm = () => {
    emits("confirm");
};
</script>
<style lang='scss' scoped>
</style>
