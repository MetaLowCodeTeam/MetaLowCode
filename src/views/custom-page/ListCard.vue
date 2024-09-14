<style lang="scss" scoped>
.page-main {
	height: 100%;
}
.list-card-main {
	height: calc(100% - 41px);
	box-sizing: border-box;
	padding: 20px;
	.list-card-header {
		border-top: 3px solid var(--el-color-primary);
		background: #fff;
		height: 60px;
		line-height: 60px;
		padding: 0 20px;
		box-sizing: border-box;
		margin-bottom: 5px;
		.table-setting {
			// margin-top: 5px;
			.el-dropdown-link {
				display: inline-block;
				width: 20px;
				height: 20px;
				cursor: pointer;
				position: relative;
				top: 6px;
			}
		}
		.quick-query {
			display: inline-block;
			width: 300px;
			padding-right: 30px;
			position: relative;
			.quick-query-icon {
				cursor: pointer;
			}
			.quick-edit {
				position: absolute;
				width: 18px;
				height: 18px;
				right: 10px;
				top: 5px;
				cursor: pointer;
				display: none;
				color: #a1a1a1;
				&:hover {
					color: #666;
				}
			}
			&:hover {
				.quick-edit {
					display: block;
				}
			}
		}
	}
}
.list-card-footer {
	height: 41px;
}
</style>

<template>
	<!--  -->
	<div
		class="page-main"
		v-loading="pageLoading"
		:element-loading-text="pageLoadingText"
	>
		<div class="list-card-main">
			<div class="list-card-header">
				<!-- 高级查询 -->
				<mlListAdvancedQuery
					v-if="entity.code"
					v-model="layoutConf.FILTER"
					:entityName="entity.name"
					:entityCode="entity.code"
					@queryNow="queryNow"
					@refresh="refreshAdvancedQuery"
					@onAddAdv="loadLayoutConf"
					@changeAdvFilter="changeAdvFilter"
					:filter="layoutConf.FILTER"
					:modelName="modelName"
					class="mr-15"
				/>
				<!-- 快速查询 -->
				<div class="quick-query">
					<el-input
						v-model="quickQueryConf.value"
						class="w-50 m-2"
						:placeholder="quickQueryConf.placeholder"
						@keyup.enter="quickQuery()"
						clearable
						@clear="clearQuickQuery()"
					>
						<template #append>
							<el-button @click="quickQuery()">
								<el-icon>
									<ElIconSearch />
								</el-icon>
							</el-button>
						</template>
					</el-input>
					<span
						class="quick-edit"
						@click="openSelectFieldDialog"
						v-if="$TOOL.checkRole('r6008')"
					>
						<el-icon size="18">
							<ElIconEditPen />
						</el-icon>
					</span>
				</div>
				<!-- 操作按钮 -->
				<div class="fr table-setting">
					<el-button
						icon="Notification"
						:disabled="multipleSelection.length != 1"
						@click="openDetailDialog(multipleSelection[0])"
					>
						打开
					</el-button>
					<el-button
						icon="Edit"
						:disabled="multipleSelection.length != 1"
						@click="onEditRow(multipleSelection[0])"
					>
						编辑
					</el-button>
					<el-button
						icon="Edit"
						:disabled="multipleSelection.length < 1"
					>
						批量编辑
					</el-button>
					<el-button type="primary" icon="Plus" @click="createRow()">
						新建
					</el-button>
					<More
						ref="MoreRefs"
						:listParamConf="{
							showMoreBtn: true,
							showDelBtn: true,
						}"
						:layoutConfig="layoutConf"
						:tableColumn="tableColumn"
						:entityCode="entity.code"
						:multipleSelection="multipleSelection"
						:dataExportData="dataExportData"
						@editColumnConfirm="loadLayoutConf"
						@defaultFilterChange="loadLayoutConf"
						@treeGroupFilterConfirm="loadLayoutConf"
						:modelName="modelName"
						isListCard
					/>
				</div>
			</div>
			<div class="list-card-content">
				<el-empty
					v-if="showEmpty"
					:image-size="100"
					description="暂无数据"
				/>
				<div v-else>
					<el-row :gutter="20">
						<el-col
							:span="listCardConf.span"
							v-for="(row, inx) of tableData"
							:key="inx"
						>
							<CardItem
								:row="row"
								:form-layout="listCardConf.formLayout"
							/>
						</el-col>
					</el-row>
				</div>
			</div>
		</div>
		<div class="list-card-footer">
			<mlPagination
				:bottom="false"
				:no="page.no"
				:size="page.size"
				:total="page.total"
				:pageSizes="page.pageSizes"
				@pageChange="pageChange"
				@handleSizeChange="handleSizeChange"
				style="background: #fff"
			/>
		</div>
	</div>
