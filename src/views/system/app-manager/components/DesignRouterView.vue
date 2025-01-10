<template>
    <div>
        {{ currentRoute.meta?.title }}
    </div>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

let currentRoute = ref({});

onMounted(() => {
    currentRoute.value = router.currentRoute.value;
});

// 监听路由变化
watch(() => router.currentRoute.value, (newVal, oldVal) => {
    currentRoute.value = newVal;
});

</script>
