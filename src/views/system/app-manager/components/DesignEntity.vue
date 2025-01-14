<style lang="scss" scoped>
.entity-header {
    position: relative;
    height: 40px;
}
.entity-tabs {
    margin: 0 auto;
    .entity-tab {
        height: 40px;
        display: inline-block;
        box-sizing: border-box;
        padding: 0 10px;
        line-height: 50px;
        cursor: pointer;
        font-size: 15px;
        font-weight: bold;
        &.active {
            color: var(--el-color-primary);
        }
    }
}
.entity-main {
    padding: 0;
}
</style>
<template>
	<el-container>
		<el-header class="entity-header">
			<div class="entity-tabs">
				<span
					class="entity-tab"
					v-for="tab in tabList"
					:key="tab.value"
					@click="handleTabClick(tab)"
					:class="{ active: currentTab === tab.value }"
				>
					{{ tab.label }}
				</span>
			</div>
		</el-header>
		<el-main class="entity-main">
			<EntityFieldTable v-if="currentTab == 'EntityDataModel'" isDesign/>
			<FormDesign v-else-if="currentTab == 'EntityFormDesign'" />
			<EntityList v-else isDesign/>
		</el-main>
	</el-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 组件
import EntityFieldTable from "@/views/system/entity-field-table.vue";
import FormDesign from "@/views/system/form-design/index.vue";
import EntityList from "@/views/customize-menu/list.vue";

const router = useRouter();


// 实体信息
let entityInfo = ref({});
// 当前tab
let currentTab = ref("EntityDataModel");
// tab信息
const tabList = ref([
	{ label: "数据模型", value: "EntityDataModel" },
	{ label: "表单设计", value: "EntityFormDesign" },
	{ label: "列表设计", value: "EntityListDesign" },
]);

onMounted(() => {
	let { entity, entityLabel } = router.currentRoute.value.query;
	// 获取实体信息
	entityInfo.value = { entity, entityLabel };
});

const handleTabClick = (tab) => {
	currentTab.value = tab.value;
};


const handleSave = () => {
	console.log('保存');
};
</script>
