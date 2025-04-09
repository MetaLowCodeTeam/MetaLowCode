<template>
	<el-container v-loading="loading" element-loading-text="加载中...">
		<el-main>
			<div class="query-params" v-if="queryParams.length > 0">
				<el-form
					ref="queryParamsRef"
					label-width="100px"
					:model="queryFrom"
					:rules="queryParamsRules"
					:show-message="false"
					@submit.prevent
				>
					<!-- 参数少于等于 4 个时的布局 -->
					<el-row :gutter="10" v-if="isSingleRow">
						<el-col
							:span="6"
							v-for="item in queryParams"
							:key="item.name"
						>
							<el-form-item
								:label="item.label"
								style="margin-bottom: 10px"
								:prop="item.name"
							>
								<!-- 文本类型1 和 文本(模糊)5 -->
								<el-input
									v-model="queryFrom[item.name]"
									:placeholder="`请输入${item.label}`"
									clearable
									v-if="item.type == 1 || item.type == 5"
								/>
								<!-- 日期时间2 -->
								<el-date-picker
									v-model="queryFrom[item.name]"
									type="datetime"
									placeholder="选择日期时间"
									clearable
									v-if="item.type == 2"
									class="w-100"
								/>
								<!-- 日期3 -->
								<el-date-picker
									v-model="queryFrom[item.name]"
									type="date"
									placeholder="选择日期"
									clearable
									v-if="item.type == 3"
									class="w-100"
								/>
								<!-- 数字4 -->
								<el-input-number
									v-model="queryFrom[item.name]"
									placeholder="请输入数字"
									v-if="item.type == 4"
									:controls="false"
									style="text-align: left"
									class="w-100 ml-number-input"
								/>
							</el-form-item>
						</el-col>
						<el-col
							:span="6"
							:offset="(3 - queryParams.length) * 6"
							style="text-align: right"
						>
							<el-button type="primary" @click="handleQuery">
								查询
							</el-button>
							<el-button @click="resetQuery">重置</el-button>
						</el-col>
					</el-row>

					<!-- 参数多于 4 个时的布局 -->
					<template v-else>
						<el-row :gutter="10">
							<el-col
								:span="6"
								v-for="item in queryParams"
								:key="item.name"
							>
								<el-form-item
									:label="item.label"
									style="margin-bottom: 10px"
									:prop="item.name"
								>
									<!-- 文本类型1 和 文本(模糊)5 -->
									<el-input
										v-model="queryFrom[item.name]"
										:placeholder="`请输入${item.label}`"
										clearable
										v-if="item.type == 1 || item.type == 5"
									/>
									<!-- 日期时间2 -->
									<el-date-picker
										v-model="queryFrom[item.name]"
										type="datetime"
										placeholder="选择日期时间"
										clearable
										v-if="item.type == 2"
										class="w-100"
										format="YYYY-MM-DD HH:mm:ss"
										value-format="YYYY-MM-DD HH:mm:ss"
									/>
									<!-- 日期3 -->
									<el-date-picker
										v-model="queryFrom[item.name]"
										type="date"
										placeholder="选择日期"
										clearable
										v-if="item.type == 3"
										class="w-100"
										format="YYYY-MM-DD"
										value-format="YYYY-MM-DD"
									/>
									<!-- 数字4 -->
									<el-input-number
										v-model="queryFrom[item.name]"
										placeholder="请输入数字"
										v-if="item.type == 4"
										:controls="false"
										style="text-align: left"
										class="w-100 ml-number-input"
									/>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row>
							<el-col :span="24" style="text-align: right">
								<el-button type="primary" @click="handleQuery">
									查询
								</el-button>
								<el-button @click="resetQuery">重置</el-button>
							</el-col>
						</el-row>
					</template>
				</el-form>
			</div>
			<div
				class="table-container"
				:style="{
					height: queryParams.length > 0 ? '500px' : '100%',
				}"
			>
				<el-table
					:data="tableData"
					style="width: 100%"
					:border="true"
					height="100%"
				>
					<el-table-column
						v-for="column in tableHeader"
						:key="column.prop"
						:prop="column.prop"
						:label="column.label"
					/>
				</el-table>
			</div>
		</el-main>
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
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { queryModelById, getOuterDataByDataModel } from "@/api/plugins";
import { ElMessage } from "element-plus";
const route = useRoute();

