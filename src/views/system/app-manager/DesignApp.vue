<style scoped lang="scss">
.design-app {
	width: 100%;
	height: 100%;
	.design-app-header {
		box-sizing: border-box;
		border-bottom: 1px solid #e6e6e6;
		background-color: #fff;
		:deep(.adminui-tags) {
			border-bottom: none;
		}
		.design-app-header-bar {
			position: relative;
			:deep(.adminui-topbar) {
				box-shadow: none;
				border-bottom: 1px solid #e6e6e6;
			}
			.design-app-header-right {
				position: absolute;
				right: 20px;
				top: 5px;
                box-sizing: border-box;
                padding-top: 5px;
                .el-dropdown-link {
                    cursor: pointer;
                    .el-icon--right {
                        position: relative;
                        top: 2px;
                    }
                }
			}
		}
	}
	.design-app-body {
		height: calc(100% - 88px);
	}
}
</style>
<template>
	<div class="design-app">
		<div class="design-app-header">
			<div class="design-app-header-bar">
				<Topbar isDesign/>
				<div class="design-app-header-right">
					<el-dropdown>
						<el-button type="primary">
							{{ $t("appManager.1013") }}
							<el-icon class="el-icon--right">
								<arrow-down />
							</el-icon>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item
									v-for="item in selectList"
									:key="item.value"
									@click="handleSelectChange(item.value)"
								>
									{{ item.label }}
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</div>
			<div class="design-app-header-tab">
				<Tags isDesign></Tags>
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
import Topbar from "@/layout/components/topbar.vue";

const router = useRouter();

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
		label: t("appManager.1404"),
		value: "DesignTrigger",
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

const handleSelectChange = (value) => {
	router.push({
		name: value,
		query: {
			appName: router.currentRoute.value.query.appName,
            appAbbr: router.currentRoute.value.query.appAbbr,
		},
	});
};
</script>
