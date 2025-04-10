<template>
	<!-- 实体列表新建编辑 -->
	<component
		v-if="comName"
		:is="comName"
		ref="EditRef"
		:nameFieldName="nameFieldName"
		:layoutConfig="curLayoutConfig"
        :isTeam="isTeam"
        :isUser="isUser"
        :disableWidgets="disableWidgets"
        :recordNewFormId="recordNewFormId"
        :recordEditFormId="recordEditFormId"
        @onConfirm="onConfirm"
	></component>
</template>

<script setup>
import { onMounted, ref, watchEffect, nextTick } from "vue";
import { getEditCmpByEntityName } from "@/views/custom-page/customEditEntry.js";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameById } = useCommonStore();
// SimpleTable
const props = defineProps({
	entityName: {
		type: String,
		default: "default-edit",
	},
	nameFieldName: {
		type: String,
		default: "",
	},
    // 新增记录表单id
    recordNewFormId: {
		type: String,
		default: "",
	},
    // 编辑记录表单id
    recordEditFormId: {
		type: String,
		default: "",
	},
	layoutConfig: {
		type: Object,
		default: () => {},
	},
    isTeam: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    disableWidgets: { type: Array, default: () => [] },
});
const emits = defineEmits(["onConfirm"]);

let curLayoutConfig = ref("");

watchEffect(() => {
	curLayoutConfig.value = props.layoutConfig;
});

let comName = ref("");

onMounted(() => {
	// comName.value = getEditCmpByEntityName(props.entityName);
	// if (!comName.value) {
	// 	comName.value = "default-edit";
	// }
});

let EditRef = ref();
const openDialog = (e) => {
    let entityName = e.entityName;
    if(!entityName) { 
        entityName = queryEntityNameById(e.detailId);
    }
    comName.value = getEditCmpByEntityName(entityName);
	if (!comName.value) {
		comName.value = "default-edit";
	}
	nextTick(() => {
		EditRef.value?.openDialog(e);
	})
};

const onConfirm = () => {
    emits("onConfirm")
}
defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
