<template>
    <!--  -->
    <div class="import-trace">
        <div class="import-content">
            <div class="title">
                <div class="fl title-left">
                    <span
                        v-if="!taskData.finish && !taskData.interrupted"
                    >正在导入...{{ taskData.completed }}/{{ taskData.total }}</span>
                    <span
                        v-if="taskData.finish && !taskData.interrupted"
                    >导入完成。共成功导入 {{ taskData.succeeded }} 条记录</span>
                    <span v-if="taskData.interrupted">导入被中止。已成功导入 {{ taskData.completed }} 条记录</span>
                </div>
                <div
                    class="fl title-right"
                >耗时 {{ forMatTime(taskData.elapsedTime) }} · 速度{{ getSpeed(taskData.completed,taskData.elapsedTime) }}条/秒 · 剩余时间 {{ remainder(taskData) }}</div>
            </div>
            <div class="import-progress">
                <div class="import-progress-bar" :style="{'width':(taskData.progress * 100) + '%'}"></div>
            </div>
            <div class="btn-box mt-15">
                <el-button v-if="taskData.finish" type="danger" style="width: 80px;" disabled>导入完成</el-button>
                <el-button
                    v-if="!taskData.finish"
                    type="danger"
                    style="width: 80px;"
                    @click="taskCancel"
                >终止导入</el-button>
                <el-button style="width: 80px;" @click="showDetail">导入详情</el-button>
                <span class="ml-a-span ml-20" @click="reset">继续导入</span>
            </div>
            <ml-dialog title="导入详情" width="500" v-model="isShowDetail">
                <el-table
                    :data="detailList"
                    style="width: 100%"
                    highlight-current-row
                    max-height="400px"
                    v-loading="detailLoading"
                >
                    <el-table-column label="行号" width="50">
                        <template #default="scope">{{ scope.row.rowNo }}</template>
                    </el-table-column>
                    <el-table-column label="状态" width="100">
                        <template #default="scope">
                            <span v-if="scope.row.type == 4" class="error-span">
                                失败
                            </span>
                            <span v-if="scope.row.type == 1" class="skip-span">
                                跳过
                            </span>
                            <span v-if="scope.row.type == 2" class="ml-a-span">
                                新建成功
                                <span class="rt-1">
                                    <el-icon>
                                        <ElIconEdit />
                                    </el-icon>
                                </span>
                            </span>
                            <span v-if="scope.row.type == 3" class="ml-a-span">
                                更新成功
                                <span class="rt-1">
                                    <el-icon>
                                        <ElIconEdit />
                                    </el-icon>
                                </span>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="详情" show-overflow-tooltip>
                        <template #default="scope">
                            <div class="text-ellipsis">{{ scope.row.message || '-'}}</div>
                        </template>
                    </el-table-column>
                </el-table>
            </ml-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, reactive } from "vue";
import { ElMessageBox } from "element-plus";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["update:modelValue", "reset"]);
// let loading = ref(false);
let fromData = ref({});
let taskData = reactive({
    completed: 0,
    total: 0,
    progress: 0,
    elapsedTime: 0,
    interrupted: false,
});
onMounted(() => {
    fromData.value = props.modelValue;
    console.log(fromData.value, "fromData.value");
    // 获取任务状态
    getTaskState();
});

const getTaskState = async () => {
    if (taskData.interrupted) {
        return;
    }
    let res = await $API.upload.taskState(fromData.value.taskId);
    if (res.code == 200) {
        taskData = Object.assign(taskData, res.data);
        if (taskData.interrupted) {
            taskData.progress = 100;
            return;
        }
        if (taskData.finish) {
            return;
        }
        setTimeout(() => {
            getTaskState();
        }, 1000);
    } else {
        $ElMessage.error("导入失败：" + res.error);
    }
};

// 获取速度
const getSpeed = (num, ms) => {
    let s = Math.floor(ms / 1000) % 60;
    if (s > 0) {
        return (num / s).toFixed(2);
    }
    return 0;
};

// 获取剩余时间
const remainder = () => {
    let { total, completed, elapsedTime, interrupted } = taskData;
    // 未完成数
    let unfinishedNum = total - completed;
    let remainderNum = unfinishedNum * getSpeed(completed, elapsedTime) * 1000;
    if (interrupted) {
        return "00:00:00";
    }
    return forMatTime(remainderNum);
};

// 格式化时间
const forMatTime = (ms) => {
    if (ms < 1000) {
        return "00:00:00";
    }
    let h = zeroFill(Math.floor(ms / (1000 * 60 * 60)) % 24);
    let m = zeroFill(Math.floor(ms / (1000 * 60)) % 60);
    let s = zeroFill(Math.floor(ms / 1000) % 60);
    return h + ":" + m + ":" + s;
};
// 补0
const zeroFill = (num) => {
    if (num < 10) {
        return "0" + num;
    } else {
        return num;
    }
};

// 中断
const taskCancel = async () => {
    ElMessageBox.confirm(
        "确认中止导入？请注意已导入的数据无法自动删除",
        "提示：",
        {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
        }
    )
        .then(async () => {
            if (taskData.finish) {
                $ElMessage.error("无法中止，因为任务已经完成");
                return;
            }

            let res = await $API.upload.taskCancel(fromData.value.taskId);
            if (res.code == 200) {
                taskData.interrupted = true;
                taskData.progress = 100;
            } else {
                $ElMessage.error("中止失败：" + res.error);
            }
        })
        .catch(() => {});
};

// 导入详情弹框是否显示
let isShowDetail = ref(false);
let detailLoading = ref(false);
let detailList = ref([]);
// 打开详情弹框
const showDetail = () => {
    isShowDetail.value = true;
    getImportDetail();
};
// 获取导入详情
const getImportDetail = async () => {
    detailLoading.value = true;
    let res = await $API.upload.importTrace(fromData.value.taskId);
    if (res.code == 200) {
        detailList.value = res.data;
    } else {
        $ElMessage.error("获取导入详情数据失败：" + res.error);
    }
    detailLoading.value = false;
};

const test = (scope) => {
    console.log(scope, "scope");
};
// 继续导入
const reset = () => {
    emits("reset");
};
</script>
<style lang='scss' scoped>
.import-content {
    width: 60%;
    margin: 0 auto;
    margin-top: 10px;
    .title {
        height: 24px;
        line-height: 24px;
        margin-bottom: 10px;
        & > div {
            width: 50%;
            font-size: 13px;
        }
        .title-left {
            color: #404040;
            font-weight: bold;
        }
        .title-right {
            text-align: right;
            color: #878787;
        }
    }
    .import-progress {
        height: 22px;
        box-shadow: none;
        overflow: hidden;
        font-size: 0.9231rem;
        background-color: #f5f5f5;
        border-radius: 2px;
        .import-progress-bar {
            transition: width 1s linear;
            box-shadow: none;
            height: 22px;
            background-color: #4285f4;
        }
    }
    .error-span {
        color: #ea4335;
    }
    .skip-span {
        color: #6c757d;
    }
    .el-table {
        font-size: 13px;
    }
    .rt-1 {
        position: relative;
        top: 2px;
    }
}
</style>