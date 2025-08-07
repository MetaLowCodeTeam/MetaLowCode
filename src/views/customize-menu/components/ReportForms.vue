<template>
	<ml-dialog title="选择报表" v-model="dialogShow" width="500px" appendToBody>
		<div v-loading="loading" style="max-height: 500px" v-if="isSupportFunc">
			<el-scrollbar>
				<el-empty v-if="reportList.length == 0" :image-size="80">
					<template #description>
						暂无报表
						<span
							class="ml-a-span"
							@click="clcikSet"
							v-if="$TOOL.checkRole('r45-1')"
							>点击配置</span
						>
					</template>
				</el-empty>
				<div
					class="report-item"
					v-for="(item, inx) of reportList"
					:key="inx"
				>
					<div class="report-label" :title="item.reportName">
                        {{ item.reportName }}
                    </div>
                    <div class="report-more">
                        <el-dropdown @command="(command) => handleCommand(command, item)">
                            <span class="ml-a-span">
                                更多 <el-icon class="icon-top-2"><ArrowDown /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="downExcel" v-if="defaultShow == 'ALL'">
                                        下载Excel
                                    </el-dropdown-item>
                                    <el-dropdown-item command="previewExcel" v-if="defaultShow == 'ALL'">
                                        预览Excel
                                    </el-dropdown-item>
                                    <el-dropdown-item command="downPdf" v-if="defaultShow == 'ALL' || defaultShow == 'PDF'">
                                        下载PDF
                                    </el-dropdown-item>
                                    <el-dropdown-item command="previewPdf" v-if="defaultShow == 'ALL' || defaultShow == 'PDF'">
                                        预览PDF
                                    </el-dropdown-item>
                                    <el-dropdown-item command="printPdf" v-if="defaultShow == 'ALL' || defaultShow == 'PDF'">
                                        打印PDF
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                    <!-- <span class="ml-a-span fr">
                        123
                    </span> -->
                    <!-- <el-tooltip content="Excel" placement="left">
                        <span class="down-icon excel" @click="downReport(item)" v-if="defaultShow == 'ALL'">
                            <SvgIcon icon-name="export-excel" style="width: 23px;height: 23px;" />
                        </span>
                    </el-tooltip>
                    <el-tooltip content="PDF" placement="right">
                        <span class="down-icon pdf" @click="downPdf(item)" v-if="defaultShow == 'ALL' || defaultShow == 'PDF'">
                            <SvgIcon icon-name="export-pdf" style="width: 22px;height: 22px;"/>
                        </span>
                    </el-tooltip> -->
				</div>
			</el-scrollbar>
		</div>
		<div v-else class="not-plugin">在线报表 插件未安装！！</div>
	</ml-dialog>
</template>

<script setup>
import { ref, inject } from "vue";
import http from "@/utils/request";
import { useRouter } from "vue-router";

import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
const router = useRouter();
const $TOOL = inject("$TOOL");
let dialogShow = ref(false);
let loading = ref(false);
let entityCode = ref("");
let detailId = ref("");
let reportList = ref([]);
let isSupportFunc = ref(false);
let defaultShow = ref("");
let multipleSelection = ref([]);
const openDialog = (data) => {
	dialogShow.value = true;
	entityCode.value = data.entityCode;
	detailId.value = data.detailId;
    defaultShow.value = data.defaultShow;
    multipleSelection.value = data.multipleSelection;
	let pluginIdList = publicSetting.value.APP_PLUGINID || [];
	if (pluginIdList.includes("mannerReport")) {
		isSupportFunc.value = true;
		getReportConfigList();
	}
};

const getReportConfigList = async () => {
	loading.value = true;
	let res = await http.get("/plugins/mannerReport/getReportConfigList", {
		entityCode: entityCode.value,
        recordId: detailId.value,
	});
	if (res) {
		reportList.value = res.data || [];
	}
	loading.value = false;
};

const handleCommand = (command, item) => {
    switch(command){
        case "downExcel":
            downReport(item)
            break;
        case "previewExcel":
            previewExcel(item)
            break;
        case "downPdf":
            downPdf(item)
            break;
        case "previewPdf":
            previewPdf(item)
            break;
        case "printPdf":
            previewPdf(item, true)
            break;
    }
}

const previewExcel = (item) => {
    // 如需浏览器新开窗口
    let url = router.resolve({
    name: "FilePreview",
    query: {
        url: `/plugins/mannerReport/exportExcelTemplate?reportConfigId=${item.reportConfigId}&entityId=${detailId.value}`,
        type: 'xlsx'
    }
    })
    window.open(url.href)
}


const previewPdf = (item, isPrint = false) => {
    // 如需浏览器新开窗口
    let url = router.resolve({ 
    name: "FilePreview",
    query: {
        url: `/plugins/mannerReport/exportPDF?reportConfigId=${item.reportConfigId}&entityId=${detailId.value}`,
        type: 'pdf',
        isPrint: isPrint
    }
    })
    window.open(url.href)
}

const downReport = async (item) => {
	window.open(
	    import.meta.env.VITE_APP_BASE_API +
        `/plugins/mannerReport/exportExcelTemplate?reportConfigId=${item.reportConfigId}&entityId=${detailId.value}`
	);
};

const downPdf = async (item, isPrint = false) => {
    if(defaultShow.value == 'PDF'){
        let res = await http.post(
            "/plugins/mannerReport/exportPdfZip?reportConfigId=" + item.reportConfigId,
            multipleSelection.value
        )
        if(res){
            item.reportJson = res.data;
            downloadApi(item)
        }
        return
    }
	window.open(
		import.meta.env.VITE_APP_BASE_API +
			`/plugins/mannerReport/exportPDF?reportConfigId=${item.reportConfigId}&entityId=${detailId.value}`
	);
};

const downloadApi = async (row) => {
	let blob = base64ToBlob(row.reportJson);
	let downloadElement = document.createElement("a");
	let href = window.URL.createObjectURL(blob);
	downloadElement.href = href;
	downloadElement.download = row.reportName + ".zip";
	document.body.appendChild(downloadElement);
	downloadElement.click();
};

const base64ToBlob = (base64) => {
	let baseContent = base64;
	let mime = baseContent.match(/:(.*?);/); //获取分割后的base64前缀中的类型
	let bstr = window.atob(baseContent);
	let n = bstr.length;
	let u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
};

const clcikSet = () => {
	let temp = router.resolve({
		name: "TemplatesList",
	});
	window.open(temp.href + "?entityCode=" + entityCode.value, "_blank");
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
.report-item {
    height: 32px;
    font-size: 14px;
    display: flex;
    background: #f5f5f5;
    margin-bottom: 5px;
    align-items: center;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 10px;
    .report-label {
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .report-more {
        width: 50px;
    }
	// font-size: 14px;
	// height: 32px;
	// line-height: 32px;
	// background: #f5f5f5;
	// padding-left: 20px;
	// // position: relative;
	// margin-bottom: 5px;
	// border-radius: 4px;
	// padding-right: 60px;
	// .down-icon {
	// 	position: absolute;
	// 	font-size: 18px;
	// 	cursor: pointer;
    //     &.excel {
    //         right: 34px;
    //     }
    //     &.pdf {
    //         right: 8px;
    //     }
	// 	&:hover {
	// 		color: var(--el-color-primary);
	// 	}
	// }
}
</style>
