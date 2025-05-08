<template>
	<ml-dialog
		:title="title"
		v-model="isShow"
		width="560px"
		append-to-body
		body-no-padding
	>
		<div v-loading="loading">
			<div class="main-entity-search-box">
				<el-input
					v-model="mainEntitySearchValue"
					placeholder="输入关键词进行搜索..."
					clearable
					class="input-with-select"
				>
					<template #prepend>
						<el-select v-model="searchTag" style="width: 100px">
							<el-option label="全部标签" value="全部标签" />
							<el-option label="未分组" value="未分组" />
							<el-option
								v-for="(op, inx) of entityTags"
								:key="inx"
								:label="op.name"
								:value="op.name"
							/>
						</el-select>
					</template>
				</el-input>
			</div>
			<SimpleTable
				:show-pagination="false"
				:show-check-box="false"
				:table-size="'small'"
				:columns="columns"
				:show-operation-column="true"
				:data="formatTableData()"
				:height="'420px'"
			>
				<template #table_operation="{ scope }">
					<el-button
						class
						icon="el-icon-check"
						@click="selectEntity(scope.row)"
					>
						选择
					</el-button>
				</template>
			</SimpleTable>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { getEntitySet, getAllTagsOfEntity } from "@/api/system-manager";
const props = defineProps({
	title: {
		type: String,
		default: "选择实体",
	},
    filterEntityMethod: {
        type: Function,
        default: () => {},
    }
});

const emit = defineEmits(["selectEntity"]);

const isShow = ref(false);

const entityTags = ref([]);

let mainEntitySearchValue = ref("");
let searchTag = ref("全部标签");

let columns = ref([
	{ prop: "name", label: "实体名称", align: "center" },
	{
		prop: "label",
		label: "显示名称",
		align: "center",
	},
	{
		prop: "tags",
		label: "标签",
		align: "center",
	},
]);

let tableData = ref([]);
let loading = ref(false);

// 打开复制实体弹窗
const openDialog = async (type, data) => {
	isShow.value = true;
    loading.value = true;
    let resTags = await getAllTagsOfEntity();
    if(resTags && resTags.code == 200){
        entityTags.value = resTags.data.map(el => {
            return {
                name: el,
                value: el
            }
        });
    }
    if(type == 'List'){
        tableData.value = data;
        loading.value = false;
        return;
    }
	
	let res = await getEntitySet(type);
	if (res && res.code == 200) {
        tableData.value = res.data.filter(el => !el.detailEntityFlag && !el.systemEntityFlag && !el.internalEntityFlag);
	}
	loading.value = false;
};

const formatTableData = () => {
	let newData;
	if (searchTag.value == "全部标签") {
		newData = JSON.parse(JSON.stringify(tableData.value));
	} else if (searchTag.value == "未分组") {
		newData = tableData.value.filter(
			(el) => !el.tags || (el.tags && el.tags.length == 0)
		);
	} else {
		newData = tableData.value.filter(
			(el) => el.tags && el.tags.indexOf(searchTag.value) != -1
		);
	}
	return newData.filter(
		(el) =>
			el.name
				.toLowerCase()
				.indexOf(mainEntitySearchValue.value.toLowerCase()) > -1 ||
			el.label
				.toLowerCase()
				.indexOf(mainEntitySearchValue.value.toLowerCase()) > -1
	);
};

const selectEntity = (row) => {
	emit("selectEntity", row);
	closeDialog();
};

const closeDialog = () => {
	isShow.value = false;
};

defineExpose({
	openDialog,
	closeDialog,
});
</script>
<style scoped lang="scss">
.main-entity-search-box {
	padding: 0px 15px;
	padding-top: 15px;
	box-sizing: border-box;
	:deep(.input-with-select .el-input-group__prepend) {
		background-color: var(--el-fill-color-blank);
	}
}
</style>
