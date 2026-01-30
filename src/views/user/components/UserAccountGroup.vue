<template>
	<div
		class="user-account-group"
		v-loading="loading"
		element-loading-text="加载中..."
	>
		<div class="btn-group-box">
			<el-button type="danger" @click="onExitUserGroup">
				退出账号组
			</el-button>
			<el-button type="primary" @click="openSelectUserDialog(1)" v-if="tableData.length == 0">
				绑定用户账号组
			</el-button>
            <el-button type="primary" @click="openSelectUserDialog(2)" v-else>
				账号组增加用户
			</el-button>
		</div>
		<el-table :data="tableData" style="width: 100%" border stripe>
			<el-table-column prop="userName" label="用户名称" />
			<el-table-column prop="departmentId.name" label="所属部门" />
			<el-table-column label="操作" width="100" align="center">
				<template #default="scope">
					<el-button
						type="primary"
						@click="removeUser(scope.row.userId)"
						link
						size="small"
					>
						移除
					</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
	<ml-dialog
		title="选择用户"
		v-model="selectUserDialogConfig.isShow"
		style="width: 500px"
		:show-close="!selectUserDialogConfig.loading"
	>
		<el-form-item
			label="选择用户"
			class="is-required"
			v-loading="selectUserDialogConfig.loading"
		>
			<mlSelectUser
				v-model="selectUserDialogConfig.selectedUser"
				type="User"
				clearable
				style="width: 100%"
			/>
		</el-form-item>
		<template #footer>
			<el-button
				:loading="selectUserDialogConfig.loading"
				@click="selectUserDialogConfig.isShow = false"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				:loading="selectUserDialogConfig.loading"
				@click="confirmSelectUser"
			>
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { queryGroupUserList, bindUserGroup, exitUserGroup } from "@/api/user";
import { ElMessage, ElMessageBox } from "element-plus";

const props = defineProps({
	recordData: {
		type: Object,
		default: () => ({}),
	},
	recordId: {
		type: String,
		default: "",
	},
});

const loading = ref(false);
const tableData = ref([]);

onMounted(() => {
	initTableData();
});

const initTableData = async () => {
	loading.value = true;
	const res = await queryGroupUserList(props.recordId);
	if (res?.data?.code === 200) {
		let data = res?.data?.data || [];
		tableData.value = data || [];
	}
	loading.value = false;
};

const selectUserDialogConfig = ref({
	isShow: false,
	selectedUser: [],
	loading: false,
    type: 1,
});

const openSelectUserDialog = (type) => {
	selectUserDialogConfig.value = {
		isShow: true,
		selectedUser: [],
        type: type,
	};
};

// 确认选择用户
const confirmSelectUser = async () => {
	let { selectedUser, type } = selectUserDialogConfig.value;
	if (selectedUser.length === 0) {
		ElMessage.error("请选择用户");
		return;
	}
	let selectedUserId = selectedUser[0].id;
	if (selectedUserId === props.recordId) {
		ElMessage.error("不能绑定自己");
		return;
	}
	if (tableData.value.some((item) => item.userId === selectedUserId)) {
		ElMessage.error("用户已绑定");
		return;
	}
	selectUserDialogConfig.value.loading = true;
    let res;
    if(type == 1) {
        // 绑定用户组
	    res = await bindUserGroup(props.recordId, selectedUserId);
    }else {
        // 绑定用户组
	    res = await bindUserGroup(selectedUserId, props.recordId);
    }
	
	if (res?.data?.code === 200) {
		ElMessage.success(type == 1 ? "绑定成功" : "增加成功");
		initTableData();
	}
	selectUserDialogConfig.value.loading = false;
	selectUserDialogConfig.value.isShow = false;
};

// 移除用户
const removeUser = async (userId) => {
	ElMessageBox.confirm("确认移除用户吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
            confirmExitUserGroup(userId, '移除成功');
		})
		.catch(() => {});
};

// 退出组用户
const onExitUserGroup = async () => {
	ElMessageBox.confirm("确认退出用户组吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			confirmExitUserGroup(props.recordId, '退出成功');
		})
		.catch(() => {});
};

const confirmExitUserGroup = async (userId, successMsg) => {
    loading.value = true;
    let res = await exitUserGroup(userId);
    if (res?.data?.code === 200) {
        ElMessage.success(successMsg);
        initTableData();
    }
    loading.value = false;
}

</script>

<style lang="scss" scoped>
.user-account-group {
	.btn-group-box {
		margin-bottom: 10px;
		text-align: right;
	}
}
</style>
