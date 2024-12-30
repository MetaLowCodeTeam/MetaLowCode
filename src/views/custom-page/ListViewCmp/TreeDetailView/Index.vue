<template>
	<el-container v-loading="loading" element-loading-text="加载中...">
		<el-header>
			<HeaderView 
                ref="HeaderViewRef"
                @onAdd="handleAdd" 
                @save-success="getLayoutConfig" 
                @onSearch="handleSearch"
            />
		</el-header>
		<el-container
			class="main-container"
			v-if="treeConfig.contentsField && treeConfig.contentsParentField"
		>
			<el-aside>
				<AsideView
					v-if="treeData.length > 0"
					@node-click="handleNodeClick"
					@clearSearch="handleClearSearch"
					:treeData="treeData"
					:treeConfig="treeConfig"
                    :treeSearchValue="treeSearchValue"
                    ref="AsideViewRef"
				/>
			</el-aside>
			<el-main class="main-content">
				<el-empty v-if="!recordId" description="请选择树节点" />
				<MainView
					v-else
					ref="mainViewRef"
					@initFinish="initFinish"
					@saveFinishCallBack="saveFinishCallBack"
				/>
			</el-main>
		</el-container>
		<el-container v-else class="empty-container">
			<el-empty description="请先设置列表配置" />
		</el-container>
	</el-container>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from "vue";
import { ElMessage } from "element-plus";

// 公共方法
import useCommonStore from "@/store/modules/common";
const { queryEntityNameById, queryEntityInfoByName } = useCommonStore();

// 路由
import { useRouter } from "vue-router";
const Router = useRouter();
// 组件
import HeaderView from "./HeaderView.vue";
import AsideView from "./AsideView.vue";
import MainView from "./MainView.vue";
// API
import layoutConfig from "@/api/layoutConfig";
import { queryRecordTree } from "@/api/crud";

onMounted(() => {
	getLayoutConfig();
});

// 实体信息
let entity = reactive({
	name: "",
	code: "",
	label: "",
	nameFieldName: "",
	idFieldName: "",
	recordId: "",
});

let loading = ref(false);
let treeConfig = ref({});
let treeData = ref([]);
const getLayoutConfig = async () => {
	entity.name = Router.currentRoute.value.query.entity;
	initEntityInfo();
	loading.value = true;
	let res = await layoutConfig.getLayoutList(entity.name);
	if (res) {
		if (res.data.CUSTOM_TEMPLATE) {
			let { config } = res.data.CUSTOM_TEMPLATE;
			treeConfig.value = JSON.parse(config);
		}
		if (
			treeConfig.value.contentsField &&
			treeConfig.value.contentsParentField
		) {
			let treeRes = await queryRecordTree(
				treeConfig.value.referTo,
				treeConfig.value.contentsParentField
			);
			if (treeRes) {
				treeData.value = treeRes.data || [];
				setTreeContentsIcon(treeData.value);
			}
		}
	}
	loading.value = false;
};
const mainViewRef = ref(null);
// 树节点点击
let recordId = ref("");
const handleNodeClick = (data) => {
	if (data && data.id && recordId.value !== data.id) {
		recordId.value = data.id;
		entity.name = queryEntityNameById(recordId.value);
		initEntityInfo();
		loading.value = true;
		nextTick(() => {
			mainViewRef.value.initData(entity);
		});
	}
};

// 初始化实体信息
const initEntityInfo = () => {
	let entityInfo = queryEntityInfoByName(entity.name);
	entity = Object.assign(entity, entityInfo);
	entity.recordId = recordId.value;
};

// 设置目录树ICON
const setTreeContentsIcon = (data) => {
	data.forEach((item) => {
		item.icon = treeConfig.value.contentsIcon;
		item.isParent = true;
		if (
			item.children &&
			item.children.length > 0
		) {
			setTreeContentsIcon(item.children);
		}
	});
};

let AsideViewRef = ref();
// 点击新建
const handleAdd = () => {
	if (!recordId.value) {
		ElMessage.error("请选择树节点");
		return;
	}
	entity.name = Router.currentRoute.value.query.entity;
	recordId.value = "add";
	initEntityInfo();
	loading.value = true;
	nextTick(() => {
		mainViewRef.value.initData(entity);
	});
};

// 新建基本信息成功回调
const saveFinishCallBack = (data) => {
	entity.name = Router.currentRoute.value.query.entity;
	recordId.value = data[entity.idFieldName];
	initEntityInfo();
	loading.value = true;
	nextTick(() => {
		mainViewRef.value?.initData(entity);
	    AsideViewRef.value?.handleRefresh();
	});
};

// 详情接口初始化成功回调
const initFinish = () => {
	loading.value = false;
};


// tree搜索
let treeSearchValue = ref("");
const handleSearch = (value) => {
    treeSearchValue.value = value;
}

const HeaderViewRef = ref();
const handleClearSearch = () => {
    treeSearchValue.value = "";
    getLayoutConfig();
    HeaderViewRef.value?.handleClearSearch();
}

</script>

<style scoped lang="scss">
.main-container {
	height: calc(100% - 60px);
}
.main-content {
	height: 100%;
	padding: 0px;
	background: #fff;
}
.empty-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}
</style>
