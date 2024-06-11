<template>
	<!-- 实体列表详情 -->
	<component v-if="comName" :is="comName" ref="DetailRef"></component>
</template>

<script setup>

import { onMounted, ref } from "vue";
import { getDetailCmpByEntityName } from '@/views/custom-page/customEntryDetail.js';

// SimpleTable
const props = defineProps({
	entityName: {
		type: String,
		default: "default-detail",
	},
});

let comName = ref("");

onMounted(()=>{
    comName.value = getDetailCmpByEntityName(props.entityName);
    if(!comName.value){
        comName.value = "default-detail";
    }
})

let DetailRef = ref();
const openDialog = (e) => {
    DetailRef.value?.openDialog(e);
}
defineExpose({
    openDialog
})
</script>
<style lang="scss" scoped></style>
