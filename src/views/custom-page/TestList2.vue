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
		<template #beforeOpenBtn>
			<el-button @click="test()">在打开按钮前</el-button>
		</template>
	</EntityList>
</template>

<script setup>
/**
 * 组件
 */
import EntityList from "@/views/customize-menu/list.vue";
import { ref, reactive, shallowRef } from "vue";

let EntityListRefs = shallowRef();

let listParamConf = ref({
	// 是否显示头部
	showHeader: true,
	// 是否显示高级查询
	showAdvancedQuery: true,
	// 是否显示快速查询
	showQuickQuery: true,
	// 是否显示打开按钮
	showOpenBtn: true,
	// 是否显示编辑按钮
	showEditBtn: true,
	// 是否显示新建按钮
	showAddBtn: true,
	// 是否显示更多按钮
	showMoreBtn: true,
});


let paginationConf = ref({});

const test = () => {
    // let row = EntityListRefs.value?.getSelectedRow()[0]
    // EntityListRefs.value.editRow(row,null,'1231231221332')
    EntityListRefs.value.openBatchUpdateDialog()
};
</script>
<style lang="scss" scoped></style>
