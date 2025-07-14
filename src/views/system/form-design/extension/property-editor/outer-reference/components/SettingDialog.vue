<template>
	<ml-dialog
		v-model="dialogVisible"
		title="外部引用弹窗设置"
		width="760px"
		append-to-body
		:show-close="!loading"
		scrollbarMaxHeight="500px"
	>
		<el-form
			label-width="100px"
			v-loading="loading"
            :model="form"
			:rules="rules"
			ref="formRef"
		>
			<el-row>
				<el-col :span="24">
					<el-form-item label="请求路径" prop="requestUrl">
						<el-input
							v-model="form.requestUrl"
							placeholder="请输入请求路径"
							clearable
						>
							<template #append>
                                POST
								<!-- <el-select
									v-model="form.requestMethod"
									placeholder="请选择请求方式"
									style="width: 100px"
                                    disabled
								>
									<el-option label="POST" value="POST" />
									<el-option label="GET" value="GET" />
								</el-select> -->
							</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="主数据表名" prop="mainDataCode">
						<el-input
							v-model="form.mainDataCode"
							placeholder="请输入主数据表名"
							clearable
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="每页条数" prop="pageSize">
						<el-input-number
							v-model="form.pageSize"
							:min="10"
							:max="500"
							:step="10"
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="唯一字段" prop="uniqueField">
						<el-input
							v-model="form.uniqueField"
							placeholder="请输入唯一字段"
							clearable
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="排序字段" prop="sortField.fieldName">
						<el-input
							v-model="form.sortField.fieldName"
							placeholder="请输入排序字段"
							clearable
						>
							<template #append>
								<el-select
									v-model="form.sortField.type"
									placeholder="请选择排序方式"
									style="width: 100px"
								>
									<el-option label="升序" value="ASC" />
									<el-option label="降序" value="DESC" />
								</el-select>
							</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="查询字段">
						<div class="w-100 mb-5">
							<el-button
								type="primary"
								@click="addFilterField"
								plain
								icon="Plus"
								size="small"
							>
								添加
							</el-button>
						</div>
						<el-table :data="form.filterFields" :border="true">
							<el-table-column
								label="显示名称"
								prop="fieldLabel"
								:align="'center'"
							/>
							<el-table-column
								label="字段名称"
								prop="fieldName"
								:align="'center'"
							/>
							<el-table-column
								label="字段类型"
								prop="fieldType"
								:align="'center'"
							/>
							<el-table-column
								label="操作"
								width="120px"
								:align="'center'"
							>
								<template #default="scope">
									<el-button
										type="primary"
										size="small"
										@click="editField(scope.row)"
										link
									>
										编辑
									</el-button>
									<el-button
										type="primary"
										size="small"
										@click="deleteField(scope.row)"
										link
									>
										删除
									</el-button>
								</template>
							</el-table-column>
						</el-table>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<template #footer>
			<el-button @click="closeDialog" size="default" :loading="loading">
				取消
			</el-button>
			<el-button
				type="primary"
				@click="onSave"
				size="default"
				:loading="loading"
			>
				保存
			</el-button>
		</template>
	</ml-dialog>
    <!-- 添加、编辑字段 -->
    <QueryFieldDialog ref="queryFieldDialogRef" @confirm="confirmField" />
</template>

<script setup>
import { ref } from "vue";
import QueryFieldDialog from "./QueryFieldDialog.vue";

const emit = defineEmits(["confirm"]);

let dialogVisible = ref(false);
let loading = ref(false);

let form = ref({});

let rules = ref({
	requestUrl: [
		{ required: true, message: "请输入请求路径", trigger: "blur" },
	],
	mainDataCode: [
		{ required: true, message: "请输入主数据表名", trigger: "blur" },
	],
	uniqueField: [
		{ required: true, message: "请输入唯一字段名称", trigger: "blur" },
	],
	pageSize: [{ required: true, message: "请输入每页条数", trigger: "blur" }],
	sortField: {
		fieldName: [{ required: true, message: "请输入排序字段", trigger: "blur" }],
	},
});

const openDialog = (setting) => {
	dialogVisible.value = true;
	form.value = {
		...setting,
	};
	if (!form.value.requestMethod) {
		form.value.requestMethod = "GET";
	}
	if (!form.value.pageSize) {
		form.value.pageSize = 10;
	}
	if (!form.value.sortField) {
		form.value.sortField = {
			fieldName: "",
			type: "DESC",
		};
	}
    // 如果没有过滤字段，则初始化一个空数组
	if (!form.value.filterFields) {
		form.value.filterFields = [];
	}
};

const closeDialog = () => {
	dialogVisible.value = false;
};

const formRef = ref(null);
const onSave = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			console.log(form.value);
            emit("confirm", form.value);
            closeDialog();
		}
	});
};

// 添加字段弹窗
let queryFieldDialogRef = ref(null);
// 添加查询字段
const addFilterField = () => {
	queryFieldDialogRef.value.openDialog();
};

// 确认添加
const confirmField = (field) => {
	form.value.filterFields.push(field);
};
// 编辑字段
const editField = (row) => {
	queryFieldDialogRef.value.openDialog(row);
};
// 删除字段
const deleteField = (row) => {
	const index = form.value.filterFields.findIndex(item => item === row);
	if (index > -1) {
		form.value.filterFields.splice(index, 1);
	}
};
// 暴露方法
defineExpose({
	openDialog,
	closeDialog,
});
</script>

<style scoped>
/* Styles here */
</style>
