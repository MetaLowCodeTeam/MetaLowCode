<template>
	<ml-dialog
		title="切换账号"
		v-model="isShow"
		:showClose="!loading"
		width="500px"
	>
		<div
			class="user-list-box"
			v-loading="loading"
			element-loading-text="加载中..."
		>
			<div v-for="item in userList" :key="item.id" class="user-item">
				<el-avatar :size="30">
					<mlAvatar :userId="item.userId" needTimestamp />
				</el-avatar>
				<div class="user-name">{{ item.userName }}</div>
				<el-button type="primary" size="default" @click="selectUser(item)">
					切换
				</el-button>
			</div>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { queryGroupUserList, switchUserOfAccountGroup } from "@/api/user";
import { ElMessage } from "element-plus";
const isShow = ref(false);
let loading = ref(false);
let userId = ref("");
let userList = ref([]);
const openDialog = () => {
	isShow.value = true;
	let userInfo = localStorage.getItem("USER_INFO");
	if (userInfo) {
		userInfo = JSON.parse(userInfo || "{}");
		userId.value = userInfo?.content?.userId || "";
	}
	loadUserList();
};

const closeDialog = () => {
	isShow.value = false;
};

const loadUserList = async () => {
	loading.value = true;
	let res = await queryGroupUserList(userId.value);
	if (res?.data?.code === 200) {
		let data = res?.data?.data || [];
		userList.value = data || [];
	}
	loading.value = false;
};

const selectUser = async (item) => {
	loading.value = true;
	let res = await switchUserOfAccountGroup(item.userId);
	if (res?.data?.code === 200) {
		ElMessage.success("切换成功");
		closeDialog();
        setTimeout(() => {
            window.location.href = "/";
            window.location.reload();
        }, 200);
	}
	loading.value = false;
};

defineExpose({
	openDialog,
	closeDialog,
});
</script>

<style scoped lang="scss">
.user-list-box {
	max-height: 300px;
	overflow: auto;
}
.user-item {
	display: flex;
	justify-content: flex-start;
}
.user-name {
	margin: 0 10px;
	width: calc(100% - 30px - 50px);
}
</style>
