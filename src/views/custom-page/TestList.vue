<!--
 * @Descripttion: 自定义实体列表组件示例。
 * @version: 1.0
 * @Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/khgyptll0tom0iog
 * @Author: 邪七
 * @Date: 2024年05月28日11:30:56
 * @LastEditors: 邪七
 * @LastEditTime: 2024年05月28日11:30:56
-->
<template>
	<EntityList
		ref="EntityListRefs"
		:listConf="listParamConf"
		:paginationConf="paginationConf"
	>
		<!-- 更多插槽看 第4行 API -->
		<template #actionColumn>
			<el-table-column label="操作" width="140" :align="'center'">
				<template #default="scope">
                    <!-- 0 未提交 这里是演示，实际情况根据你自己状态判断 -->
					<el-button
						:disabled="
							scope.row.approvalStatus &&
							scope.row.approvalStatus.value !== 0
						"
						@click.stop="openSubmitApprovalDialog(scope.row)"
						link
						type="primary"
					>
						提交审批
					</el-button>
                    <!-- 1 审批中 这里是演示，实际情况根据你自己状态判断  -->
					<el-button
						@click.stop="openApprovalDialog(scope.row)"
                        :disabled="scope.row.approvalStatus && scope.row.approvalStatus.value !== 1"
						link
						type="primary"
					>
						审批
					</el-button>
				</template>
			</el-table-column>
		</template>
	</EntityList>
	<ml-dialog
		title="被引用弹框"
		width="700"
		draggable
		appendToBody
		v-model="showReferenceDialogFlag"
		bodyNoPadding
	>
		<ReferenceSearchTable
			ref="ReferenceSearchTableRefs"
			entity="Beiyinyongshiti"
			refField="beiyinyongbanji"
			showCheckBox
		/>
	</ml-dialog>
</template>

<script setup>
/**
 * 组件
 */
import EntityList from "@/views/customize-menu/list.vue";
import { ref, shallowRef } from "vue";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
let EntityListRefs = shallowRef();

let listParamConf = ref({
	// 是否显示头部
	showHeader: true,
	// 是否显示高级查询
	showAdvancedQuery: false,
	// 是否显示快速查询
	showQuickQuery: false,
	// 是否显示打开按钮
	showOpenBtn: false,
	// 是否显示编辑按钮
	showEditBtn: false,
	// 是否显示新建按钮
	showAddBtn: true,
	// 是否显示更多按钮
	showMoreBtn: true,
	// 提交审批成功回调
	submitApprovalSuccess: () => {
        console.log('提交审批成功回调')
    },
	// 审批成功回调
	approvalSuccess: () => {
        console.log('审批成功回调')
    },
});

let paginationConf = ref({});

let showReferenceDialogFlag = ref(false);

// 提交审批弹框
const openSubmitApprovalDialog = (row) => {
	// console.log(row.fuzagongzuoliuId,'row')
	EntityListRefs.value?.openSubmitApprovalDialog(row.ceshiliebiaoshenpiId);
};
// 执行审批弹框
const openApprovalDialog = (row) => {
	EntityListRefs.value?.openApprovalDialog(row.ceshiliebiaoshenpiId);
};

let ReferenceSearchTableRefs = ref();

const setReferRecord = (v, row) => {
	console.log(v, "v");
	console.log(row, "row");
};

const confirm = (v, row) => {
	console.log(v, "v");
	console.log(row, "row");
	// console.log(ReferenceSearchTableRefs.value.getIdNameField(), "getIdNameField");
	// console.log(ReferenceSearchTableRefs.value.getMultipleSelection(), "getMultipleSelection");
};
</script>
<style lang="scss" scoped></style>
