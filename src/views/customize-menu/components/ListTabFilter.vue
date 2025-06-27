<template>
	<div class="list-advanced-filter-tab">
		<div 
            class="list-advanced-filter-tab-item" 
            v-for="(item, index) in listTabs" 
            :key="index"
            :class="{'active': currentTab === item.key}"
            @click="changeTab(item)"
        >
			{{ item.name }}
		</div>
	</div>
</template>

<script setup>
import { inject, ref } from "vue";
const $API = inject("$API");
const props = defineProps({
	listTabs: {
		type: Array,
		default: () => [],
	},
    currentTab: {
        type: [Number, String],
        default: 0,
    },
});

const emit = defineEmits(["changeTab"]);
const changeTab = (item) => {
    emit("changeTab", item);
}
</script>

<style scoped lang="scss">
/* Styles here */
.list-advanced-filter-tab {
	display: flex;
}
.list-advanced-filter-tab-item {
	cursor: pointer;
    box-sizing: border-box;
    padding: 0 10px;
    height: 32px;
    line-height: 32px;
    border: 1px solid #e5e5e5;
    border-right: none;
    background: #fff;
    border-bottom: none;
    min-width: 80px;
    text-align: center;
    &:first-child {
        border-radius: 4px 0 0 0;
    }
    &:last-child {
        border-right: 1px solid #e5e5e5;
        border-radius: 0 4px 0 0;
    }
    &.active {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        &+ .list-advanced-filter-tab-item {
            border-left-color: var(--el-color-primary);
        }
    }
}
</style>
