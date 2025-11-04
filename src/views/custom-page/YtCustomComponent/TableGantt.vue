<template>
    <div class="workshop-plan-scheduling">
        <!-- 顶部标题 -->
        <div class="page-title">
            <h2>车间计划排程查看界面</h2>
        </div>

        <!-- 搜索筛选区域 -->
        <div class="search-filter-section">
            <el-form :model="searchForm" :inline="true" label-width="120px" class="search-form">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="生产订单号">
                            <el-input
                                v-model="searchForm.productionOrderNo"
                                placeholder="请输入生产订单号"
                                clearable
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="销售订单号">
                            <el-input
                                v-model="searchForm.salesOrderNo"
                                placeholder="请输入销售订单号"
                                clearable
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="车间">
                            <el-select
                                v-model="searchForm.workshop"
                                placeholder="请选择车间"
                                clearable
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="班组">
                            <el-select
                                v-model="searchForm.team"
                                placeholder="请选择班组"
                                clearable
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="设备">
                            <el-select
                                v-model="searchForm.equipment"
                                placeholder="请选择设备"
                                clearable
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="开始/结束日期">
                            <el-date-picker
                                v-model="searchForm.dateRange"
                                type="daterange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                placeholder="请选择开始结束日!"
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="24" class="button-group">
                        <el-button @click="handleSearch">查询</el-button>
                        <el-button @click="handleReset">重置</el-button>
                        <el-button type="primary">物料已齐套</el-button>
                        <el-button type="warning">延误订单</el-button>
                        <el-button type="success">调整计划</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </div>

        <!-- 生产订单列表表格 -->
        <div class="order-table-section">
            <el-table
                :data="orderTableData"
                border
                stripe
                style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
            >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="productionOrderNo" label="生产订单号" align="center" />
                <el-table-column prop="productCode" label="产品编码" align="center" />
                <el-table-column prop="productName" label="产品名称" align="center" />
                <el-table-column prop="plannedQuantity" label="计划数量" width="100" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="startDate" label="开始日期" width="120" align="center" />
                <el-table-column prop="endDate" label="结束日期" width="120" align="center" />
                <el-table-column prop="qualifiedQuantity" label="合格品数量" width="120" align="center" />
                <el-table-column label="操作" width="100" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" link @click="handleAdjust(row)">
                            调整
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 计划明细区域 -->
        <div class="plan-details-section">
            <div class="section-title">
                <h3>计划明细</h3>
            </div>
            <div class="gantt-container">
                <!-- 甘特图区域 - 预留，等待其他组件 -->
                <!-- 这里可以放置您的甘特图组件 -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// 搜索表单数据
const searchForm = reactive({
    productionOrderNo: '',
    salesOrderNo: '',
    workshop: '',
    team: '',
    equipment: '',
    dateRange: null,
});

// 生产订单列表数据
const orderTableData = ref([
    {
        productionOrderNo: 'WO101',
        productCode: 'P001',
        productName: '产品A',
        plannedQuantity: 100,
        status: '生产中',
        startDate: '2025-10-11',
        endDate: '2025-10-14',
        qualifiedQuantity: 98,
    },
    {
        productionOrderNo: 'WO201',
        productCode: 'P002',
        productName: '产品B',
        plannedQuantity: 100,
        status: '生产中',
        startDate: '2025-10-11',
        endDate: '2025-10-13',
        qualifiedQuantity: 100,
    },
    {
        productionOrderNo: 'WO301',
        productCode: 'P003',
        productName: '产品C',
        plannedQuantity: 0,
        status: '未开始',
        startDate: '',
        endDate: '',
        qualifiedQuantity: 0,
    },
]);

// 获取状态标签类型
const getStatusType = (status) => {
    const statusMap = {
        '生产中': 'success',
        '未开始': 'info',
        '已完成': '',
        '已暂停': 'warning',
    };
    return statusMap[status] || 'info';
};

// 查询
const handleSearch = () => {
    console.log('查询条件:', searchForm);
    // TODO: 实现查询逻辑
};

// 重置
const handleReset = () => {
    Object.assign(searchForm, {
        productionOrderNo: '',
        salesOrderNo: '',
        workshop: '',
        team: '',
        equipment: '',
        dateRange: null,
    });
};

// 调整计划
const handleAdjust = (row) => {
    console.log('调整订单:', row);
    // TODO: 实现调整逻辑
};
</script>

<style lang="scss" scoped>
.workshop-plan-scheduling {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100vh;

    .page-title {
        margin-bottom: 20px;
        h2 {
            margin: 0;
            font-size: 20px;
            font-weight: bold;
            color: #303133;
        }
    }

    .search-filter-section {
        background: #fff;
        padding: 20px;
        border-radius: 4px;
        margin-bottom: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .search-form {
            .el-form-item {
                margin-bottom: 15px;
                width: 100%;
            }

            :deep(.el-form-item__content) {
                width: 100%;
            }

            :deep(.el-select),
            :deep(.el-input),
            :deep(.el-date-editor) {
                width: 100% !important;
            }

            .button-group {
                text-align: right;
                margin-top: 10px;

                .el-button {
                    margin-left: 10px;
                }
            }
        }
    }

    .order-table-section {
        background: #fff;
        padding: 20px;
        border-radius: 4px;
        margin-bottom: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .plan-details-section {
        background: #fff;
        padding: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .section-title {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e4e7ed;

            h3 {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
                color: #303133;
            }
        }

        .gantt-container {
            min-height: 400px;
            // 甘特图容器样式，等待组件填充
        }
    }
}
</style>
