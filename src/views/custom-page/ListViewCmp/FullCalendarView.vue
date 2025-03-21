<style lang="scss" scoped>
.page-main {
	height: 100%;
}
.list-card-main {
	height: calc(100% - 41px);
	box-sizing: border-box;
	padding: 20px;
    min-width: 1300px;
	.list-card-header {
		border-top: 3px solid var(--el-color-primary);
		background: #fff;
		height: 60px;
		line-height: 60px;
		padding: 0 20px;
		box-sizing: border-box;
		margin-bottom: 10px;
        text-align: center;
		.full-calendar-title {
			font-size: 20px;
            font-weight: bold;
		}
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
.btn-active {
	background: var(--el-color-primary-dark-2);
	border-color: var(--el-color-primary-dark-2);
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
					class="mr-15 fl"
				/>
				<!-- 快速查询 -->
				<div class="quick-query fl">
					<el-input
						v-model="quickQueryKeyWord"
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
				<span class="ml-10 full-calendar-title">
					{{ mlCalendarData.title }}
				</span>
				<!-- 操作按钮 -->
				<div class="fr table-setting">
					<el-button-group class="mr-10">
						<el-tooltip
							:content="
								'上一个' + calendarViewTip[currentCalendarView]
							"
						>
							<el-button 
                                plain
                                type="primary" 
                                icon="ArrowLeft" 
                                @click="toCalendarApi('prev')" 
                            />
						</el-tooltip>
						<el-tooltip
							:content="
								'下一个' + calendarViewTip[currentCalendarView]
							"
						>
							<el-button 
                                plain
                                type="primary" 
                                icon="ArrowRight" 
                                @click="toCalendarApi('next')" 
                            />
						</el-tooltip>
					</el-button-group>
					<el-button 
                        type="primary" 
                        plain
                        class="mr-10" 
                        @click="toCalendarApi('today')"
                        :disabled="mlCalendarData?.isTodayInRange"
                    >
						回到今天
					</el-button>
					<el-button-group class="mr-10">
						<el-button
							v-for="item in calendarViewOptions"
							:key="item.value"
                            :plain="currentCalendarView !== item.value"
							type="primary"
							@click="calendarViewChange(item.value)"
						>
							{{ item.label }}
						</el-button>
					</el-button-group>
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
						:entityCode="entity.code"
						:dataExportData="dataExportData"
						@editColumnConfirm="loadLayoutConf"
						@defaultFilterChange="loadLayoutConf"
						@treeGroupFilterConfirm="loadLayoutConf"
						:modelName="modelName"
						isListCalendar
					/>
				</div>
			</div>
			<div class="list-card-content" v-if="isSetCalendarField">
				<div>
					<MlFullCalendar 
                        ref="MlFullCalendarRef" 
                        @initCalendarData="initCalendarData"
                        @getCalendarList="getTableList"
                        @handleClick="fullCalendarHandleClick"
                        @handleDrop="fullCalendarHandleDrop"
                        :eventStartEditable="listCalendarConf.isUpdatable && !listCalendarConf.isReserved"
                    />
				</div>
			</div>
			<div class="list-card-content" v-else>
				<el-empty
					:image-size="100"
					description="未完成日历视图相关配置"
				/>
			</div>
		</div>
	</div>
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
	<!-- 快速搜索字段 -->
	<mlSelectField
		ref="SelectFieldDialog"
		v-model="quickQueryConf.value"
		title="选择快速搜索字段"
		isQuickQuery
		:quickQueryConf="quickQueryConf"
		@onConfirm="loadLayoutConf"
		:entityName="entity.name"
		:nameFieldName="layoutConf.nameFieldName"
		:modelName="modelName"
	/>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, reactive, ref } from "vue";
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
import { getDataList, saveRecord } from "@/api/crud";
/**
 * 组件
 */
// 高级查询
import mlListAdvancedQuery from "@/components/mlListAdvancedQuery/index.vue";
// 更多按钮
import More from "@/views/customize-menu/components/More/Index.vue";
// 新建编辑
import mlCustomEdit from "@/components/mlCustomEdit/index.vue";
// 查看详情
import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
// 快速查询设置
import mlSelectField from "@/components/mlSelectField/index.vue";
import MlFullCalendar from "./MlFullCalendar/Index.vue";

const $TOOL = inject("$TOOL");

// 实体
let entity = ref({});

// 模块名称
let modelName = ref("");

// 加载状态
let pageLoading = ref(false);
let pageLoadingText = ref("数据加载中...");

// layout 配置
let layoutConf = ref({});

let listCalendarConf = ref({});

/**
 * 头部参数 ---------------- begin
 */



// 日历组件
let MlFullCalendarRef = ref();
let mlCalendarData = ref({});
const initCalendarData = (data) => {
    mlCalendarData.value = data;
}


// 日历视图选项
const calendarViewOptions = ref([
	{
		label: "月",
		value: "dayGridMonth",
	},
	{
		label: "周",
		value: "dayGridWeek",
	},
	{
		label: "日",
		value: "dayGridDay",
	},
]);

// 日历视图提示
const calendarViewTip = {
	dayGridMonth: "月",
	dayGridWeek: "周",
	dayGridDay: "日",
};

// 当前日历视图
let currentCalendarView = ref("dayGridMonth");

// 切换日历视图
const calendarViewChange = (value) => {
	currentCalendarView.value = value;
    MlFullCalendarRef.value.toCalendarApi('changeView', value);
    getTableList();
    
};

// 上一个、下一个、今天
const toCalendarApi = (api) => {
	MlFullCalendarRef.value.toCalendarApi(api);
    getTableList();
};

// 点击触发
const fullCalendarHandleClick = (params) => {
    let cardRecordId = params[layoutConf.value.idFieldName];
    detailRefs.value.openDialog(cardRecordId);
}
// 拖拽触发
const fullCalendarHandleDrop = async (params, currentStart) => {
    pageLoading.value = true;
    let fieldType = listCalendarConf.value.fieldType;
    console.log(currentStart,'currentStart')
    let newDate = fieldType === 'Date' ? currentStart.split(' ')[0] : currentStart;
    let res = await saveRecord(entity.value.name, params[layoutConf.value.idFieldName], {
        [listCalendarConf.value.calendarField]: newDate
    });
    if(!res) {
        getTableList();
    }
    pageLoading.value = false;
}


/**
 * 头部参数 ---------------- end
 */

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
	value: [],
	placeholder: "",
	entityCode: "",
});
let quickQueryKeyWord = ref("");




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
	tableParam.quickFilter = quickQueryKeyWord.value;
	getTableList();
};
// 清空快速查询
const clearQuickQuery = () => {
	quickQueryKeyWord.value = "";
	quickQuery();
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
// 编辑弹框
let editRefs = ref();
// 详情弹框
let detailRefs = ref();
// 新建行
const createRow = () => {
	editRefs.value.openDialog(formatEditData());
};



const formatEditData = (row) => {
	let param = {
		entityName: entity.value.name,
		idFieldName: layoutConf.value.idFieldName,
		nameFieldName: layoutConf.value.nameFieldName,
	};
	if (row) {
		param.detailId = row[layoutConf.value.idFieldName];
	}
	return param;
};

/**
 * 操作按钮 ---------------- end
 */


/**
 * 分页 ---------------- end
 */

/**
 * 列表API ---------------- begin
 */
// 是否设置了PC表单
let isSetCalendarField = ref(false);

// 加载layout 配置
const loadLayoutConf = async () => {
    pageLoading.value = true;
	let res = await layoutConfig.getLayoutList(
		entity.value.name,
		modelName.value
	);
	if (res && res.data) {
		layoutConf.value = res.data;
		// 高级查询过滤
		advFilter.value = res.data.advFilter || "all";
		let { quickFilterLabel, DEFAULT_FILTER, SEARCH, CALENDAR } = res.data;
		// 快速查询底纹
		quickQueryConf.placeholder = quickFilterLabel;
		// 默认查询设置
		if (DEFAULT_FILTER) {
			defaultFilter.value = JSON.parse(DEFAULT_FILTER.config);
		}
		// CARD配置
		if (CALENDAR) {
			listCalendarConf.value = Object.assign(
				listCalendarConf.value,
				JSON.parse(CALENDAR.config)
			);
		}
		quickQueryConf.entityCode = entity.value.code;
		// 如果存在快速搜索字段
		if (SEARCH) {
            quickQueryConf.layoutConfigId = res.data.SEARCH.layoutConfigId;
            quickQueryConf.entityCode = res.data.SEARCH.entityCode;
            quickQueryConf.value = JSON.parse(res.data.SEARCH.config);
		}
		if (listCalendarConf.value.calendarField) {
			isSetCalendarField.value = true;
		    nextTick(() => {
                getTableList();
            })
		} else {
			isSetCalendarField.value = false;
            pageLoading.value = false;
		}
	} else {
		pageLoading.value = false;
	}
};

const formatTableApi = () => {
	// 主实体
	tableParam.mainEntity = entity.value.name;
	// 高级查询
	if (advFilter.value != "all") {
		let filterAdvancedFilter = layoutConf.value.FILTER.filter(
			(el) => el.layoutConfigId == advFilter.value
		);
		let config = JSON.parse(filterAdvancedFilter[0].config);
		tableParam.advFilter = { ...config };
	}
    tableParam.fieldsList = listCalendarConf.value.calendarField + "," +  layoutConf.value.nameFieldName;
    tableParam.builtInFilter = {
        equation: "OR",
        items: [{
            fieldName: listCalendarConf.value.calendarField,
            value: mlCalendarData.value.activeStart + " 00:00:01",
            value2: mlCalendarData.value.activeEnd + " 23:59:59",
            op: "BW"
        }]
    };
    // 
	// 导出数据
	dataExportData.queryParm = { ...tableParam };
};

// 获取表格数据
const getTableList = async () => {
	formatTableApi();
	pageLoading.value = true;
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
		// tableData.value = res.data.dataList;
        let data = res.data.dataList.map(el => {
            el.title = el[layoutConf.value.nameFieldName];
            el.date = el[listCalendarConf.value.calendarField];
            return el;
        });
        MlFullCalendarRef.value.setCalendarList(data);
	}
	pageLoading.value = false;
};

/**
 * 列表API ---------------- end
 */
</script>
