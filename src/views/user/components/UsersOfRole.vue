<style lang="scss" scoped>
:deep(.el-table) {
	font-size: 14px;
}
</style>
<template>
	<ml-dialog v-model="isShow" title="用户列表" width="40%">
		<div v-loading="loading" element-loading-text="加载中...">
			<div class="user-list-header mb-10">
				<el-input
					v-model="search"
					placeholder="请输入用户名"
					clearable
					prefix-icon="Search"
					style="width: 300px"
				/>
				<el-button class="fr" type="primary" @click="addUser">
					添加用户
				</el-button>
			</div>
			<el-table
				:data="formatTableData(tableData)"
				style="width: 100%"
				height="400"
				:border="true"
			>
				<el-table-column prop="userName" label="用户名称" />
				<el-table-column label="操作" width="110" :align="'center'">
					<template #default="scope">
						<el-button
							type="primary"
							text
							@click="delUser(scope.row.userId)"
							icon="Delete"
						>
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</ml-dialog>
	<AddMembers
		ref="AddMembersRef"
		paramName="用户"
		paramType="User"
		isDialog
		:paramId="cutRoleId"
		@addMembers="getUserList"
	/>
</template>

<script setup>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
// API
import { getTeamMembers, delTeamMembers } from "@/api/team";
// 组件
import AddMembers from "./AddMembers.vue";

let isShow = ref(false);
let loading = ref(false);
let search = ref("");

let tableData = ref([]);

let cutRoleId = ref("");

const openDialog = (roleId) => {
	isShow.value = true;
	cutRoleId.value = roleId;
	getUserList();
};

// 获取用户列表
const getUserList = async () => {
	loading.value = true;
	let res = await getTeamMembers(cutRoleId.value);
	if (res) {
		tableData.value = res.data || [];
	}
	loading.value = false;
};

// 格式化表格数据
const formatTableData = (data) => {
	if (search.value) {
		return data.filter((item) =>
			item.userName.toLowerCase().includes(search.value.toLowerCase())
		);
	}
	return data;
};

let AddMembersRef = ref(null);
// 新建用户
const addUser = () => {
	AddMembersRef.value?.openDialog();
};
// 删除用户
const delUser = (userId) => {
	ElMessageBox.confirm("确定要删除该用户吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			loading.value = true;
            let res = await delTeamMembers(cutRoleId.value, userId);
            if(res) {
                ElMessage.success("删除成功");
                getUserList();
            }else {
                loading.value = false;
            }
		})
		.catch(() => {
			console.log("取消");
		});
};

defineExpose({
	openDialog,
});
</script>
