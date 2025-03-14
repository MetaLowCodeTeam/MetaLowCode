<!--
 * @Descripttion: 自定义实体新建编辑组件示例。
 * @version: 1.0
 * @Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/kon80ysuog88r0um?singleDoc# 《自定义实体新建编辑PC》
 * @Author: 邪七
 * @Date: 2024年05月28日11:30:56
 * @LastEditors: 邪七
 * @LastEditTime: 2024年05月28日11:30:56
-->
<template>
	<!--  -->
	<EntityListEdit
		ref="EntityListEditRefs"
        :editConf="editConf"
        @onConfirm="onConfirm"
	>
		<!-- 更多插槽看 第4行 API -->
		<template #beforeCancelBtn>
			<el-button @click="test()">测试</el-button>
		</template>
	</EntityListEdit>
</template>

<script setup>
/**
 * 自定义实体详情
 */
// 1 引入详情组件
import EntityListEdit from "@/views/customize-menu/edit.vue";
const emits = defineEmits(["onConfirm"]);
// 2 定义该详情组件名称
defineOptions({
	name: "test-edit",
});
import { ref } from "vue";

let editConf = ref({
    // 是否显示底部
	showFooter: true,
    // 是否显示确认按钮
    showConfirmBtn: true,
    // 是否显示取消按钮
    showCancelBtn: true,
    // 自定义弹框标题
    customDialogTitle: "我是编辑标题",
});

// 打开详情
let EntityListEditRefs = ref();
const openDialog = (id) => {
	// console.log(props.);
	EntityListEditRefs.value?.openDialog(id);
};

const test = () => {
	// console.log();
	console.log(EntityListEditRefs.value?.getDataId())
    // console.log(1);
};

const onConfirm = () => {
    emits("onConfirm")
}

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
