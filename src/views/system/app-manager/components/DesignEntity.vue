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
        line-height: 45px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        &.active {
            color: #409eff;
        }
    }
}
</style>
<template>
	<el-container>
		<el-header class="entity-header">
			<!-- <h1 class="entity-title">{{ $t("appManager.1011") }} - {{ entityInfo.entityLabel }}</h1> -->
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
	</el-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

// 实体信息
let entityInfo = ref({});
// 当前tab
let currentTab = ref("EntityDataModel");
// tab信息
const tabList = ref([
	{ label: "数据模型", value: "EntityDataModel" },
	{ label: "表单设计", value: "EntityFormDesign" },
]);

onMounted(() => {
	let { entity, entityLabel } = router.currentRoute.value.query;
	// 获取实体信息
	entityInfo.value = { entity, entityLabel };
});

const handleTabClick = (tab) => {
	// currentTab.value = tab.value;
};


const handleSave = () => {
	console.log('保存');
};
</script>
