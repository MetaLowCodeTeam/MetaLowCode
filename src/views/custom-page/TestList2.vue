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
	<el-dialog v-model="dialogVisible">
		<div>
			<mlSelectUser v-model="list" multiple clearable :filter="filter" />
		</div>
        <div><el-button @click="save()">测试</el-button></div>
	</el-dialog>
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

let dialogVisible = ref(false);
let list = ref([
    {
        name: "张三",
        id: "0000021-1a7fc78f071e400fb780629fc137e22111"
    },
]);

let paginationConf = ref({});

let filter = ref({
    User: {
        filter: null,
        filterEasySql: 'userName like "%006%"',
    },
    Role: {
        filter: null,
        filterEasySql: 'roleName like "%Role%"',
    },
    Department: {
        filter: null,
        filterEasySql: 'departmentName like "%g%"',
    },
    Team: {
        filter: null,
        filterEasySql: 'teamName like "%1%"',
    },
})

const test = () => {
    dialogVisible.value = true;
    return
	// 参数
	let param = {
		// [编辑必传]你要编辑的行ID
		detailId: "0001001-bea445e962f04773b5cbc3deed5cb1ed",
		// ID、Name 传哪个标题就显示 编辑：(ID OR Name) 都不传则仅显示：编辑
		idFieldName: "",
		nameFieldName: "",
		// [新建必传]实体名称
		entityName: "",
		// 自定义弹框标题 > 默认的显示 编辑：(ID OR Name)
		customDialogTitle: "",
		dialogConf: {
			// 弹框是否显示全屏按钮
			showFullScreen: false,
			// 弹框是否自动全屏(默认全屏的意思)
			autoFullScreen: false,
		},
		// ...如需更多未公开的参数
		// 详见源码：src\views\customize-menu\edit.vue  openDialog方法
	};

	// 调用
	EntityListRefs.value?.editToOtherEntity(param);
	// EntityListRefs.value?.toDetail();
};

const save = () => {
    console.log(list.value,'list')
}
</script>
<style lang="scss" scoped></style>
