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
import http from "@/utils/request";
import { useSlots, reactive, ref, onMounted, inject, nextTick } from "vue";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const props = defineProps({
    action: { type: String, default: "" },
    accept: { type: String, default: "" },
    maxSize: { type: Number, default: 10 },
    uploadUrl: { type: String, default: "" },
    skipMaxSize : {
        type: Boolean,
        default: false
    }
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
    let { accept, skipMaxSize } = props;
    // 如果有accept 不等于空就说明要检测上传类型
    if(accept) {
        // 取上传文件后缀
        let fileExtension = file.name.substring(file.name.lastIndexOf(".") + 1);
        const acceptIncludes = accept.includes(fileExtension);
        // 如果上传文件限制的类型不是 image/* 且 上传的文件后缀不在限制类型里。
        if (!acceptIncludes && accept != "image/*") {
            $ElMessage.warning("请选择" + accept + "类型");
            clearFiles();
            return false;
        }
        // 如果上传的文件指定类型 image/*  且 上传的文件的类型不包含 image
        if (accept == "image/*" && !file.type.includes("image")) {
            $ElMessage.warning("请选择" + accept + "类型");
            clearFiles();
            return false;
        }
    }
    // 如果没有跳过大小限制需要验证文件大小
    if(!skipMaxSize) {
        const maxSize = file.size / 1024 / 1024 < props.maxSize;
        if (!maxSize) {
            $ElMessage.warning(`上传文件大小不能超过 ${props.maxSize}MB!`);
            clearFiles();
            return false;
        }
    }
    
    let formData = new FormData();
   
    loading.value = true;
    let res;
    if (props.uploadUrl) {
        formData.append("file", data.file);
        res = await http.post(props.uploadUrl, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    } else {
        formData.append("uploadFile", data.file);
        res = await $API.upload.upload(formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    if (res) {
        res.data.fileSize = file.size;
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