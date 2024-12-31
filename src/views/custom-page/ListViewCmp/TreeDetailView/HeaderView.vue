<style scoped lang="scss">
.header-view {
	/* display: flex;
    justify-content: space-between;
    align-items: center; */
	width: 100%;
	.search-box {
		width: 240px;
		display: inline-block;
	}
	.btn-box {
		display: inline-block;
	}
}
</style>
<template>
	<div class="header-view">
		<div class="search-box" style="width: 240px">
			<el-input
				v-model="searchValue"
				placeholder="请输入搜索内容"
				clearable
				prefix-icon="Search"
                @input="handleSearch"
			/>
		</div>
		<div class="btn-box fr">
			<el-button type="primary" icon="Plus" @click="handleAdd">新建</el-button>
			<el-button type="primary" plain @click="openSettingDialog">
                设置
				<span class="icon-t1">
					<el-icon style="transform: rotate(90deg);">
						<ElIconMoreFilled />
					</el-icon>
				</span>
            </el-button>
		</div>
	</div>
	<ListSettingDialog ref="listSettingDialog" @save-success="saveSuccess" />
</template>
<script setup>
import { ref } from "vue";
import ListSettingDialog from "./ListSettingDialog.vue";

const emit = defineEmits(["onAdd", "save-success", "onSearch"]);

let searchValue = ref("");

const handleAdd = () => {
	emit("onAdd");
};

const listSettingDialog = ref();
const openSettingDialog = () => {
	listSettingDialog.value?.openSettingDialog();
};

const saveSuccess = () => {
    emit("save-success");
}

const handleSearch = () => {
    emit("onSearch", searchValue.value);
}

const handleClearSearch = () => {
    searchValue.value = "";
}

defineExpose({
    handleClearSearch
})
</script>

