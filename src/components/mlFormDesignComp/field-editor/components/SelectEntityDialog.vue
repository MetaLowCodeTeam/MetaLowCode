<template>
	<ml-dialog v-model="isShow" title="选择实体" append-to-body width="700px">
		<el-container
			v-loading="loading"
			element-loading-text="加载中..."
			class="select-entity-container"
		>
			<el-header>
				<el-input
					v-model="queryText"
					type="text"
					placeholder="请输入关键词搜索"
					@keyup.enter="doSearch"
					clearable
					@clear="cancelSearch"
				>
					<template #append>
						<el-button @click="doSearch">
							<el-icon>
								<Search />
							</el-icon>
						</el-button>
					</template>
				</el-input>
			</el-header>

			<el-main>
				<SimpleTable
					:show-pagination="false"
					:show-check-box="false"
					:table-size="'small'"
					:columns="columns"
					:data="tableData"
					:show-operation-column="true"
					:max-height="420"
				>
					<template #table_operation="{ scope }">
						<el-button
							class
							icon="el-icon-check"
							@click="selectEntity(scope.row)"
                            v-if="!defaultSelectedEntity || scope.row.name !== defaultSelectedEntity"
						>
							选择
						</el-button>
                        <el-button
							class
                            v-else
                            type="success"
                            style="width: 81px;"
                            disabled
						>
							已选择
						</el-button>
					</template>
				</SimpleTable>
			</el-main>
		</el-container>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";

import { filterEntitySet } from "@/api/system-manager";

const emit = defineEmits(["selectEntity"]);

let isShow = ref(false);
let queryText = ref("");
let columns = ref([
	{
		prop: "name",
		label: "实体名称",
		width: "150",
		align: "center",
	},
	{
		prop: "label",
		label: "显示名称",
		width: "200",
		align: "center",
	},
	{
		prop: "entityType",
		label: "实体类型",
		width: "150",
		align: "center",
	},
]);
let tableData = ref([]);
let currentAppAbbr = ref("");
let defaultSelectedEntity = ref("");
let loading = ref(false);
const openDialog = (appAbbr, refEntityName) => {
	currentAppAbbr.value = appAbbr;
	isShow.value = true;
    defaultSelectedEntity.value = refEntityName;
    loadEntityList();
};

const loadEntityList = async () => {
	loading.value = true;
	try {
		// 清空之前的数据
		tableData.value = [];
		
		let res = await filterEntitySet(queryText.value);
		if (res?.code == 200 && res.data) {
			let entityItems = res.data.filter((entity) => {
				// 过滤掉内部实体
				if (entity.internalEntityFlag) {
					return false;
				}
				
				// 根据 appAbbr 过滤
				if (currentAppAbbr.value) {
					return entity.systemEntityFlag || entity.appAbbr === currentAppAbbr.value;
				} else {
					return !entity.appAbbr;
				}
			});
			
			// 转换数据格式
			tableData.value = entityItems.map((entity) => ({
				name: entity.name,
				label: entity.label,
				entityType: entity.detailEntityFlag ? "从" : "主",
			}));
		}
	} catch (error) {
		console.error('加载实体列表失败:', error);
		tableData.value = [];
	} finally {
		loading.value = false;
	}
};

const closeDialog = () => {
	isShow.value = false;
};

const doSearch = () => {
	loadEntityList();
};

const cancelSearch = () => {
	queryText.value = "";
	loadEntityList();
};

const selectEntity = (row) => {
	emit("selectEntity", row);
	isShow.value = false;
};

defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.select-entity-container {
	padding: 0;
	.el-header {
		padding: 0;
		border-bottom: 0;
		height: 40px;
		line-height: 40px;
	}
	.el-main {
		padding: 0;
		padding-top: 10px;
		:deep(.el-main) {
			padding: 0;
		}
	}
}
</style>
