<template>
	<ml-dialog 
        :title="title" 
        v-model="isShow" 
        appendToBody 
        width="55%"
        :show-close="!loading"
    >
		<div v-loading="loading">
			<ml-scrollbar height="500px">
				<el-form ref="formRef" :model="formData" :rules="rules">
					<el-row :gutter="20">
						<el-col :span="12">
							<el-form-item label="模型名称" prop="modelName">
								<el-input
									v-model="formData.modelName"
									placeholder="请输入模型名称"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="数据源" prop="dataSourceLabel">
								<el-input
									v-model="formData.dataSourceLabel"
									placeholder="请选择数据源"
								>
									<template #append>
										<el-button
											type="primary"
											@click="openDataSourceDialog"
											icon="Search"
										/>
									</template>
								</el-input>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="是否禁用" prop="isDisabled">
								<el-radio-group v-model="formData.isDisabled">
									<el-radio :label="true">是</el-radio>
									<el-radio :label="false">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="SQL文本" prop="sqlText">
								<div class="w-100">
									<mlCodeEditor
										v-model="formData.sqlText"
										mode="sql"
										height="200"
									/>
								</div>
								<div class="mt-10">
									<el-button type="success" @click="testSql">
										SQL解析
									</el-button>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="SQL参数">
								<el-table
									:data="formData.sqlParams"
									:border="true"
								>
									<el-table-column
										prop="name"
									>
                                        <template #header>
                                            <span class="is-required">*</span>
                                            参数名称
                                        </template>
                                        <template #default="scope">
                                            <el-input v-model="scope.row.name" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
										prop="code"
									>
                                        <template #header>
                                            <span class="is-required">*</span>
                                            参数编码
                                        </template>
                                        <template #default="scope">
                                            <el-input v-model="scope.row.name" />
                                        </template>
                                    </el-table-column>
									<el-table-column
										prop="type"
									>
                                        <template #header>
                                            <span class="is-required">*</span>
                                            参数类型
                                        </template>
                                        <template #default="scope">
                                            <el-input v-model="scope.row.name" />
                                        </template>
                                    </el-table-column>
									<el-table-column
										prop="isRequired"
									>
                                        <template #header>
                                            <span class="is-required">*</span>
                                            必填
                                        </template>
                                        <template #default="scope">
                                            <el-input v-model="scope.row.name" />
                                        </template>
                                    </el-table-column>
									<el-table-column
										prop="defaultValue"
										label="默认值"
									/>
								</el-table>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="查询字段">
								<el-table
									:data="formData.queryFields"
									:border="true"
								>
									<el-table-column
										prop="name"
										label="字段名"
									/>
									<el-table-column
										prop="label"
										label="显示名称"
									/>
									<el-table-column prop="type" label="类型" />
								</el-table>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</ml-scrollbar>
		</div>
		<template #footer>
			<el-button @click="cancel" :loading="loading">取消</el-button>
			<el-button
				type="primary"
				@click="confirm"
				icon="Select"
				:loading="loading"
			>
				保存
			</el-button>
		</template>
	</ml-dialog>
	<ml-dialog
		title="请选择数据源"
		width="540"
		draggable
		appendToBody
		v-model="showReferenceDialogFlag"
	>
		<ReferenceSearchTable
			entity="OuterDataModel"
			refField="dataSource"
			@recordSelected="recordSelected"
		/>
	</ml-dialog>
	<!-- 引用组件 -->
	<!-- <ReferenceSearchTable
		entity="OuterDataModel"
		refField="dataSource"
		@recordSelected="recordSelected"
	/> -->
</template>
<script setup>
import { ref } from "vue";
// 引用组件
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
// 滚动条
import mlScrollbar from "@/components/mlScrollbar/index.vue";
// 消息提示
import { ElMessage } from "element-plus";
// 接口
import { queryModelField } from "@/api/plugins";


let loading = ref(false);
let isShow = ref(false);
let title = ref("");
let detailId = ref("");
let entityName = ref("");

let formData = ref({
	modelName: "1",
	dataSource: "0000065-2f1483eaf1da41efa2224cbe5c64f7af",
	dataSourceLabel: "本机3",
	isDisabled: false,
	sqlText: "SELECT * FROM t_user where userName like :name ",
});

let rules = ref({
	modelName: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
	dataSourceLabel: [
		{ required: true, message: "请选择数据源", trigger: "blur" },
	],
	isDisabled: [
		{ required: true, message: "请选择是否禁用", trigger: "blur" },
	],
	sqlText: [{ required: true, message: "请输入SQL语句", trigger: "blur" }],
});

const openDialog = (data) => {
	isShow.value = true;
	title.value = data.title;
	detailId.value = data.detailId;
	entityName.value = data.entityName;
	console.log(data, "data");
};

const cancel = () => {
	isShow.value = false;
};

const formRef = ref();
const confirm = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			// console.log(formData.value, "formData");
		}
	});
};

// 测试SQL
const testSql = () => {
	formRef.value.validate(async (valid) => {
		if (valid) {
            loading.value = true;
            let params = {
                sqlText: formData.value.sqlText,
                sourceId: formData.value.dataSource,
            }
            let res = await queryModelField(params);
            if(res && res.code == 200) {
                ElMessage.success("SQL解析成功");
            } 
            loading.value = false;
		}
	});
};

let showReferenceDialogFlag = ref(false);
const openDataSourceDialog = () => {
	showReferenceDialogFlag.value = true;
};

const recordSelected = (record) => {
	console.log(record, "record");
	formData.value.dataSource = record.id;
	formData.value.dataSourceLabel = record.label;
	showReferenceDialogFlag.value = false;
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
:deep(.el-form-item) {
	align-items: initial !important;
}
.is-required {
    color: #f56c6c;
}
</style>
