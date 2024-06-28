<template>
	<!--  -->
	<EntityList
		v-if="entityCode"
		isReferenceComp
		:referenceEntity="myReferenceEntity"
		:listConf="listParamConf"
		:paginationConf="listPaginationConf"
	/>
	<el-empty v-else description="请先绑定明细实体" />
</template>

<script setup>
import EntityList from "@/views/customize-menu/list.vue";
import { ref, watchEffect } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { allEntityCode } = storeToRefs(useCommonStore());
const props = defineProps({
	referenceEntity: {
		type: String,
		default: "",
	},
	listConf: {
		type: Object,
		default: () => {},
	},
	paginationSize: {
		type: [Number, String],
		default: 20,
	},
});

let myReferenceEntity = ref("");
let entityCode = ref("");

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

let listPaginationConf = ref({
	size: 20,
});

watchEffect(() => {
	myReferenceEntity.value = props.referenceEntity;
	entityCode.value = allEntityCode.value[myReferenceEntity.value];
	listParamConf.value = Object.assign(listParamConf.value, props.listConf);
	listPaginationConf.value.size = props.paginationSize ?  props.paginationSize * 1 : 20;
});
</script>
<style lang="scss" scoped>
:deep(.table-footer) {
	z-index: 998 !important;
}
</style>
