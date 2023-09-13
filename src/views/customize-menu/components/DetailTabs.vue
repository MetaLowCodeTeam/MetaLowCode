<template>
    <div class="detail-tabs">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane
                v-for="(tab,tabInx) of tabs"
                :key="tabInx"
                :label="tab.label"
                :name="tab.name"
            ></el-tab-pane>
        </el-tabs>
        <span class="setting-tabs">
            <el-icon>
                <ElIconSetting />
            </el-icon>
        </span>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
const props = defineProps({
    tabs: { type: Array, default: () => [] },
    activeName: { type: String, default: "" },
});

let activeName = ref("");
onMounted(() => {
    activeName.value = props.tabs[0].name;
});

const handleClick = () => {};
</script>
<style lang='scss' scoped>
.detail-tabs {
    position: relative;
    .setting-tabs {
        cursor: pointer;
        font-size: 16px;
        position: absolute;
        top: 12px;
        right: -18px;
        &:hover {
            color: $ml-primary;
        }
    }
}
</style>