</template>

<script setup>
import { inject, onMounted, reactive, ref } from "vue";
// 通用模块
import useCommonStore from "@/store/modules/common";
const { queryEntityLabelByName, queryEntityCodeByName } = useCommonStore();
// 路由模块
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
const Router = useRouter();
/**
 * API
 */
import layoutConfig from "@/api/layoutConfig";
import { getDataList } from "@/api/crud";
import { getFormLayout } from "@/api/system-manager";
/**
 * 组件
 */
// 高级查询
import mlListAdvancedQuery from "@/components/mlListAdvancedQuery/index.vue";
// 更多按钮
import More from "../customize-menu/components/More/Index.vue";
// 内容Card
import CardItem from "./ListCardCmp/CardItem.vue";

const $TOOL = inject("$TOOL");

// 实体
let entity = ref({});

// 模块名称
let modelName = ref("");

// 加载状态
let pageLoading = ref(false);
let pageLoadingText = ref("数据加载中...");
// 显示空状态
let showEmpty = ref(false);

// layout 配置
let layoutConf = ref({});

let listCardConf = ref({
	span: 6,
	formId: "",
	formLayout: {},
});

/**
 * 列表参数 ---------------- begin
 */
// 过滤
// 高级查询过滤
let advFilter = ref({});

// 默认查询设置
let defaultFilter = ref({});

// 快速查询
let quickQueryConf = reactive({
	value: "",
	placeholder: "",
	dialogConf: {},
});

// 列表多选
let multipleSelection = ref([]);

// 批量编辑
let batchUpdateConf = ref([]);

// 列表列
let tableColumn = ref([]);

// 列表数据
let tableData = ref([]);

// 导入数据
let dataExportData = reactive({
	queryParm: {},
	size: 0,
	total: 0,
});

// 列表参数
let tableParam = reactive({
	// 主实体
	mainEntity: "",
	// 查询列字段
	fieldsList: "",
	// 过滤
	filter: {
		equation: "AND",
		items: [],
	},
	// 分页
	pageSize: "",
	pageNo: "",
	// 排序
	sortFields: {
		fieldName: "modifiedOn",
		type: "DESC",
	},
	// 高级查询
	advFilter: null,
	// 快速查询
	quickFilter: "",
	// 路由过滤
	builtInFilter: null,
	// 统计
	statistics: null,
	// 分组查询
	filterEasySql: "",
	defaultFilter: {},
});

/**
 * 列表参数 ---------------- end
 */

onMounted(() => {
	// 初始化实体
	initEntity();
});

// 初始化实体
const initEntity = () => {
	let routeEntity = Router.currentRoute.value.query.entity;
	if (!routeEntity) {
		let splitPathname = Router.currentRoute.value.path.split("/");
		if (splitPathname && splitPathname.length > 3) {
			routeEntity = splitPathname[4];
		} else {
			ElMessage.error("没有找到url参数【entity】");
			return;
		}
	}
	entity.value = {
		name: routeEntity,
		label: queryEntityLabelByName(routeEntity),
		code: queryEntityCodeByName(routeEntity),
	};
	console.log("实体信息---------------", entity.value);
	// 加载layout 配置
	loadLayoutConf();
};

/**
 * 查询 ---------------- begin
 */

// 立即查询
const queryNow = (e) => {
	tableParam.filter = { ...e };
	getTableList();
};
// 重置
const refreshAdvancedQuery = () => {
	tableParam.filter = null;
	getTableList();
};
// 切换常用查询
const changeAdvFilter = (e) => {
	tableParam.advFilter = { ...e };
	getTableList();
};

// 快速查询
const quickQuery = () => {
	console.log("快速查询");
};
// 清空快速查询
const clearQuickQuery = () => {
	// quickQueryConf.value = "";
	console.log("清空快速查询");
};

// 添加快速查询字段
let SelectFieldDialog = ref();
const openSelectFieldDialog = () => {
	SelectFieldDialog.value.openDialog();
};

/**
 * 查询 ---------------- end
 */

/**
 * 操作按钮 ---------------- begin
 */
// 新建行
const createRow = () => {};

/**
 * 操作按钮 ---------------- end
 */

/**
 * 分页 ---------------- begin
 */
