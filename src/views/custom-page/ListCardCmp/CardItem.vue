<template>
<!--  -->
<div class="list-card-item">
    123
</div>
</template>

<script setup>
import { ref, watchEffect } from "vue";

const props = defineProps({
    formLayout: {
        type: Object,
        default: () => {}
    },
    row: {
        type: Object,
        default: () => {}
    }
})
let curtFormLayout = ref();
watchEffect(() => {
    curtFormLayout.value = props.formLayout;
    console.log(curtFormLayout.value,'-------------');
})
</script>
<style lang='scss' scoped>
.list-card-item {
    width: 100%;
    background: #fff;
    border-radius: 4px;
    // border: 1px solid red;
    // box-sizing: border-box;
}
</style>