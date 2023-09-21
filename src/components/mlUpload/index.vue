<template>
    <el-upload
        ref="uploaderRefs"
        :action="action"
        :accept="accept"
        :http-request="uploadFile"
        :show-file-list="false"
        v-loading="loading"
    >
        <template #trigger v-if="isShowTrigger">
            <slot name="trigger"></slot>
        </template>
    </el-upload>
</template>

<script setup>
import { useSlots, reactive, ref, onMounted, inject, nextTick } from "vue";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const props = defineProps({
    action: { type: String, default: "" },
    accept: { type: String, default: "image/gif, image/jpeg, image/png" },
    maxSize: { type: Number, default: 10 },
});
const emits = defineEmits(["on-success"]);
let uploaderRefs = ref("");
let loading = ref(false);
// 嵌入内容
let contentSlots = reactive({});
// 按钮插槽是否显示
let isShowTrigger = ref(false);

onMounted(() => {
    contentSlots = useSlots();
    if (contentSlots.trigger) {
        isShowTrigger.value = true;
    }
});

const uploadFile = async (data) => {
    let { file } = data;
    let fileExtension = file.name.substring(file.name.lastIndexOf(".") + 1);
    const acceptIncludes = props.accept.includes(fileExtension);
    if (!acceptIncludes) {
        $ElMessage.warning("请选择" + props.accept + "类型");
        clearFiles();
        return false;
    }
    const maxSize = file.size / 1024 / 1024 < props.maxSize;
    if (!maxSize) {
        $ElMessage.warning(`上传文件大小不能超过 ${props.maxSize}MB!`);
        clearFiles();
        return false;
    }
    let formData = new FormData();
    formData.append("uploadFile", data.file);
    loading.value = true;
    let res = await $API.upload.upload(formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    if (res) {
        emits("on-success", res.data);
    }
    loading.value = false;
};

// 清空
const clearFiles = () => {
    nextTick(() => {
        uploaderRefs.value.clearFiles();
    });
};
</script>
<style lang='scss' scoped>
</style>