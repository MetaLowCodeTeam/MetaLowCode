<template>
    <el-container v-loading="loading" element-loading-text="加载中..." class="one-list">
        <el-header class="props-action-section">
            <span class="section-title">{{ title }}</span>
            <div class="section-fr fr">
                <mlSearchInput
                    class="section-search"
                    v-model="keyword"
                    placeholder="查询"
                    @confirm="getTableList"
                />
            </div>
        </el-header>

        <el-main>
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
                ></el-table-column>
                <slot name="activeRow"></slot>
            </el-table>
            <mlPagination :no="page.no" :total="page.total" @pageChange="pageChange" />
        </el-main>
    </el-container>
</template>
  
<script setup>
import { onMounted, ref, reactive, inject } from "vue";
import { getDataList } from "@/api/crud";
const message = inject("$ElMessage");
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
            equation: "AND",
            items: [
                {
                    fieldName,
                    op: "LK",
                    value: keyword.value,
                },
                ...filterItems,
            ],
        },
        sortFields,
    };
    let res = await getDataList(
        param.mainEntity,
        param.fieldsList,
        param.filter,
        param.pageSize,
        param.pageNo,
        param.sortFields
    );
    if (res.code === 200) {
        tableList.value = res.data.dataList;
        page.total = res.data.pagination.total;
        loading.value = false;
    } else {
        loading.value = false;
        message.error("获取表格数据失败：" + res.error);
    }
}

defineExpose({
    loading,
    getTableList
})
</script>
<style lang="scss" scoped>
.one-list {
    background: #fff;
    position: relative;
    padding-bottom: 50px;
}
.props-action-section {
    .section-title {
        font-size: 16px;
    }
    .section-fr {
        .section-search {
            display: inline-block;
            width: 224px;
        }
    }
}
</style>