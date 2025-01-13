<style scoped lang="scss">
.design-app {
	width: 100%;
	height: 100%;
	.design-app-header {
		display: flex;
		border-bottom: 1px solid #e6e6e6;
		background-color: #fff;
		:deep(.adminui-tags) {
			border-bottom: none;
		}
		.design-app-header-left {
			width: calc(100% - 240px);
		}
		.design-app-header-right {
			position: relative;
			top: 1px;
			padding-right: 10px;
		}
	}
	.design-app-body {
		height: calc(100% - 36px);
	}
}
</style>
<template>
	<div class="design-app">
		<div class="design-app-header">
			<div class="design-app-header-left">
				<Tags isDesign></Tags>
			</div>
			<div class="design-app-header-right" style="width: 240px">
				<el-select
					v-model="selectValue"
					:placeholder="t('appManager.1400')"
					@change="handleSelectChange"
					style="width: 240px"
				>
					<el-option
						v-for="item in selectList"
						:key="item.value"
						:label="item.label"
						:value="item.value"
						:disabled="item.disabled"
					></el-option>
				</el-select>
			</div>
		</div>
		<div class="design-app-body">
			<router-view v-slot="{ Component }">
				<keep-alive :include="[...keepLiveRoute]">
					<component
						:is="wrap(router.currentRoute.fullPath, Component)"
						:key="router.currentRoute.fullPath"
						v-if="routeShow"
					/>
				</keep-alive>
			</router-view>
		</div>
	</div>
</template>

<script setup>
import { ref, h, onMounted, watch } from "vue";
import { t } from "@/locales";
import { useRouter } from "vue-router";
import useKeepAliveStore from "@/store/modules/keepAlive";
import { storeToRefs } from "pinia";
const { keepLiveRoute, routeShow } = storeToRefs(useKeepAliveStore());
import Tags from "@/layout/components/tags.vue";

const router = useRouter();

let selectValue = ref("DesignEntity");

const wrapperMap = new Map();

// 为keep-alive里的component接收的组件包上一层自定义name的壳
const wrap = (fullPath, component) => {
	let wrapper;
	if (component) {
		const wrapperName = router.currentRoute.name;
		if (wrapperMap.has(wrapperName)) {
			wrapper = wrapperMap.get(wrapperName);
		} else {
			wrapper = {
				name: wrapperName,
				render() {
					return h(component);
				},
			};
			wrapperMap.set(wrapperName, wrapper);
		}
		return h(wrapper);
	}
};

const selectList = ref([
	{
		label: t("appManager.1400"),
		value: "DesignEntity",
	},
	{
		label: t("appManager.1401"),
		value: "DesignSingleOption",
	},
	{
		label: t("appManager.1402"),
		value: "DesignMultipleOption",
	},
	{
		label: t("appManager.1403"),
		value: "DesignApprovalProcess",
	},
	{
		label: t("appManager.1403-1"),
		value: "DesignProcessDetail",
		disabled: true,
	},
	{
		label: t("appManager.1404"),
		value: "DesignTrigger",
	},
	{
		label: t("appManager.1404-1"),
		value: "DesignTriggerDetail",
		disabled: true,
	},
	{
		label: t("appManager.1405"),
		value: "DesignDashboard",
	},
	{
		label: t("appManager.1406"),
		value: "DesignReportDesign",
	},
	{
		label: t("appManager.1407"),
		value: "DesignExternalForm",
	},
	{
		label: t("appManager.1408"),
		value: "DesignMenuNavigation",
	},
]);

onMounted(() => {
	selectValue.value = router.currentRoute.value.name;
});

watch(
	() => router.currentRoute.value,
	(newVal, oldVal) => {
		selectValue.value = newVal.name;
	}
);

const handleSelectChange = (value) => {
	router.push({
		name: value,
	});
};
</script>
