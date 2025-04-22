<template>
	<ml-dialog v-model="isShow" title="复制专属链接" width="500px">
		<el-form label-width="100px">
			<el-form-item label="PC专属链接">
				<el-input
					v-model="form.pcUrl"
					readonly
					@click="onCopyText(form.pcUrl)"
				/>
			</el-form-item>
			<el-form-item label="app专属链接">
				<el-input
					v-model="form.mobileUrl"
					readonly
					@click="onCopyText(form.mobileUrl)"
				/>
			</el-form-item>
			<el-form-item label="app二维码">
				<div class="qr-box">
					<div class="qr-code">
						<img :src="'data:image/png;base64,' + form.qrCode" />
					</div>
					<span class="ml-a-span ml-10" @click="downloadQrCode">下载二维码</span>
				</div>
			</el-form-item>
		</el-form>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { copyText, downloadBase64 } from "@/utils/util";
import http from "@/utils/request";

let isShow = ref(false);
let loading = ref(false);

let form = ref({
	pcUrl: "",
	mobileUrl: "",
	qrCode: "",
});

const openDialog = async (row) => {
	isShow.value = true;
	let appPath = import.meta.env.VITE_APP_PATH;
	let url =
		"login?tenantCode=" + row.tenantCode + "&tenantId=" + row.tenantId;
	form.value = {
		pcUrl: location.origin + appPath + url,
		mobileUrl: location.origin + "/mobile/" + url,
		qrCode: "",
	};
	loading.value = true;
	let res = await http.post("/picture/getQR", { url: form.value.mobileUrl });
	if (res && res.code == 200) {
		form.value.qrCode = res.data.qrData;
	}
	loading.value = false;
};

// 复制文本
const onCopyText = (text) => {
	copyText(text, "复制失败，请手动复制");
};

// 下载二维码
const downloadQrCode = () => {
	downloadBase64(form.value.qrCode, "二维码.png");
};

defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.qr-box {
	display: flex;
    // 文本居底
    align-items: flex-end;
	.qr-code {
		width: 200px;
		height: 200px;
		border: 1px solid #ccc;
		border-radius: 10px;
		img {
			width: 100%;
			height: 100%;
			border-radius: 10px;
		}
	}
}
</style>
