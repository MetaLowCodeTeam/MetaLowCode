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
	<el-container v-loading="loading">
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
			<EntityFieldTable v-if="currentTab == 'EntityDataModel'" isAppManagement />
			<form-design
				v-else-if="currentTab == 'EntityFormDesign'"
				isAppManagement
				@initComplete="initComplete"
			></form-design>
			<EntityList v-else isAppManagement />
		</el-main>
	</el-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { t } from "@/locales";
// 组件
import EntityFieldTable from "@/views/system/entity-field-table.vue";
import FormDesign from "@/views/system/form-design/index.vue";
import EntityList from "@/views/customize-menu/list.vue";

const router = useRouter();

let loading = ref(false);

// 实体信息
let entityInfo = ref({});
// 当前tab
let currentTab = ref("EntityDataModel");
// tab信息
const tabList = ref([
	{ label: t("appManager.1600"), value: "EntityDataModel" },
	{ label: t("appManager.1601"), value: "EntityFormDesign" },
	{ label: t("appManager.1602"), value: "EntityListDesign" },
]);

onMounted(() => {
	let { entity, entityLabel } = router.currentRoute.value.query;
	// 获取实体信息
	entityInfo.value = { entity, entityLabel };
});

const handleTabClick = (tab) => {
	currentTab.value = tab.value;
	if (tab.value == "EntityFormDesign") {
		loading.value = true;
	}
};

const initComplete = () => {
	loading.value = false;
};
defineExpose({
	initComplete,
});
</script>
