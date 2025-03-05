<template>
	<ml-dialog 
        :title="title" 
        v-model="isShow" 
        appendToBody 
        width="800px"
    >
		<div v-loading="loading">

        </div>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";
let loading = ref(false);
let isShow = ref(false);
let title = ref("");
let detailId = ref("");
let entityName = ref("");

const openDialog = (data) => {
	isShow.value = true;
	title.value = data.title;
	detailId.value = data.detailId;
	entityName.value = data.entityName;
};
</script>
