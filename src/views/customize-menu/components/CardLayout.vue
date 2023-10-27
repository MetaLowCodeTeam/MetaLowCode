<template>
    <!--  -->
    <div class="card-layout">
        <v-form-render
            v-if="layoutJson"
            ref="vFormRef"
            :option-data="optionData"
            :form-data="formData"
            :global-dsv="globalDsv"
        />
        <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
const props = defineProps({
    layoutJson: { type: String, default: "" },
    data: { type: Object, default: () => {} },
});
const vFormRef = ref();
const optionData = reactive({});
const formData = reactive();
const globalDsv = reactive({});
onMounted(() => {
    if (props.layoutJson) {
        vFormRef.value.setFormJson(props.layoutJson);
        nextTick(() => {
            vFormRef.value.setFormData(props.data);
            vFormRef.value.setReadMode();
        });
    }
});
</script>
<style lang='scss' scoped>
:deep(.el-form-item) {
    margin-bottom: 0;
}
</style>