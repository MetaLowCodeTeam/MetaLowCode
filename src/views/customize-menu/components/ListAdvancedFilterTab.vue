<template>
	<div class="list-advanced-filter-tab">
		<div 
            class="list-advanced-filter-tab-item" 
            v-for="(item, index) in advancedFilter" 
            :key="index"
            :class="{'active': advFilter === item.layoutConfigId}"
            @click="changeAdvFilter(item)"
        >
			{{ item.configName }}
		</div>
	</div>
</template>

<script setup>
import { inject } from "vue";
const $API = inject("$API");
const props = defineProps({
	advancedFilter: {
		type: Array,
		default: () => [],
	},
    advFilter: {
        type: String,
        default: "",
    },
    entityName: {
        type: String,
        default: "",
    },
    modelName: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["changeAdvFilter"]);

const changeAdvFilter = (item) => {
    let config = JSON.parse(item.config);
    emit("changeAdvFilter", {
        config,
        layoutConfigId: item.layoutConfigId,
    });  
    $API.layoutConfig.saveUserLayoutCache(
        "FILTER:" + props.entityName,
        item.layoutConfigId,
        props.modelName
    );
};
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
