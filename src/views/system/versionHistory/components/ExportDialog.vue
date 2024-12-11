<template>
	<ml-dialog
		:title="title"
		v-model="isShow"
		width="550"
		:show-close="!loading"
	>
		<el-form label-width="80px" v-loading="loading">
			<el-form-item label="导出版本">
				<el-input v-model="formData.versionName" disabled />
			</el-form-item>
			<el-form-item label="开始版本">
				<el-select
					v-model="formData.beginVersion"
					placeholder="请选择开始版本"
				>
					<el-option
						v-for="item in versionList"
						:key="item.id"
						:label="item.versionName + '(' + item.version + ')' "
						:value="item.version"
					/>
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button type="primary" @click="handleExport" :loading="loading">
				确定
			</el-button>
			<el-button @click="isShow = false" :loading="loading">
				取消
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { listQuery } from "@/api/versioning";
const emit = defineEmits(["refresh"]);
let isShow = ref(false);
let title = ref("");
let formData = ref({});
let loading = ref(false);
let versionList = ref([]);

const openDialog = async (data) => {
	formData.value.endVersion = data.version;
	formData.value.versionName = data.versionName;
	isShow.value = true;
	title.value = "版本导出";
	loading.value = true;
	let res = await listQuery(
		"versioning",
		"version, versionName",
		{
			equation: "OR",
			items: [
				{
					fieldName: "version",
					value: data.version,
					op: "LT",
				},
			],
		},
		99999,
		1,
		[
			{
				fieldName: "createdOn",
				type: "DESC",
			},
		],
	);
	if (res) {
		versionList.value = res.data.dataList;
		if (res.data.dataList.length > 0) {
			formData.value.beginVersion = res.data.dataList[0].version;
		}
	}
	loading.value = false;
};

defineExpose({
	openDialog,
});

const appServe = import.meta.env.VITE_APP_BASE_API;

const handleExport = async () => {
    let { beginVersion, endVersion } = formData.value;
    let url = `${appServe}/versionHistory/exportDevelopSql?beginVersion=${beginVersion}&endVersion=${endVersion}`;
    window.open(url, "_blank");
};
</script>

<style lang="scss" scoped>
.el-form-item {
	align-items: initial;
}
</style>
