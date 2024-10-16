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
		margin-bottom: 10px;
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
	.list-card-content {
		height: calc(100% - 60px);
		overflow: auto;
		overflow-x: hidden;
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
						@click="viewRow(multipleSelection[0])"
					>
						打开
					</el-button>
					<el-button
						icon="Edit"
						:disabled="multipleSelection.length != 1"
						@click="editRow(multipleSelection[0])"
					>
						编辑
					</el-button>
					<el-button
						icon="Edit"
						:disabled="multipleSelection.length < 1"
						v-if="batchUpdateConf.length > 0"
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
			<div class="list-card-content" v-if="isSetPcFormId">
				<el-empty
					v-if="showEmpty"
					:image-size="100"
					description="暂无数据"
				/>
				<div v-else>
					<el-row :gutter="20">
						<el-col
							:span="24 / listCardConf.rowNum"
							v-for="(row, inx) of tableData"
							:key="inx"
						>
							<CardItem
								:row="row"
								:form-layout="listCardConf.formLayout"
								:nameFieldName="layoutConf.nameFieldName"
								:idFieldName="layoutConf.idFieldName"
								:entity="entity"
								:ref="
									(el) =>
										handleSetFromMap(el, row.cardRecordId)
								"
							/>
						</el-col>
					</el-row>
				</div>
			</div>
            <div class="list-card-content" v-else>
                <el-empty
					:image-size="100"
					description="未指定PC卡片表单"
				/>
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
	<!-- 批量编辑 -->
	<ListBatchUpdate ref="ListBatchUpdateRef" @onConfirm="getTableList" />
	<!-- 编辑 -->
	<mlCustomEdit
		ref="editRefs"
		:entityName="entity.name"
		:nameFieldName="layoutConf.nameFieldName"
		:layoutConfig="layoutConf"
		@saveFinishCallBack="getTableList"
	/>
	<!-- 详情 -->
	<mlCustomDetail
		ref="detailRefs"
		:entityName="entity.name"
		@updateData="getTableList"
	/>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
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
import More from "@/views/customize-menu/components/More/Index.vue";
// 内容Card
import CardItem from "./CardItem.vue";
// 批量编辑
import ListBatchUpdate from "@/views/customize-menu/components/ListBatchUpdate.vue";
// 新建编辑
import mlCustomEdit from "@/components/mlCustomEdit/index.vue";
// 查看详情
import mlCustomDetail from '@/components/mlCustomDetail/index.vue';

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
	rowNum: 4,
	pcFormId: "",
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

// 列表多选 计算属性 计算 table的选中
let multipleSelection = computed(() => {
	return tableData.value.filter((item) => item.isVfSelected);
});

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
 * 动态设置Refs
 */
const fromRefMap = ref({});

/** 动态设置From Ref */
const handleSetFromMap = (el, cardRecordId) => {
	if (el) {
		fromRefMap.value[`From_Ref_${cardRecordId}`] = el;
	}
};

/**
 * 操作按钮 ---------------- begin
 */
// 编辑弹框
let editRefs = ref();
// 详情弹框
let detailRefs = ref();
// 记录更新的CardID
let curtEditCardRecordId = ref("");
// 新建行
const createRow = () => {
	editRefs.value.openDialog(formatEditData());
};
// 编辑行
const editRow = (row) => {
	curtEditCardRecordId.value = row.cardRecordId;
	editRefs.value.openDialog(formatEditData(row));
};
// 查看行
const viewRow = (row) => {
	curtEditCardRecordId.value = row.cardRecordId;
	detailRefs.value.openDialog(row.cardRecordId);
};
// 编辑完成后加载当前Card数据
const reloadCardItem = () => {
    if(curtEditCardRecordId.value) {
        fromRefMap.value[`From_Ref_${curtEditCardRecordId.value}`]?.initData();
    }
    curtEditCardRecordId.value = "";
};

const formatEditData = (row) => {
	let param = {
		entityName: entity.value.name,
		idFieldName: layoutConf.value.idFieldName,
		nameFieldName: layoutConf.value.nameFieldName,
		formId: listCardConf.value.pcFormId,
	};
	if (row) {
		param.detailId = row[layoutConf.value.idFieldName];
	}
	return param;
};

// 批量编辑
let ListBatchUpdateRef = ref("");
// 打开批量编辑弹框
const openBatchUpdateDialog = () => {
	if (batchUpdateConf.value.length < 1) {
		ElMessage.error("该实体没有设置可编辑字段");
		return;
	}
	if (multipleSelection.value.length < 1) {
		ElMessage.error("请选择要批量编辑的数据");
		return;
	}
	ListBatchUpdateRef.value.openDialog(
		batchUpdateConf.value,
		multipleSelection.value,
		entity.name,
		layoutConf.value.idFieldName
	);
};

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
// 是否设置了PC表单
let isSetPcFormId = ref(false);

// 加载layout 配置
const loadLayoutConf = async () => {
	let res = await layoutConfig.getLayoutList(
		entity.value.name,
		modelName.value
	);
	pageLoading.value = true;
	if (res && res.data) {
		layoutConf.value = res.data;
		// 高级查询过滤
		advFilter.value = res.data.advFilter || "all";
		let {
			quickFilterLabel,
			DEFAULT_FILTER,
			BATCH_UPDATE,
			chosenListType,
			SEARCH,
			STYLE,
            CARD,
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
        // CARD配置
        if(CARD) {
            listCardConf.value = Object.assign(listCardConf.value, JSON.parse(CARD.config));
        }
		// 如果存在快速搜索字段
		if (SEARCH) {
			quickQueryConf.dialogConf = {
				entityCode: SEARCH.entityCode,
				layoutConfigId: SEARCH.layoutConfigId,
				value: JSON.parse(SEARCH.config),
			};
		}
        if(listCardConf.value.pcFormId) {
            isSetPcFormId.value = true;
            await loadFormLayout();
        }else {
            isSetPcFormId.value = false;
        }
		

		// 格式化查询API
		getTableList();
	} else {
		pageLoading.value = false;
	}
};

const formatTableApi = () => {
	// 主实体
	tableParam.mainEntity = entity.value.name;
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
			el.isVfSelected = false;
			el.isVfEdit = false;
			el.cardRecordId = el[layoutConf.value.idFieldName];
			return el;
		});
		if (tableData.value.length == 0) {
			showEmpty.value = true;
		}
		page.total = res.data.pagination.total;
		dataExportData.size = res.data.dataList.length;
		dataExportData.total = res.data.pagination.total;
        reloadCardItem();
	}
	pageLoading.value = false;
};

// 加载表单配置
const loadFormLayout = async () => {
	let res = await getFormLayout(entity.value.name, listCardConf.value.pcFormId);
	if (res) {
		listCardConf.value.formLayout = res.data;
	}
};

/**
 * 列表API ---------------- end
 */
</script>
