<template>
	<MlOfficePreview
		:src="query.url"
		@rendered="renderedHandler"
		@error="errorHandler"
		v-if="!publicSetting.fileOnlinePreviewPath"
	/>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import MlOfficePreview from "./Index.vue";
import { ElMessage } from "element-plus";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
const router = useRouter();
let query = ref({});
onMounted(() => {
	query.value = router.currentRoute.value.query;
	if (publicSetting.value?.fileOnlinePreviewPath && query.value.url) {
        encodeToBase64(formatSrc(query.value.url)).then(res => {
            let newUrl = res.replace(/^data:application\/octet-stream;base64,/, "");
            location.href = publicSetting.value?.fileOnlinePreviewPath + "?url=" + newUrl;
        })
	}
});
const renderedHandler = () => {
    if(query.value.isPrint){
        setTimeout(() => {
            window.print();
        }, 1000) 
    }else {
        ElMessage.success("渲染完成");
    }
};
const errorHandler = () => {
	console.log("渲染失败");
	ElMessage.error("渲染失败");
};

const formatSrc = (url) => {
    let prefix = publicSetting.value?.intranetAddress || publicSetting.value?.homeURL;
	// 如果url不是http开头，则加上 VITE_APP_BASE_API
	if (url.indexOf("http") !== 0) {
		return prefix + import.meta.env.VITE_APP_BASE_API + url;
	}
	return url;
};



const encodeToBase64 = (string) => {
	const blob = new Blob([string]);
	const reader = new FileReader();

	return new Promise((resolve, reject) => {
		reader.onloadend = () => {
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};
</script>

<style></style>
