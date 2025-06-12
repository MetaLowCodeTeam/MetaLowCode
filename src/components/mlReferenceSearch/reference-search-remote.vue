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
	&.small {
		height: 24px;
	}
	&.large {
		height: 40px;
	}
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
			@click="handleFocus"
		>
			<template #empty>
				<div
					class="empty-box"
					:style="{ minWidth: dialogWidth }"
					v-if="isDropdownVisible"
				>
					<div class="empty-box-title mb-10">
						<el-input
							v-model="searchValue"
							placeholder="请输入"
							clearable
							@input="handleSearch"
							ref="searchInputRef"
							@focus="handleInputFocus"
						>
						</el-input>
					</div>
					<div class="empty-box-table" v-loading="loading">
						<el-table
							:data="tableData"
							:max-height="300"
							@row-click="clickRow"
							ref="tableRef"
							highlight-current-row
						>
							<el-table-column
								v-for="column in tableColumns"
								:key="column.prop"
								:label="column.label"
								:prop="column.prop"
							>
								<template #default="scope">
									<FormatRow
										:row="scope.row"
										:column="column"
										:nameFieldName="nameFieldName"
									/>
								</template>
							</el-table-column>
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
				</div>
			</template>
		</el-select>
		<div
			class="remote-icon-box"
			:class="[size]"
			@click="onAppendButtonClick"
		>
			<el-icon class="icon-top-1">
				<Search />
			</el-icon>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, watchEffect, nextTick, onMounted, onUnmounted } from "vue";
import { refFieldQuery2 } from "@/api/crud";
import FormatRow from "@/views/customize-menu/components/FormatRow.vue";
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
	},
	size: {
		type: String,
		default: "default",
	},
	// setFilter查询条件
	extraFilter: String, // 查询条件
});

const emit = defineEmits([
	"onSelectedRemote",
	"onAppendButtonClick",
	"onFocus",
]);
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

// 是否显示下拉框
let isDropdownVisible = ref(false);

//  过滤条件
let filterConditions = ref(null);

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
		props.extraFilter,
		filter,
		filterConditions.value
	);
	if (res) {
		tableColumns.value = res.data.columnList;
		tableColumns.value.forEach((el) => {
			el.fieldName = el.prop;
			el.fieldType = el.type;
		});
		tableData.value = res.data.dataList;
		total.value = res.data.pagination?.total || 0;
		idFieldName.value = res.data.idFieldName;
		nameFieldName.value = res.data.nameFieldName;
	}
	loading.value = false;
};

// 搜索输入框
let searchInputRef = ref(null);

// 下拉框
const selectRef = ref(null);

// 光标位置（-1=输入框，0~N=表格行）
const currentCursor = ref(-1);

// 初始化键盘监听
onMounted(() => {
	window.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleGlobalKeyDown);
});

// 键盘事件处理
const handleGlobalKeyDown = (event) => {
	if (!isDropdownVisible.value) return;
	console.log(event.key);
	switch (event.key) {
		case "ArrowDown":
			handleArrowDown();
			break;
		case "ArrowUp":
			handleArrowUp();
			break;
		case "ArrowRight":
			handleArrowRight();
			break;
		case "ArrowLeft":
			handleArrowLeft();
			break;
		case "Enter":
			handleEnter();
			break;
	}
};
// 向右
const handleArrowRight = () => {
	const totalPages = Math.ceil(total.value / pageSize.value);
	if (currentPage.value < totalPages) {
		// 如果不是最后一页
		currentPage.value++; // 切换到下一页
		handleSearch().then(() => {
			currentCursor.value = 0; // 重置光标到第一行
			scrollToRow(currentCursor.value);
		});
	}
};

// 向左
const handleArrowLeft = () => {
	if (currentPage.value > 1) {
		// 如果不是第一页
		currentPage.value--; // 切换到上一页
		handleSearch().then(() => {
			currentCursor.value = 0; // 重置光标到第一行
			scrollToRow(currentCursor.value);
		});
	}
};

// 向下
const handleArrowDown = () => {
	if (currentCursor.value === -1) {
		return;
	}
	if (currentCursor.value < tableData.value.length - 1) {
		currentCursor.value++;
		scrollToRow(currentCursor.value);
	}
	console.log(currentCursor.value, "当前光标");
};

// 向上
const handleArrowUp = () => {
	if (currentCursor.value === -1) {
		return;
	}
	if (currentCursor.value > 0) {
		currentCursor.value--;
		scrollToRow(currentCursor.value);
	} else {
		searchInputRef.value.focus();
	}
	console.log(currentCursor.value, "当前光标");
};

// 回车事件
const handleEnter = () => {
	if (currentCursor.value === -1) {
		currentCursor.value = 0;
		searchInputRef.value.blur();
		scrollToRow(0);
	} else {
		const selectedRow = tableData.value[currentCursor.value];
		clickRow(selectedRow);
	}
	console.log(currentCursor.value, "当前光标");
};
let tableRef = ref(null);
// 滚动到指定行
const scrollToRow = (index: number) => {
	nextTick(() => {
		const tableBody = tableRef.value?.$el.querySelector(
			".el-table__body-wrapper"
		);
		const targetRow =
			tableRef.value?.$el.querySelectorAll(".el-table__row")[index];
		if (tableBody && targetRow) {
			targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
		tableRef.value?.setCurrentRow(tableData.value[index]);
	});
};

// 输入框聚焦
const handleInputFocus = () => {
	currentCursor.value = -1;
	tableRef.value?.setCurrentRow(null);
};

const handleFocus = () => {
	// let { field } = props;
	// isDropdownVisible.value = true;
	emit("onFocus");
};

// 下拉框出现/隐藏时触发
const handleVisibleChange = (e) => {
	if (e) {
		// handleSearch();
	}
};

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
	if (props.disabled) return;
	emit("onAppendButtonClick");
};

const setFilterConditions = (conditions, isShow) => {
	filterConditions.value = conditions;
	isDropdownVisible.value = isShow;
	if (!isShow) {
		setTimeout(() => {
			selectRef.value.blur();
		}, 200);
	} else {
		nextTick(() => {
			searchInputRef.value.focus();
			currentCursor.value = -1;
			if (!loading.value) {
				handleSearch();
			}
		});
	}
};

defineExpose({
	setFilterConditions,
});
</script>
