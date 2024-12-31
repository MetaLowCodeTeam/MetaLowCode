<template>
	<el-container direction="horizontal">
		<mlSingleList
			ref="mlSingleListRef"
			title="数据转换"
			:mainEntity="tableConf.entity"
			:fieldsList="tableConf.fieldsList"
			:sortFields="tableConf.sortFields"
			fieldName="transformName"
			:tableColumn="tableConf.tableColumn"
			:filterItems="tableConf.filterItems"
			@changeSwitch="changeSwitch"
			@highlightClick="goDetail"
            queryUrl="/transform/listQuery"
            delUrl="/transform/deleteRecord"
		>
			<template #addButton>
				<el-button
					type="primary"
					@click="addRow"
					:disabled="!$TOOL.checkRole('r23-2')"
				>
					<el-icon size="14">
						<ElIconPlus />
					</el-icon>
					<span class="ml-5">新建数据转化</span>
				</el-button>
			</template>
			<template #activeRow>
				<el-table-column
					label="操作"
					:align="'center'"
					width="140"
					fixed="right"
				>
					<template #default="scope">
						<el-button
							size="small"
							type="primary"
							link
							:disabled="!$TOOL.checkRole('r23-3')"
							@click="editRow(scope.row)"
						>
							<span class="mr-3">
								<el-icon>
									<ElIconEdit />
								</el-icon>
							</span>
							<span>编辑</span>
						</el-button>
						<el-button
							size="small"
							link
							type="primary"
							:disabled="!$TOOL.checkRole('r23-4')"
							@click="deleteRow(scope.row)"
						>
							<span class="mr-3">
								<el-icon>
									<ElIconDelete />
								</el-icon>
							</span>
							<span>删除</span>
						</el-button>
					</template>
				</el-table-column>
			</template>
		</mlSingleList>
	</el-container>
	<Edit ref="EditRefs" @saveFinish="updateData"/>
</template>

<script setup>
import { inject, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
const { queryEntityLabelByName } = useCommonStore();
import { deleteRecord } from "@/api/crud";
import { ElMessage, ElMessageBox } from "element-plus";
import http from "@/utils/request";
/**
 * 组件
 */
// 新建 、 编辑
import Edit from "./Edit/index.vue";

const $TOOL = inject("$TOOL");
const Router = useRouter();

// ID字段名
const idFieldName = "transformId";

// 列表组件
let mlSingleListRef = shallowRef();

// 表格参数
let tableConf = ref({
	entity: "Transform",
	fieldsList:
		"transformName, disabled, sourceEntity, targetEntity, isPreview",
	// 默认搜索字段
	fieldName: "transformName",
	// 默认排序
	sortFields: [
		{
			fieldName: "createdOn",
			type: "DESC",
		},
	],
	// 过滤条件
	filterItems: [],
	tableColumn: [
		{
			prop: "transformName",
			label: "转化名称",
			width: "180",
			highlight: true,
			sortable: true,
		},
		{
			prop: "sourceEntity",
			label: "源实体",
            sortable: true,
			formatter: (row) => {
				return queryEntityLabelByName(row.sourceEntity);
			},
		},
		{
			prop: "targetEntity",
			label: "目标实体",
            sortable: true,
			formatter: (row) => {
				return queryEntityLabelByName(row.targetEntity);
			},
		},
		{
			prop: "disabled",
			label: "启用",
			align: "center",
			customSlot: "switch",
			isNegation: true,
			width: 80,
		},
	],
});

/**
 * ************************************************************** 列表相关增删改
 */
let EditRefs = shallowRef();
// 添加行
const addRow = () => {
	EditRefs.value?.openDialog();
};
// 编辑行
const editRow = (row) => {
	EditRefs.value?.openDialog(row);
};

// 启用开关
const changeSwitch = (row) => {
	// 保存需要的key
	let toSaveKey = [
		"transformName",
		"sourceEntity",
		"targetEntity",
		"disabled",
		"isPreview",
	];
	let saveData = {};
	toSaveKey.forEach((el) => {
		saveData[el] = row[el];
	});
	mlSingleListRef.value.loading = true;
	EditRefs.value?.doSave(row[idFieldName], saveData, "设置成功");
};
const appPath = import.meta.env.VITE_APP_PATH;
// 跳转详情
const goDetail = (row) => {
	Router.push(appPath + "data-transformation/" + row[idFieldName]);
};

// 删除行
const deleteRow = (row) => {
	ElMessageBox.confirm("是否删除该数据转换?", "删除确认")
	    .then(async () => {
            let res = await http.get("transform/deleteRecord", {
                recordId: row.transformId,
            });
            if(res){
                ElMessage.success("删除成功");
	            updateData()
            }
	    })
	    .catch(() => {
	        ElMessage.info("取消删除");
	    });
};

// 更新数据
const updateData = () => {
	mlSingleListRef.value?.getTableList();
};
</script>

<style lang="scss" scoped></style>
       