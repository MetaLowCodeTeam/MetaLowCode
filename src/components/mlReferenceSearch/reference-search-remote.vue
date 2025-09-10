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
        <el-select-v2
            v-model="value"
            :multiple="multiple"
            class="remote-select"
            :disabled="disabled"
            ref="selectRef"
            filterable
            @visible-change="handleVisibleChange"
            :filter-method="onFilter"
            :options="[]"
            :placeholder="placeholder"
            :remote-show-suffix="true"
            :fit-input-width="800"
        >
            <template #empty>
                <div
                    v-if="isDropdownVisible"
                    class="empty-box"
                    :style="{ minWidth: dialogWidth }"
                >
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
                                :width="column.width"
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
                                size="small"
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
        </el-select-v2>
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
import { Search } from '@element-plus/icons-vue';
import { setColumnFormatter } from "@/utils/util";
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
        type: [String, Number],
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
    extraFilter: String,
    // 过滤条件
    filterConditions: {
        type: Object,
        default: () => {},
    },
    // 检查过滤条件
    checkFilterConditions: {
        type: Function,
        default: () => {},
    },
    // 回车开始查询 默认输入后立即查询数据，开启选项后按回车键才查询数据。
    enterStartSearch: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    "onSelectedRemote",
    "onAppendButtonClick",
    "onFocus",
]);
let value = ref(null);
let loading = ref(false);

let searchValue = ref("");
let tableData = ref([]);
let tableColumns = ref([]);
let total = ref(0);
let pageSize = ref(10);
let currentPage = ref(1);
let idFieldName = ref("");
let nameFieldName = ref("");

let isDropdownVisible = ref(false);
// 清空查询结果（可选是否重置关键字）
const clearResults = (resetKeyword = false) => {
    tableData.value = [];
    total.value = 0;
    currentPage.value = 1;
    if (resetKeyword) searchValue.value = "";
};

const handleCurrentChange = (v) => {
    currentPage.value = v;
    handleSearch(null);
};

const handleVisibleChange = (e) => {
    isDropdownVisible.value = e;
    if (e) {
        if (!props.enterStartSearch) {
            handleSearch(null);
        }
        // enterStartSearch 开启时，打开下拉清空旧数据，等待回车再查
        if (props.enterStartSearch) {
            clearResults(false);
        }
        nextTick(() => {
            getSearchInputRef()?.focus();
            currentCursor.value = -1;
        });
    } else {
        // enterStartSearch 开启时，关闭下拉同时清空数据
        if (props.enterStartSearch) {
            clearResults(false);
        }
        currentCursor.value = -1;
        tableRef.value?.setCurrentRow(null);
    }
};

const onFilter = (val) => {
    searchValue.value = val;
    if (!props.enterStartSearch) {
        handleSearch(val);
    } else {
        // 启用回车查询时，输入过程中若已有数据则清空，避免显示旧数据
        if (tableData.value.length > 0) clearResults(false);
    }
}

const handleSearch = (v) => {
    if (loading.value) return;
    searchValue.value = v || "";
    if(!props.checkFilterConditions()){
        return
    }
    // 先加锁，避免 visible-change 与 filter-method 竞态触发导致并发
    loading.value = true;
    nextTick(async () => {
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
            props.filterConditions,
        );
        if (res) {
            // tableColumns.value = res.data.columnList;
            let columnList = res.data.columnList;
            let fieldStyleMap = res.data.fieldStyleMap || {};
            tableColumns.value = columnList.filter(cl => fieldStyleMap[cl.prop]?.isHide !== true);
            tableColumns.value.forEach((cl) => {
                cl.label = fieldStyleMap[cl.prop]?.aliasName || cl.label;
                cl.width = fieldStyleMap[cl.prop]?.width || '';
                cl.fieldName = cl.prop;
                cl.fieldType = cl.type;
                setColumnFormatter(cl);
            });
            tableData.value = res.data.dataList;
            total.value = res.data.pagination?.total || 0;
            idFieldName.value = res.data.idFieldName;
            nameFieldName.value = res.data.nameFieldName;
        }
        loading.value = false;
        if (isDropdownVisible.value && tableData.value.length > 0) {
            if (currentCursor.value === -1 || currentCursor.value >= tableData.value.length) {
                currentCursor.value = 0;
            }
            scrollToRow(currentCursor.value);
        } else {
            tableRef.value?.setCurrentRow(null);
            currentCursor.value = -1;
        }
    })

};

let searchInputDomRef: HTMLInputElement | null = null;
const getSearchInputRef = () => {
    if (!searchInputDomRef && selectRef.value?.$el) {
        searchInputDomRef = selectRef.value.$el.querySelector('.el-select__input') || selectRef.value.$el.querySelector('input');
    }
    return searchInputDomRef;
};

