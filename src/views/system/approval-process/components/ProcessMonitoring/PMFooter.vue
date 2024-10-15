<template>
	<!--  -->
	<mlPagination
		:bottom="false"
		:size="pageConf.size"
		:no="pageConf.no"
		:total="pageConf.total"
		@pageChange="pageChange"
		@handleSizeChange="handleSizeChange"
		style="background: #fff"
	/>
</template>

<script setup>
import { ref, watchEffect } from "vue"

const props = defineProps({
	page: { type: Object, default: () => {} },
})

const emit = defineEmits(["pageChange", "handleSizeChange"])

let pageConf = ref({});

// 分页切换
const pageChange = (v) => {
    emit("pageChange", v);
};

const handleSizeChange = (size) => {
    emit("handleSizeChange", size);
};

watchEffect(() => {
    pageConf.value = JSON.parse(JSON.stringify(props.page));
})



</script>
<style lang="scss" scoped></style>
