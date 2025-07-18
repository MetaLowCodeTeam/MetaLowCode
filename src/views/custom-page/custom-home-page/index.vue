<template>
	<component :is="fieldComponents[routerParamName]"></component>
</template>

<script setup>
import { onMounted, ref, markRaw } from "vue";
import { useRouter } from "vue-router";
import home1 from "./home1.vue";
import home2 from "./home2.vue";


const fieldComponents = {
	home1: markRaw(home1),
	home2: markRaw(home2),
};


const router = useRouter();
let routerParamName = ref("");

onMounted(() => {
	routerParamName.value = router.currentRoute.value.params?.pageName;
});


</script>
<style lang="scss" scoped></style>