const selectRef = ref(null);
const currentCursor = ref(-1);
let tableRef = ref(null);

const handleKeyDown = (event) => {
    if (!isDropdownVisible.value) {
        // 如果下拉框不可见，且按了Enter，则打开下拉框（由el-select内部处理）
        return;
    }

    if (["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Enter", "Escape"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
    }

    switch (event.key) {
        case "ArrowRight":
            handleArrowRight();
            break;
        case "ArrowLeft":
            handleArrowLeft();
            break;
        case "ArrowDown":
            handleArrowDown();
            break;
        case "ArrowUp":
            handleArrowUp();
            break;
        case "Enter":
            handleEnter();
            break;
        case "Escape":
            selectRef.value.blur(); // Esc 键依然是失焦并关闭
            break;
    }
};

const handleArrowRight = () => {
    if (loading.value) return;
    const totalPages = Math.ceil(total.value / pageSize.value);
    if (currentPage.value < totalPages) {
        currentPage.value++;
        handleSearch(searchValue.value);
    }
};

const handleArrowLeft = () => {
    if (loading.value) return;
    if (currentPage.value > 1) {
        currentPage.value--;
        handleSearch(searchValue.value);
    }
};

const handleArrowDown = () => {
    if (loading.value || tableData.value.length === 0) return;
    if (currentCursor.value < tableData.value.length - 1) {
        currentCursor.value++;
    } else {
        currentCursor.value = 0;
    }
    scrollToRow(currentCursor.value);
};

const handleArrowUp = () => {
    if (loading.value || tableData.value.length === 0) return;
    if (currentCursor.value > 0) {
        currentCursor.value--;
    } else {
        currentCursor.value = tableData.value.length - 1;
    }
    scrollToRow(currentCursor.value);
};

// 回车事件：选中数据后下拉框消失，焦点仍在输入框
const handleEnter = () => {
    if (props.enterStartSearch) {
        // 有数据就回填；没数据则先搜索
        if (tableData.value.length === 0) {
            if (!searchValue.value) return; // 无关键字不搜索
            handleSearch(searchValue.value);
            return;
        }
        if (currentCursor.value !== -1 && tableData.value[currentCursor.value]) {
            const selectedRow = tableData.value[currentCursor.value];
            clickRow(selectedRow);
            nextTick(() => {
                getSearchInputRef()?.focus();
            });
            return;
        }
        if (currentCursor.value === -1 && tableData.value.length > 0) {
            currentCursor.value = 0;
            clickRow(tableData.value[currentCursor.value]);
            nextTick(() => {
                getSearchInputRef()?.focus();
            });
            return;
        }
        return;
    }

    // 默认：始终回填
    if (currentCursor.value !== -1 && tableData.value[currentCursor.value]) {
        const selectedRow = tableData.value[currentCursor.value];
        clickRow(selectedRow);
        nextTick(() => {
            getSearchInputRef()?.focus();
        });
    } else if (currentCursor.value === -1 && tableData.value.length > 0) {
        currentCursor.value = 0;
        clickRow(tableData.value[currentCursor.value]);
        nextTick(() => {
            getSearchInputRef()?.focus();
        });
    }
};

const scrollToRow = (index: number) => {
    nextTick(() => {
        if (!tableRef.value) return;
        const allRows = tableRef.value.$el.querySelectorAll(".el-table__row");
        if (allRows[index]) {
            tableRef.value.setCurrentRow(tableData.value[index]);
            allRows[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            tableRef.value?.setCurrentRow(null);
        }
    });
};

// 行点击：关闭下拉并回填
const clickRow = (row) => {
    selectRef.value.blur(); // 这会关闭下拉框，并使el-select失焦

    emit("onSelectedRemote", {
        record: {
            id: row[idFieldName.value],
            label: row[nameFieldName.value],
        },
        selectedRow: row,
    });
    // 焦点恢复逻辑放在 handleEnter 和外部需要保持焦点的场景中
    // 若开启 enterStartSearch，选中后清空结果与关键字，防止再次回车沿用旧数据
    if (true === (/** @type {any} */(props)).enterStartSearch) {
        clearResults(true);
    }
};

watchEffect(() => {
    value.value = props.fieldModel && (props.fieldModel as any).name ? (props.fieldModel as any).name : "";
});

const onAppendButtonClick = () => {
    if (props.disabled) return;
    emit("onAppendButtonClick");
};

onMounted(() => {
    nextTick(() => {
        const inputElement = getSearchInputRef();
        if (inputElement) {
            inputElement.addEventListener('keydown', handleKeyDown);
        }
    });
});

onUnmounted(() => {
    const inputElement = getSearchInputRef();
    if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDown);
    }
});

const focus = () => {
	selectRef.value.focus();
};

defineExpose({
	focus
});
</script>
