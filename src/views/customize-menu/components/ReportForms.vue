<template>
    <ml-dialog title="选择报表" v-model="dialogShow" width="500px" appendToBody>
        <div v-loading="loading" style="max-height: 500px;">
            <el-scrollbar>
                <el-empty v-if="reportList.length==0" :image-size="80">
                    <template #description>
                        暂无报表
                        <span class="ml-a-span" @click="clcikSet" v-if="$TOOL.getAuto('r45-1') == 50">点击配置</span>
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
    </ml-dialog>
</template>

<script setup>
import { reactive, ref, inject } from "vue";
import http from "@/utils/request";
import { useRouter } from "vue-router";
const router = useRouter();
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");

let dialogShow = ref(false);
let loading = ref(false);
let entityCode = ref("");
let detailId = ref("");
let reportList = ref([]);

const openDialog = (data) => {
    dialogShow.value = true;
    entityCode.value = data.entityCode;
    detailId.value = data.detailId;
    getReportConfigList();
};

const getReportConfigList = async () => {
    loading.value = true;
    let res = await http.get("/report/getReportConfigList", {
        entityCode: entityCode.value,
    });
    if (res.code == 200) {
        reportList.value = res.data || [];
    } else {
        $ElMessage.error("获取报表数据失败：" + res.error);
    }
    loading.value = false;
};

const downReport = async (item) => {
    window.open(
        `/api/report/exportExcelTemplate?reportConfigId=${item.reportConfigId}&entityId=${detailId.value}`
    );
};

const clcikSet = () => {
    let temp = router.resolve({
        name: "TemplatesList",
    });
    window.open(temp.href, "_blank");
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