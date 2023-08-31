<template>
    <div class="customize-menu-list" v-loading="pageLoading">
        <div class="table-box">
            <div class="mb-20">搜索</div>
            <el-table
                :data="tableData"
                :border="true"
                stripe
                style="width: 100%"
                @selection-change="handleSelectionChange"
            >
                <el-table-column
                    v-for="(column,columnInx) of tableColumn"
                    :key="columnInx"
                    :label="column.fieldLabel"
                >
                    <template #default="scope">
                        <div>{{ scope.row[column.fieldName] }}</div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <mlPagination
            :no="page.no"
            :total="page.total"
            @pageChange="pageChange"
            style="background: #fff;"
        />
    </div>
</template>

<script setup>
import { ref, onBeforeMount, inject, reactive } from "vue";
import { useRouter } from "vue-router";
import { queryEntityFields, getDataList } from "@/api/crud";
const router = useRouter();
const $ElMessage = inject("$ElMessage");
// 页面Loading
let pageLoading = ref(false);
// 当前实体
let entityCode = ref("");
let entityName = ref("");
// 表格列
let tableColumn = ref([]);
// 所有字段
let allFields = ref([]);
// 表格数据
let tableData = ref([]);
// 表格多选数据
let multipleSelection = ref([]);
// 分页
let page = reactive({
    no: 1,
    size: 20,
    total: 0,
});
// 排序
let sortFields = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);
onBeforeMount(() => {
    entityCode.value = router.currentRoute.value.meta.entityCode;
    entityName.value = router.currentRoute.value.meta.entityName;
    getTableColumn();
});

const getTableColumn = async () => {
    pageLoading.value = true;
    let res = await queryEntityFields(entityCode.value, false, true);
    if (res.code === 200) {
        tableColumn.value = res.data;
        allFields.value = [];
        res.data.forEach((el) => {
            allFields.value.push(el.fieldName);
        });
        getTableList();
    } else {
        $ElMessage.error("获取表格列：" + res.error);
    }
};

// 分页切换
const pageChange = (cutPage) => {
    page.no = cutPage;
    getTableList();
};

// 表格多选
const handleSelectionChange = (val) => {
    multipleSelection.value = val;
};

const getTableList = async () => {
    pageLoading.value = true;
    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        filter: {
            equation: "AND",
            items: [],
        },
        sortFields: sortFields.value,
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
        tableData.value = res.data.dataList;
        page.total = res.data.pagination.total;
        pageLoading.value = false;
    } else {
        pageLoading.value = false;
        message.error("获取表格数据失败：" + res.error);
    }
};

// const getCutEntityFields = () => {
//     return new Promise(async (resolve, reject) => {
//         let res = await queryEntityFields(trigger.value.entityCode, true, true);
//         if (res.code === 200) {
//             cutEntityFields.value = res.data;
//             res.data.forEach((el) => {
//                 cutEntityFieldLable.value[el.fieldName] = el.fieldLabel;
//             });
//             resolve();
//         } else {
//             $ElMessage.error("获取当前实体字段数据失败：" + res.error);
//             resolve();
//         }
//     });
// };
</script>
<style lang='scss' scoped>
.customize-menu-list {
    padding: 20px;
    position: relative;
    height: 100%;
    // background: #fff;
    .table-box {
        border-top: 2px solid #409eff;
        padding: 20px 0;
    }
}
</style>