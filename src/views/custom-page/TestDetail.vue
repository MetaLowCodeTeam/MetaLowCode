<!--
 * @Descripttion: 自定义实体详情组件示例。
 * @version: 1.0
 * @Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/nqyxilpbxch417c8?singleDoc#
 * @Author: 邪七
 * @Date: 2024年05月28日11:30:56
 * @LastEditors: 邪七
 * @LastEditTime: 2024年05月28日11:30:56
-->
<template>
	<!--  -->
	<EntityListDetail ref="EntityListDetailRefs" :detailConf="detailConf">
		<!-- 更多插槽看 第4行 API -->
		<template #processBlockPush>
			<el-button @click="test()">测试</el-button>
		</template>
	</EntityListDetail>
</template>

<script setup>
/**
 * 自定义实体详情
 */
// 1 引入详情组件
import EntityListDetail from "@/views/customize-menu/detail.vue";
// 2 定义该详情组件名称
defineOptions({
	name: "test-detail",
});
import { ref } from "vue";

let detailConf = ref({
	// 显示基础操作块
	showBasicBlock: false,
	// 显示流程操作块
	showProcessBlock: true,
	// 显示新建相关按钮
	showNewRelatedBtn: true,
	// 显示编辑按钮
	showEditBtn: true,
	// 显示更多按钮
	showMoreBtn: true,
    // 自定义弹框标题
    customDialogTitle: "我是自定义详情",
    // 提交审批前
    beforeSubmitApproval: async () => {
        console.log('测试异步');
        return true;
    },
    // 提交审批后
    afterSubmitApproval: () => {
        console.log('afterSubmitApproval')
    },
    // 撤销审批前
    beforeRevokeApproval: () => {
        console.log('beforeRevokeApproval')
        return false
    },
    // 撤销审批后
    afterRevokeApproval: () => {
        console.log('afterRevokeApproval')
    }
});


// 打开详情
let EntityListDetailRefs = ref();
const openDialog = (id) => {
	EntityListDetailRefs.value?.openDialog(id);
};

const test = () => {
    // console.log();
    EntityListDetailRefs.value?.toMoreAction('del')
    
    
}

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
