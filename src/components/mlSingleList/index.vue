<template>
    <el-container v-loading="loading" element-loading-text="加载中..." class="one-list">
        <el-header class="props-action-section">
            <span class="section-title">{{ title }}</span>
            <div class="section-fr fr">
                <mlSearchInput
                    style="margin-right: 10px;"
                    v-model="keyword"
                    placeholder="查询"
                    @confirm="getTableList"
                />
                <slot name="addbutton"></slot>
            </div>
        </el-header>

        <el-main class="ml-main-list">
            <el-table
                class="ml-el-table"
                :data="tableList"
                style="width: 100%;"
                :border="true"
                ref="meTable"
            >
                <el-table-column
                    v-for="(column,inx) of tableColumn"
                    :key="inx"
                    :prop="column.prop"
                    :label="column.label"
                    :align="column.align"
                    :width="column.width"
                    :formatter="column.formatter"
                >
                    <template #default="scope">
                        <!-- 需要高亮的 -->
                        <span
                            v-if="column.highlight && !column.formatter"
                            class="highlight"
                            @click="highlightClick(scope.row)"
                        >{{ scope.row[column.prop] }}</span>
                        <!-- 需要高亮的 -->
                        <span
                            v-else-if="column.highlight && column.formatter"
                            class="highlight"
                            @click="highlightClick(scope.row)"
                        >{{ column.formatter(scope.row) }}</span>
                        <!-- 需要格式化的 -->
                        <span
                            v-else-if="!column.highlight && !column.elTag && column.formatter"
                        >{{ column.formatter(scope.row)}}</span>
                        <!-- 有状态的 -->
                        <span v-else-if="column.elTag && column.formatter">
                            <el-tag
                                v-if="column.formatter(scope.row).label"
                                :type="column.formatter(scope.row).type"
                                :style="column.styleFn(scope.row)"
                                @click="column.clickFn ? column.clickFn(scope.row) : null"
                            >{{ column.formatter(scope.row).label }}</el-tag>
                        </span>
                        <span v-else-if="column.customSolt === 'switch' && column.isNegation">
                            <el-switch
                                v-model="scope.row[column.prop]"
                                :active-value="false"
                                :inactive-value="true"
                                @change="changeSwitch(scope.row)"
                            />
                        </span>
                        <span v-else-if="column.customSolt === 'switch' && !column.isNegation">
                            <el-switch
                                v-model="scope.row[column.prop]"
                                @change="changeSwitch(scope.row)"
                            />
                        </span>
                        <!-- 需要图片的 -->
                        <span v-else-if="column.needImg && column.needImg(scope.row)">
                            {{ scope.row[column.prop] }}
                            <img
                                :src="column.needImg(scope.row)"
                                style="width: 20px;height: 20px;position: relative;top: 4px;"
                                alt
                            />
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
onMounted(() => {
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
// 获取表格数据
async function getTableList() {
    loading.value = true;
    let { mainEntity, fieldsList, fieldName, sortFields, filterItems } = props;
    let param = {
        mainEntity,
        fieldsList,
        pageSize: page.size,
        pageNo: page.no,
        filter: {
            equation: "OR",
            items: [],
        },
        sortFields,
    };
    param.filter.items = filterItems.map((el) => {
        el.value = el.value ? el.value : keyword.value;
        return el;
    });
    if (keyword.value) {
        param.filter.items.unshift({
            fieldName,
            op: "LK",
            value: keyword.value,
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
                param.sortFields
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