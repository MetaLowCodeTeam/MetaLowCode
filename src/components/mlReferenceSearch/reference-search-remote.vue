<style lang="scss" scoped>
.remote-box {
	// position: relative;
	// height: 33px;
	display: flex;
}
.remote-select {
	flex: 1;
	:deep(.el-select__wrapper) {
		border-radius: 4px 0 0 4px;
	}
}
.remote-icon-box {
	height: 32px;
	width: 46px;
	text-align: center;
	border-radius: 0 4px 4px 0;
	border: 1px solid #e4e7ed;
	border-left: none;
	box-sizing: border-box;
	background: #f5f7fa;
	color: #909399;
	cursor: pointer;
}
.empty-box {
	padding: 10px;
	width: 100%;
	box-sizing: border-box;
}
</style>
<template>
	<div class="remote-box w-100">
		<el-select
			v-model="value"
			:multiple="multiple"
			class="remote-select"
			@visible-change="handleVisibleChange"
            :disabled="disabled"
			ref="selectRef"
		>
			<template #empty>
				<div class="empty-box" :style="{ minWidth: dialogWidth }">
					<div class="empty-box-title mb-10">
						<el-input
							v-model="searchValue"
							placeholder="请输入"
							clearable
							@input="handleSearch"
							ref="searchInputRef"
						>
						</el-input>
					</div>
					<el-table
						:data="tableData"
						:max-height="300"
						@row-click="clickRow"
					>
						<el-table-column
							v-for="column in tableColumns"
							:key="column.prop"
							:label="column.label"
							:prop="column.prop"
						/>
					</el-table>
					<div class="sc-table-select__page mt-10">
						<el-pagination
							small
							background
							layout="prev, pager, next"
							:total="total"
							:page-size="pageSize"
							v-model:currentPage="currentPage"
							@current-change="handleCurrentChange"
						></el-pagination>
					</div>
				</div>
			</template>
		</el-select>
		<div class="remote-icon-box" @click="onAppendButtonClick">
			<el-icon class="icon-top-1">
				<Search />
			</el-icon>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, watchEffect, nextTick } from "vue";
import { refFieldQuery2 } from "@/api/crud";
const props = defineProps({
	fieldModel: {
		type: Object,
		default: null,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
	placeholder: {
		type: String,
		default: "",
	},
	entity: {
		type: String,
		default: "",
	},
	refField: {
		type: String,
		default: "",
	},
	searchFields: {
		type: Array,
		default: [],
	},
	dialogWidth: {
		type: String,
		default: "520px",
	},
    disabled: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(["onSelectedRemote", "onAppendButtonClick"]);
let value = ref(null);
let loading = ref(false);

// 搜索参数
let searchValue = ref("");
// 表格数据
let tableData = ref([]);
// 表格列
let tableColumns = ref([]);
// 分页
let total = ref(0);
let pageSize = ref(10);
let currentPage = ref(1);
let idFieldName = ref("");
let nameFieldName = ref("");

// 分页
const handleCurrentChange = (v) => {
	currentPage.value = v;
	handleSearch();
};

// 搜索
const handleSearch = async () => {
	if (loading.value) return;
	loading.value = true;
	let param = {
		entity: props.entity,
		refField: props.refField,
		pageNo: currentPage.value,
		pageSize: pageSize.value,
	};
	let filter = null;
	if (props.searchFields.length > 0) {
		filter = {
			equation: "OR",
			items: props.searchFields.map((el) => {
				return {
					fieldName: el,
					value: searchValue.value,
					op: "LK",
				};
			}),
		};
	}
	let res = await refFieldQuery2(
		param.entity,
		param.refField,
		param.pageNo,
		param.pageSize,
		null,
		null,
		filter
	);
	if (res) {
		console.log(res);
		tableColumns.value = res.data.columnList;
		tableData.value = res.data.dataList;
		total.value = res.data.pagination?.total || 0;
		idFieldName.value = res.data.idFieldName;
		nameFieldName.value = res.data.nameFieldName;
	}
	loading.value = false;
};

// 搜索输入框
let searchInputRef = ref(null);
// 下拉框出现/隐藏时触发
const handleVisibleChange = (e) => {
	if (e) {
		// handleSearch();
		nextTick(() => {
			searchInputRef.value.focus();
			if (!loading.value) {
				handleSearch();
			}
		});
	}
};

const selectRef = ref(null);
const clickRow = (row) => {
	selectRef.value.blur();
	emit("onSelectedRemote", {
		record: {
			id: row[idFieldName.value],
			label: row[nameFieldName.value],
		},
		selectedRow: row,
	});
};



watchEffect(() => {
	value.value = props.fieldModel ? props.fieldModel.name : "";
});

const onAppendButtonClick = () => {
    if(props.disabled) return;
	emit("onAppendButtonClick");
};
</script>
