<style lang="scss" scoped>
.header-title {
	font-size: 16px;
}
</style>
<template>
	<ml-single-list
		:title="$t('appManager.1408')"
		:tableColumn="tableColumn"
		:sortFields="[]"
		ref="mlSingleListRef"
		queryUrl="/layout/listQuery"
		fieldsList="configName,createdOn,createdBy,modifiedOn,modifiedBy,config,shareTo"
		:fixedFilter="fixedFilter"
		fieldName="configName"
		equation="AND"
	>
		<template #addButton>
			<el-button type="primary" @click="addClick">
				<el-icon size="14">
					<ElIconPlus />
				</el-icon>
				<span class="ml-5">{{ $t('operation.2001') }}</span>
			</el-button>
		</template>
		<template #activeRow>
			<el-table-column
				:label="$t('operation.1000')"
				:align="'center'"
				width="160"
				fixed="right"
			>
				<template #default="scope">
					<el-button
						type="primary"
						link
						@click="editClick(scope.row)"
						icon="el-icon-Edit"
					>
						{{ $t('operation.3001') }}
					</el-button>
					<el-button
						type="primary"
						link
						@click="delClick(scope.row)"
						icon="el-icon-Delete"
					>
						{{ $t('operation.4000') }}
					</el-button>
				</template>
			</el-table-column>
		</template>
	</ml-single-list>
	<setMen
		v-model="setMenDialog"
		v-if="setMenDialog"
		:menuInfo="menuInfo"
		isAppManagement
        @saveSuccess="saveSuccess"
	/>
</template>
<script setup>
import { ref } from "vue";
import { t } from "@/locales";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

// API
import layoutConfig from "@/api/layoutConfig";
// 组件
import setMen from "@/layout/components/setMenu.vue";
// 数据池
import { storeToRefs } from "pinia";
import useLayoutConfigStore from "@/store/modules/layoutConfig";

const { navigationList, chosenNavigationId } = storeToRefs(
	useLayoutConfigStore()
);
const { setNavigationList } = useLayoutConfigStore();
const router = useRouter();

// 表列
let tableColumn = ref([
	{
		label: t("appManager.1500"),
		prop: "configName",
	},
	{
		label: t("appManager.1501"),
		prop: "createdOn",
	},
	{
		label: t("appManager.1502"),
		prop: "createdBy",
		formatter: (row) => {
			return row.createdBy?.name;
		},
	},
	{
		label: t("appManager.1503"),
		prop: "modifiedOn",
	},
	{
		label: t("appManager.1504"),
		prop: "modifiedBy",
		formatter: (row) => {
			return row.modifiedBy?.name;
		},
	},
]);

// 固定过滤
const fixedFilter = [
	{
		fieldName: "applyType",
		op: "EQ",
		value: "NAV",
	},
    {
		fieldName: "appAbbr",
		op: "EQ",
		value: router.currentRoute.value.query.appAbbr,
	},
];

let mlSingleListRef = ref(null);

// 设置菜单弹框
let setMenDialog = ref(false);
// 弹框需要的数据
let menuInfo = ref({});

// 添加
const addClick = () => {
	setMenDialog.value = true;
	menuInfo.value = Object.assign({}, {});
};

// 编辑
const editClick = (row) => {
	setMenDialog.value = true;
	menuInfo.value = Object.assign({}, row);
};

// 删除
const delClick = (row) => {
	ElMessageBox.confirm(t("operation.4100"), t("operation.9000"), {
		confirmButtonText: t("operation.6001"),
		cancelButtonText: t("operation.7000"),
		type: "warning",
	})
		.then(async () => {
			let res = await layoutConfig.deleteConfig(row.layoutConfigId);
			if (res) { 
				// 如果删除的是选中导航
				if (chosenNavigationId.value == row.layoutConfigId) {
					router.go(0);
                    return;
				}
				let copyList = [...navigationList.value];
                let inx = copyList.findIndex(item => item.layoutConfigId == row.layoutConfigId);
				copyList.splice(inx, 1);
				setNavigationList(copyList);
                mlSingleListRef.value.getTableList();
			}
		})
		.catch(() => {});
};

// 保存成功
const saveSuccess = () => {
	mlSingleListRef.value.getTableList();
};
</script>
