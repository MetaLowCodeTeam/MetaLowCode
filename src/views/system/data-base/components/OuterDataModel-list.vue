<template>
	<el-container v-loading="loading" element-loading-text="加载中...">
		<el-main> 123 </el-main>
		<el-footer class="main-footer"> 
            <!-- 分页 -->
            <el-pagination
                v-model:currentPage="pageConfig.currentPage"
                v-model:pageSize="pageConfig.pageSize"
                :page-sizes="pageConfig.pageSizes"
                :total="pageConfig.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-footer>
	</el-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { queryModelById, getOuterDataByDataModel } from "@/api/plugins";
const route = useRoute();

let loading = ref(false);
onMounted(() => {
	// console.log(route.query.outerDataModelId,'props.outerDataModelId');
	loadModelData();
});

// 表头
let tableHeader = ref([]);
// 表数据
let tableData = ref([]);
// 分页配置
let pageConfig = ref({
	currentPage: 1,
	pageSize: 20,
	pageSizes: [20, 40, 80, 100, 200, 300, 400, 500],
	total: 0,
});

// 加载配置数据
const loadModelData = async () => {
	loading.value = true;
	let res = await queryModelById({
		outerDataModelId: route.params.outerDataModelId,
	});
	if (res) {
		tableHeader.value = res.data.ModelField.map((el) => {
			return {
				label: el.fieldLabel || el.fieldName,
				prop: el.fieldName,
			};
		});
        await loadListData();
	}
	loading.value = false;
};

// 分页切换
const handleSizeChange = (val) => {
    pageConfig.value.pageSize = val;
}
const handleCurrentChange = (val) => {
    pageConfig.value.currentPage = val;
}

// 加载列表数据
const loadListData = async () => {
    loading.value = true;
    let res = await getOuterDataByDataModel(
        {
            outerDataModelId: route.params.outerDataModelId,
        },
        {
            page: pageConfig.value.currentPage,
            size: pageConfig.value.pageSize,
            uname: "123",
        }
    );
    if (res) {
        tableData.value = res.data.data;
        pageConfig.value.total = res.data.total;
    }
    loading.value = false;
}

</script>
<style scoped lang="scss">
.main-container {
	height: 100%;
	box-sizing: border-box;
	padding: 20px;
	.main-div {
		background: #fff;
	}
}
.main-header {
	background: #fff;
}
.main-body {
	background: #fff;
}
.main-footer {
	display: flex;
	justify-content: center;
	align-items: center;
    height: 52px;
}
</style>
