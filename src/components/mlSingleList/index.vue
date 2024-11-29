<template>
	<el-container
		v-loading="loading"
		element-loading-text="加载中..."
		class="one-list"
	>
		<el-header class="props-action-section">
			<span class="section-title">{{ title }}</span>
			<div class="section-fr fr">
				<mlSearchInput
					style="margin-right: 10px"
					v-model="keyword"
					placeholder="查询"
					@confirm="getTableList"
				/>
				<slot name="addButton"></slot>
			</div>
		</el-header>

		<el-main class="ml-main-list">
			<el-table
				class="ml-el-table"
				:data="tableList"
				style="width: 100%"
				border
				stripe
				ref="meTable"
				@sort-change="sortChange"
			>
				<el-table-column
					v-for="(column, inx) of tableColumn"
					:key="inx"
					:prop="column.prop"
					:label="column.label"
					:align="column.align"
					:width="column.width"
					:formatter="column.formatter"
					:sortable="column.sortable"
				>
					<template #default="scope">
						<!-- 需要高亮的 且不要格式化的 -->
						<span
							v-if="column.highlight && !column.formatter"
							class="highlight"
							@click="highlightClick(scope.row)"
							>{{ scope.row[column.prop] }}</span
						>
						<!-- 需要高亮的 且 要格式化的 -->
						<span
							v-else-if="column.highlight && column.formatter"
							class="highlight"
							@click="highlightClick(scope.row)"
							>{{ column.formatter(scope.row) }}</span
						>
						<!-- 不需要高亮 且 需要格式化的 -->
						<span
							v-else-if="
								!column.highlight &&
								!column.elTag &&
								column.formatter
							"
							>{{ column.formatter(scope.row) }}</span
						>
						<!-- 有状态的 -->
						<span v-else-if="column.elTag && column.formatter">
							<el-tag
								v-if="column.formatter(scope.row).label"
								:type="column.formatter(scope.row).type"
								:style="
									column.styleFn
										? column.styleFn(scope.row)
										: {}
								"
								@click="
									column.clickFn
										? column.clickFn(scope.row)
										: null
								"
								>{{ column.formatter(scope.row).label }}</el-tag
							>
						</span>
						<span
							v-else-if="
								column.customSlot === 'switch' &&
								column.isNegation
							"
						>
							<el-switch
								v-model="scope.row[column.prop]"
								:active-value="false"
								:inactive-value="true"
								@change="changeSwitch(scope.row)"
							/>
						</span>
						<span
							v-else-if="
								column.customSlot === 'switch' &&
								!column.isNegation
							"
						>
							<el-switch
								v-model="scope.row[column.prop]"
								@change="changeSwitch(scope.row)"
							/>
						</span>
						<!-- 需要图片的 -->
						<span
							v-else-if="
								column.needImg && column.needImg(scope.row)
							"
						>
							{{ scope.row[column.prop] }}
							<img
								:src="column.needImg(scope.row)"
								style="
									width: 20px;
									height: 20px;
									position: relative;
									top: 5px;
								"
								alt
							/>
						</span>
						<!-- 如果有字段类型，且是文件类型 -->
						<el-tooltip
							v-else-if="
								column.columnType && column.columnType == 'File'
							"
							class="box-item"
							effect="dark"
							:content="'文件：' + scope.row[column.prop]?.length"
							placement="top"
						>
							<span
								class="ml-a-span mr-5"
								v-for="(field, inx) of scope.row[column.prop]"
								:key="inx"
								@click.stop="downField(field.url, field.name)"
								>{{ field.name }}</span
							>
						</el-tooltip>
						<!-- 如果有字段类型，且是密码类型 -->
						<span
							v-else-if="
								column.columnType &&
								column.columnType == 'password'
							"
						>
							<span v-if="scope.row.showPassword">{{
								scope.row[column.prop]
							}}</span>
							<span v-else>******************</span>
							<span
								v-if="column.actionBtnShow"
								style="
									position: relative;
									margin-left: 10px;
									cursor: pointer;
								"
								:style="{
									top: scope.row.showPassword ? '2px' : '0',
								}"
								@click.stop="
									scope.row.showPassword =
										!scope.row.showPassword
								"
							>
								<el-icon>
									<ElIconView />
								</el-icon>
							</span>
						</span>
						<!-- 默认 -->
						<span v-else>{{ scope.row[column.prop] }}</span>
					</template>
				</el-table-column>
				<slot name="activeRow"></slot>
			</el-table>

			<mlPagination
				:no="page.no"
				:size="page.size"
				:total="page.total"
				@pageChange="pageChange"
				@handleSizeChange="handleSizeChange"
			/>
		</el-main>
	</el-container>
