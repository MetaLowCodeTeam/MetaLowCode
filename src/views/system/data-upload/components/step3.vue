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
                >已耗时 {{ formatTime(taskData.elapsedTime) }} · 速度{{ getSpeed(taskData.completed,taskData.elapsedTime) }}条/秒
                    <span v-if="!taskData.finish && !taskData.interrupted">
                        · 预计剩余时间 {{ getRemainingTime(taskData) }}  
                    </span>
                </div>
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
                            <span v-if="scope.row.type == 2" class="ml-a-span" @click.stop="openDetail(scope.row)">
                                新建成功
                                <span class="rt-1">
                                    <el-icon>
                                        <ElIconEdit />
                                    </el-icon>
                                </span>
                            </span>
                            <span v-if="scope.row.type == 3" class="ml-a-span" @click.stop="openDetail(scope.row)">
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
    <Detail ref="detailRefs" />
</template>

<script setup>
import { ref, onMounted, inject, reactive } from "vue";
import { ElMessageBox } from "element-plus";
import Detail from "@/views/customize-menu/detail.vue";
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
    // 获取任务状态
    getTaskState();
});

const getTaskState = async () => {
    if (taskData.interrupted) {
        return;
    }
    let res = await $API.upload.taskState(fromData.value.taskId);
    if (res) {
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
    }
};
// 获取处理速度（条/秒），保留2位小数
const getSpeed = (num, ms) => {
    if (ms <= 0 || num <= 0) return 0;  // 避免除以0或负数
    const seconds = ms / 1000;
    return parseFloat((num / seconds).toFixed(2));  // 显式转换为数字类型
};

// 格式化时间为 HH:MM:SS
const formatTime = (ms) => {
    if (ms < 1000) return "00:00:01";  // 至少显示1秒
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${zeroFill(hours)}:${zeroFill(minutes)}:${zeroFill(seconds)}`;
};

// 数字补零（私有工具函数）
const zeroFill = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
};

// 获取剩余时间（主函数）
const getRemainingTime = (taskData) => {
    const { total, completed, elapsedTime, interrupted } = taskData;
    
    // 边界条件处理
    if (interrupted || completed >= total || elapsedTime <= 0) {
        return "00:00:00";
    }

    // 计算剩余时间（数学修正版）
    const remainingItems = total - completed;
    const speed = getSpeed(completed, elapsedTime);  // 条/秒
    const remainingMs = (remainingItems / speed) * 1000;  // 正确公式

    return formatTime(remainingMs);
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
            if (res) {
                taskData.interrupted = true;
                taskData.progress = 100;
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
    if (res) {
        detailList.value = res.data;
    }
    detailLoading.value = false;
};

// 消息详情组件
let detailRefs = ref("");

const openDetail = (row) => {
    detailRefs.value.openDialog(row.recordId);
}
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
            background-color: var(--el-color-primary);
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