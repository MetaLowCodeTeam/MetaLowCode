<template>
	<div>
		<EntityList :listConf="listParamConf" customEntity="ProductionTas"/>
		<Gantt />
	</div>
</template>

<script setup>
import { ref } from "vue";
import EntityList from "@/views/customize-menu/list.vue";
import Gantt from "./TableGantt-Gantt.vue";
let listParamConf = ref({
	// 是否显示头部
	showHeader: true,
	// 是否显示快速查询
	showQuickQuery: false,
	// 是否显示打开按钮
	showOpenBtn: false,
	// 是否显示编辑按钮
	showEditBtn: false,
	// 是否显示新建按钮
	showAddBtn: false,
	// 是否显示更多按钮
	showMoreBtn: false,
});
</script>

<style scoped lang="scss">
:deep(.customize-menu-list) {
    padding: 10px;
    .table-box {
        height: 399px;
    }
    .table-footer.bottom {
        bottom: 12px;
        padding: 0 10px;
        background: transparent;
        border: none;
        .el-pagination {
            background: #fff
        }
    }
}
</style>