</template>

<script setup>
import { onMounted, ref, reactive, inject } from "vue";
import http from "@/utils/request";
import { getDataList } from "@/api/crud";

const emits = defineEmits(["highlightClick", "changeSwitch"]);

const $API = inject("$API");
const props = defineProps({
	// 表格名字
	title: { type: String, default: "" },
	// 实体名称
	mainEntity: { type: String, default: "" },
	// 需要显示的字段
	fieldsList: { type: String, default: "" },
	// 默认排序字段
	sortFields: { type: Object, default: () => {} },
	// 默认过滤字段
	fieldName: { type: String, default: "" },
	// 添加过滤list
	filterItems: { type: Array, default: () => [] },
	// 表格列
	tableColumn: { type: Array, default: () => [] },
	// 查询接口
	queryUrl: { type: String, default: "" },
	equation: { type: String, default: "OR" },
    advFilter: { type: Object, default: () => {} },
});
let loading = ref(false);

// 搜索参数
let keyword = ref("");
// 表格数据
let tableList = ref([]);
// 分页
let page = reactive({
	no: 1,
	size: 20,
	total: 0,
});
let listColumnSort = ref(null);
onMounted(() => {
    listColumnSort.value = Object.assign(props.sortFields);
	getTableList();
});

// 分页切换
const pageChange = (cutPage) => {
	page.no = cutPage;
	getTableList();
};
const handleSizeChange = (size) => {
	page.size = size;
	getTableList();
};



// 排序切换
const sortChange = (column) => {
	let columnSort = {};
	if (column.order == "ascending") {
		columnSort.type = "ASC";
		columnSort.fieldName = column.prop;
	} else if (column.order == "descending") {
		columnSort.type = "DESC";
		columnSort.fieldName = column.prop;
	} else {
        columnSort = null;
	}
    if(!columnSort){
        listColumnSort.value = Object.assign(props.sortFields);
    }else {
        listColumnSort.value = [columnSort];
    }
	getTableList();
};

// 获取表格数据
async function getTableList() {
	loading.value = true;
	let { 
        mainEntity, 
        fieldsList, 
        fieldName, 
        filterItems, 
        equation, 
        advFilter 
    } = props;
	let param = {
		mainEntity,
		fieldsList,
		pageSize: page.size,
		pageNo: page.no,
		filter: {
			equation,
			items: [],
		},
		sortFields: listColumnSort.value,
        advFilter,
	};
	param.filter.items = filterItems.map((el) => {
		el.value = el.value ? el.value : keyword.value;
		return el;
	});
	if (keyword.value) {
        let newFieldName = fieldName.split(",");
        newFieldName.forEach(el => {
            param.filter.items.unshift({
                fieldName: el,
                op: "LK",
                value: keyword.value,
            });
        });
	}
	let res;
	if (props.queryUrl) {
		res = await http.post(props.queryUrl, {
			mainEntity: param.mainEntity,
			fieldsList: param.fieldsList,
			filter: param.filter,
			pageSize: param.pageSize,
			pageNo: param.pageNo,
			sortFields: param.sortFields,
		});
	} else {
		if (param.mainEntity == "ApprovalTask") {
			res = await $API.approval.list.getDataList(
				param.mainEntity,
				param.fieldsList,
				param.filter,
				param.pageSize,
				param.pageNo,
				param.sortFields
			);
		} else {
			res = await getDataList(
				param.mainEntity,
				param.fieldsList,
				param.filter,
				param.pageSize,
				param.pageNo,
				param.sortFields,
                param.advFilter
			);
		}
	}

	if (res && res.data) {
		tableList.value = res.data?.dataList || [];
		page.total = res.data.pagination.total;
	}
	loading.value = false;
}

// 详情跳转
const highlightClick = (row) => {
	emits("highlightClick", row);
};

const changeSwitch = (row) => {
	emits("changeSwitch", row);
};

const downField = (url, fileName) => {
	window.open(
		import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName
	);
};

defineExpose({
	loading,
	keyword,
	getTableList,
});
</script>
<style lang="scss" scoped>
.one-list {
	// background: red;
	position: relative;
	padding-bottom: 50px;
	background: #fff;
	// height: 100%;
}
.props-action-section {
	.section-title {
		font-size: 16px;
	}
}
.ml-main-list {
	// height: calc(100% - 300px);
	// background: red;
}
</style>
