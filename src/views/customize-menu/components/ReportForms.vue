<template>
    <ml-dialog title="选择报表" v-model="dialogShow" width="500px" appendToBody>
        <div v-loading="loading" style="max-height: 500px;" v-if="isSupportFunc">
            <el-scrollbar>
                <el-empty v-if="reportList.length==0" :image-size="80">
                    <template #description>
                        暂无报表
                        <span
                            class="ml-a-span"
                            @click="clcikSet"
                            v-if="$TOOL.checkRole('r45-1')"
                        >点击配置</span>
                    </template>
                </el-empty>
                <div
                    class="report-item text-ellipsis"
                    v-for="(item,inx) of reportList"
                    :key="inx"
                    @click="downReport(item)"
                >
                    {{ item.reportName }}
                    <span class="down-icon">
                        <el-icon>
                            <ElIconDownload />
                        </el-icon>
                    </span>
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
const openDialog = (data) => {
    dialogShow.value = true;
    entityCode.value = data.entityCode;
    detailId.value = data.detailId;
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
    });
    if (res) {
        reportList.value = res.data || [];
    }
    loading.value = false;
};

const downReport = async (item) => {
    window.open(
        import.meta.env.VITE_APP_BASE_API +
            `/plugins/mannerReport/exportExcelTemplate?reportConfigId=${item.reportConfigId}&entityId=${detailId.value}`
    );
};

const clcikSet = () => {
    let temp = router.resolve({
        name: "TemplatesList",
    });
    window.open(
        temp.href + "?entityCode=" + entityCode.value,
        "_blank"
    );
};

defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
.report-item {
    font-size: 14px;
    height: 32px;
    line-height: 32px;
    background: #f5f5f5;
    padding-left: 20px;
    position: relative;
    cursor: pointer;
    margin-bottom: 5px;
    border-radius: 4px;
    padding-right: 30px;
    .down-icon {
        position: absolute;
        font-size: 16px;
        top: 4px;
        right: 8px;
    }
    &:hover {
        background: var(--el-color-primary);
        color: #fff;
    }
}
</style>