let page = reactive({
	no: 1,
	size: 20,
	pageSizes: [20, 40, 80, 100],
	total: 0,
});
const pageChange = (no) => {
	page.no = no;
};
const handleSizeChange = (size) => {
	page.size = size;
};
/**
 * 分页 ---------------- end
 */

/**
 * 列表API ---------------- begin
 */

// 加载layout 配置
const loadLayoutConf = async () => {
	let res = await layoutConfig.getLayoutList(
		entity.value.name,
		modelName.value
	);
	pageLoading.value = true;
	if (res && res.data) {
		layoutConf.value = res.data;
		console.log("实体配置信息---------------", layoutConf.value);
		// 高级查询过滤
		advFilter.value = res.data.advFilter || "all";
		let {
			quickFilterLabel,
			DEFAULT_FILTER,
			BATCH_UPDATE,
			chosenListType,
			LIST,
			SEARCH,
			STYLE,
		} = res.data;
		// 快速查询底纹
		quickQueryConf.placeholder = quickFilterLabel;
		// 默认查询设置
		if (DEFAULT_FILTER) {
			defaultFilter.value = JSON.parse(DEFAULT_FILTER.config);
		}
		// 批量编辑
		if (BATCH_UPDATE) {
			batchUpdateConf.value = JSON.parse(BATCH_UPDATE.config);
		}
		// 如果存在快速搜索字段
		if (SEARCH) {
			quickQueryConf.dialogConf = {
				entityCode: SEARCH.entityCode,
				layoutConfigId: SEARCH.layoutConfigId,
				value: JSON.parse(SEARCH.config),
			};
		}
		await loadFormLayout();
		// 格式化列
		let { ALL, SELF } = LIST;
		SELF.FILTER = SELF.config ? JSON.parse(SELF.config) : [];
		ALL.FILTER = ALL.config ? JSON.parse(ALL.config) : [];
		// 如果存在默认配置，用默认配置
		if (chosenListType) {
			tableColumn.value = LIST[chosenListType].FILTER;
		} else {
			tableColumn.value = ALL.FILTER;
		}
		// 如果存在列
		if (tableColumn.value.length > 0) {
			// 格式化查询API
			getTableList();
		}
	} else {
		pageLoading.value = false;
	}
};

const formatTableApi = () => {
	// 主实体
	tableParam.mainEntity = entity.value.name;
	// 所有列
	tableParam.fieldsList = tableColumn.value
		.map((item) => item.fieldName)
		.join(",");
	// 分页
	tableParam.pageSize = page.size;
	tableParam.pageNo = page.no;
	// 列排序
	let filterSortFields = tableColumn.value.filter((item) => item.columnSort);
	if (filterSortFields.length > 0) {
		tableParam.sortFields = {
			fieldName: filterSortFields[0].fieldName,
			type: filterSortFields[0].columnSort,
		};
	}
	// 高级查询
	if (advFilter.value != "all") {
		let filterAdvancedFilter = layoutConf.value.FILTER.filter(
			(el) => el.layoutConfigId == advFilter.value
		);
		let config = JSON.parse(filterAdvancedFilter[0].config);
		tableParam.advFilter = { ...config };
	}
	// 快速查询
	tableParam.quickFilter = quickQueryConf.value;
	// 导出数据
	dataExportData.queryParm = { ...tableParam };
	console.log("列表参数-----------------------", tableParam);
};

// 获取表格数据
const getTableList = async () => {
	formatTableApi();
	pageLoading.value = true;
	showEmpty.value = false;
	let res = await getDataList(
		tableParam.mainEntity,
		tableParam.fieldsList,
		tableParam.filter,
		tableParam.pageSize,
		tableParam.pageNo,
		[tableParam.sortFields],
		tableParam.advFilter,
		tableParam.quickFilter,
		tableParam.builtInFilter,
		tableParam.statistics,
		tableParam.filterEasySql,
		tableParam.defaultFilter
	);
	if (res) {
		tableData.value = res.data.dataList.map((el) => {
			el.isSelected = false;
			return el;
		});
		if (tableData.value.length == 0) {
			showEmpty.value = true;
		}
		page.total = res.data.pagination.total;
		dataExportData.size = res.data.dataList.length;
		dataExportData.total = res.data.pagination.total;
		console.log("列表数据----------------", tableData.value);
	}
	pageLoading.value = false;
};

// 加载表单配置
const loadFormLayout = async () => {
	let res = await getFormLayout(entity.value.name, listCardConf.value.formId);
	if (res) {
		console.log(res, "res");
		// formLayout.value = res.data;
		listCardConf.value.formLayout = res.data;
	}
};

/**
 * 列表API ---------------- end
 */
</script>
