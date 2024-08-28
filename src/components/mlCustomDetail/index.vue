<template>
	<!-- 实体列表详情 -->
	<component v-if="comName" :is="comName" ref="DetailRef" @onConfirm="updateData"></component>
</template>

<script setup>

import { onMounted, ref } from "vue";
import { getDetailCmpByEntityName } from '@/views/custom-page/customDetailEntry.js';

// SimpleTable
const props = defineProps({
	entityName: {
		type: String,
		default: "default-detail",
	},
});

const emits = defineEmits(['updateData'])

let comName = ref("");

onMounted(()=>{
    comName.value = getDetailCmpByEntityName(props.entityName);
    if(!comName.value){
        comName.value = "default-detail";
    }
})

let DetailRef = ref();
const openDialog = (recordId, localDsv, formId) => {
    DetailRef.value?.openDialog(recordId, localDsv, formId);
}


const updateData = () => {
    emits('updateData')
}

defineExpose({
    openDialog
})
</script>
<style lang="scss" scoped></style>
