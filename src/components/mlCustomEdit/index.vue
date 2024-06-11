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
        @onConfirm="onConfirm"
	></component>
</template>

<script setup>
import { onMounted, ref, watchEffect } from "vue";
import { getEditCmpByEntityName } from "@/views/custom-page/customEntryEdit.js";

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
	comName.value = getEditCmpByEntityName(props.entityName);
	if (!comName.value) {
		comName.value = "default-edit";
	}
});

let EditRef = ref();
const openDialog = (e) => {
	EditRef.value?.openDialog(e);
};

const onConfirm = () => {
    emits("onConfirm")
}
defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
