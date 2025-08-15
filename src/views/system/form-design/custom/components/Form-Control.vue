<template>
   <div>
       <el-form-item label="选择组件" class="is-required">
            <el-select v-model="formControl.component" placeholder="请选择组件" clearable filterable>
                <el-option v-for="item in controlList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
       </el-form-item>
   </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
    controlList: {
        type: Array,
        default: () => [],
    },
});

const formControl = ref({
    component: "",
});

</script>

<style scoped>
/* Styles here */
</style>