let loading = ref(false);

let outerDataModelId = ref("");
onMounted(() => {
	outerDataModelId.value = route.query.outerDataModelId;
	if (!outerDataModelId.value) {
		ElMessage.error("数据模型ID不存在");
		return;
	}
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
// 查询参数
let queryParams = ref([]);
let queryFrom = ref({});
let queryParamsRules = ref({});

// 动态计算是否需要换行
const isSingleRow = computed(() => {
	return queryParams.value.length <= 4;
});

// 新增方法：检查查询参数是否合法
const checkQueryParams = () => {
	for (const item of queryParams.value) {
		if (item.isRequired && !queryFrom.value[item.name]) {
			return false;
		}
	}
	return true;
};

// 加载配置数据
const loadModelData = async () => {
	loading.value = true;
	let res = await queryModelById({
		outerDataModelId: outerDataModelId.value,
	});
	if (res) {
		queryParams.value = [];
		queryParamsRules.value = {};
		queryFrom.value = {};
		if (res.data.ModelParam) {
			res.data.ModelParam.forEach((el) => {
				queryParams.value.push({
					label: el.paramLabel || el.paramName,
					name: el.paramName,
					type: el.paramType.value,
					isRequired: el.isRequired,
				});
				queryFrom.value[el.paramName] = el.defaultValue || "";
				if ([2, 3, 4].includes(el.paramType.value)) {
					queryFrom.value[el.paramName] = el.defaultValue || null;
				}
				if (el.isRequired) {
					queryParamsRules.value[el.paramName] = [
						{
							required: el.isRequired,
							message: "请输入" + (el.paramLabel || el.paramName),
							trigger: "blur",
						},
					];
				}
			});
		}
		tableHeader.value = res.data.ModelField.map((el) => {
			return {
				label: el.fieldLabel || el.fieldName,
				prop: el.fieldName,
			};
		});
		// 检查查询参数是否合法
		await loadListData();
	}
	loading.value = false;
};

// 查询
let queryParamsRef = ref();
const handleQuery = () => {
	queryParamsRef.value.validate((valid) => {
		if (valid) {
			loadListData();
		}
	});
};

// 重置查询
const resetQuery = () => {
	// 清空表单
	queryParamsRef.value.resetFields();
	// 重置分页
	pageConfig.value.currentPage = 1;
	pageConfig.value.pageSize = 20;
	pageConfig.value.total = 0;
	loadListData();
};

// 分页切换
const handleSizeChange = (val) => {
	pageConfig.value.pageSize = val;
	loadListData();
};
const handleCurrentChange = (val) => {
	pageConfig.value.currentPage = val;
	// 检查查询参数是否合法
	loadListData();
};

// 加载列表数据
const loadListData = async () => {
	// 检查查询参数是否合法
	if (!checkQueryParams()) {
		return;
	}
    // 清空表格数据
	tableData.value = [];
	let listParam = JSON.parse(JSON.stringify(queryFrom.value));
	// 处理文本模糊查询
	queryParams.value.forEach((item) => {
		if (item.type == 5 && listParam[item.name]) {
			listParam[item.name] = `%${listParam[item.name]}%`;
		}
	});
	loading.value = true;
	let res = await getOuterDataByDataModel(
		{
			outerDataModelId: outerDataModelId.value,
			pageNo: pageConfig.value.currentPage,
			pageSize: pageConfig.value.pageSize,
		},
		listParam
	);
	if (res) {
		tableData.value = res.data.dataList || [];
		pageConfig.value.total = res.data?.pagination?.total || 0;
	}
	loading.value = false;
};
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
.query-params {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	box-sizing: border-box;
	padding: 20px;
	margin-bottom: 20px;
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
