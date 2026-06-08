<template>
	<!-- 实体列表新建编辑 -->
	<component
		v-if="comName"
		:is="comName"
		ref="EditRef"
		:nameFieldName="nameFieldName"
        :modelName="modelName"
        :isTeam="isTeam"
        :isUser="isUser"
        :disableWidgets="disableWidgets"
        @onConfirm="onConfirm"
	></component>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import { getEditCmpByEntityName } from "@/views/custom-page/customEditEntry.js";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameById } = useCommonStore();
const props = defineProps({
	entityName: {
		type: String,
		default: "default-edit",
	},
	nameFieldName: {
		type: String,
		default: "",
	},
    modelName: {
        type: String,
        default: "",
    },
    isTeam: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    disableWidgets: { type: Array, default: () => [] },
});
const emits = defineEmits(["onConfirm"]);

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
