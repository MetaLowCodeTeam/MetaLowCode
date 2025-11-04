<template>
    <div class="price-comparison-container" v-loading="loading" element-loading-text="加载中...">
        <!-- 顶部标题 -->
        <div class="page-header" v-if="!hideTitle">
            <h2>供应商报价纵向对比表</h2>
            <div class="supplier-count">
                共找到
                <span class="ml-a-span">{{ supplierList.length }}</span>
                家供应商
            </div>
        </div>

        <!-- 对比表格 -->
        <div class="comparison-table-wrapper">
            <el-table
                :data="tableData"
                border
                style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: 'bold', padding: '15px', fontSize: '14px' }"
                :cell-style="{ padding: '15px', fontSize: '14px' }"
                v-if="!showEmpty"
            >
                <!-- 固定左侧列：产品信息维度 -->
                <el-table-column
                    prop="dimension"
                    label="产品信息维度"
                    fixed="left"
                    width="150"
                    :show-overflow-tooltip="false"
                >
                    <template #default="{ row }">
                        <span class="dimension-label">{{ row.dimension }}</span>
                    </template>
                </el-table-column>

                <!-- 动态供应商列 -->
                <el-table-column
                    v-for="(supplier, index) in supplierList"
                    :key="index"
                    :label="supplier.companyName"
                    :min-width="280"
                    align="left"
                >
                    <template #header>
                        <div class="supplier-header">
                            <div class="company-name">{{ supplier.companyName }}</div>
                            <div class="company-tags">
                                <el-tag
                                    type="success"
                                    size="small"
                                    class="tag-item"
                                >
                                    {{ supplier.supplierLevel }}
                                </el-tag>
                            </div>
                        </div>
                    </template>

                    <template #default="{ row }">
                        <div class="supplier-cell-content">
                            <!-- 产品信息 -->
                            <template v-if="row.dimension === '产品信息'">
                                <div class="product-info">
                                    <div class="product-name">{{ supplier.productName }}</div>
                                    <div class="product-sku">{{ supplier.sku }}</div>
                                    <div class="product-unit">计量单位: {{ supplier.unit }}</div>
                                </div>
                            </template>

                            <!-- 规格型号 -->
                            <template v-else-if="row.dimension === '规格型号'">
                                {{ supplier.model }}
                            </template>

                            <!-- 含税单价 -->
                            <template v-else-if="row.dimension === '含税单价(元)'">
                                <div class="price-cell">
                                    <div class="tax-inclusive-price">
                                        ¥{{ supplier.taxInclusivePrice }}
                                    </div>
                                    <div class="tax-exclusive-price">
                                        不含税:¥{{ calculateTaxExclusivePrice(supplier) }}
                                    </div>
                                </div>
                            </template>

                            <!-- 税率 -->
                            <template v-else-if="row.dimension === '税率(%)'">
                                {{ supplier.taxRate }}%
                            </template>

                            <!-- 最小起订量 -->
                            <template v-else-if="row.dimension === '最小起订量'">
                                {{ supplier.minOrderQuantity }}件
                            </template>

                            <!-- 批量折扣 -->
                            <template v-else-if="row.dimension === '批量折扣'">
                                <div class="discount-cell">
                                    {{ supplier.bulkDiscounts }}
                                </div>
                            </template>

                            <!-- 交货周期 -->
                            <template v-else-if="row.dimension === '交货周期'">
                                {{ supplier.deliveryCycle }}
                            </template>

                            <!-- 备注 -->
                            <template v-else-if="row.dimension === '备注'">
                                <div class="remarks-cell">
                                    {{ supplier.remarks }}
                                </div>
                            </template>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-else description="无供应商" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElTag } from 'element-plus';
import { queryById, crudListQuery } from "@/api/crud";
const props = defineProps({
    hideTitle: {
        type: Boolean,
        default: false,
    },
    recordId: {
        type: String,
        default: '',
    },
});
const emits = defineEmits(['loadDataFinish']);


let loading = ref(false);

onMounted(() => {
    loadData();
});

// 模拟数据
const supplierList = ref([]);

// 表格数据
const tableData = computed(() => {
    return [
        { dimension: '产品信息' },
        { dimension: '规格型号' },
        { dimension: '含税单价(元)' },
        { dimension: '税率(%)' },
        { dimension: '最小起订量' },
        { dimension: '批量折扣' },
        { dimension: '交货周期' },
        { dimension: '备注' },
    ];
});



// 计算不含税价格
const calculateTaxExclusivePrice = (supplier) => {
    const taxInclusive = parseFloat(supplier.taxInclusivePrice);
    const taxRate = supplier.taxRate / 100;
    const taxExclusive = taxInclusive / (1 + taxRate);
    return taxExclusive.toFixed(2);
};

// 获取标签类型
const getTagType = (tag) => {
    const typeMap = {
        '认证供应商': 'success',
        '长期合作': 'info',
        '新供应商': 'warning',
    };
    return typeMap[tag] || '';
};


let showEmpty = ref(false);


// 加载数据
const loadData = async () => {
    loading.value = true;
    let res = await queryById(props.recordId);
    if(res?.code == 200) {
        console.log(res.data,'res.data')
        // 指定供应商
        let selectSupplier = res.data.selectSupplier;
        // 查供应商条件
        let defaultFilter = {};
        // 如果有指定供应商
        if(selectSupplier && selectSupplier.length > 0) {
            defaultFilter = {
                equation: "OR",
                items: selectSupplier.map(item => ({
                    fieldName: "supplier",
                    op: "EQ",
                    value: item.id
                }))
            };
        }
        // 指定产品条件
        let productFilter = {
            equation: "AND",
            items: [
                // 查产品
                {
                    fieldName: "selectProduct",
                    op: "EQ",
                    value: res.data.comparisonProduct?.id
                },
                {
                    fieldName: "priceListStatus",
                    op: "EQ",
                    value: "1"
                }
            ]
        };
        let fieldsList = [
            "*",
            "supplier.supplierName",
            "supplier.supplierLevel",
            "selectProduct.productName",
            "selectProduct.productcode",
            "selectProduct.unit",
            "selectProduct.productModel",
        ];
        let listRes = await crudListQuery({
            mainEntity: "SupplierPriceList",
            fieldsList: fieldsList.join(","),
            filter: productFilter,
            defaultFilter: defaultFilter,
            pageSize: 99999,
            pageNo: 1,
            sortFields: [{ fieldName: "taxIncludedUnitPrice", type: "ASC" }]
        });
        if(listRes?.code == 200) {
            let dataList = listRes.data.dataList || [];
            supplierList.value = dataList.map(item => ({
                companyName: item['supplier.supplierName'],
                supplierLevel: item['supplier.supplierLevel']?.label,
                productName: item['selectProduct.productName'],
                sku: item['selectProduct.productcode'],
                unit: item['selectProduct.unit']?.label,
                model: item['selectProduct.productModel'],
                taxInclusivePrice: item.taxIncludedUnitPrice,
                taxRate: item.taxRate,
                minOrderQuantity: item.minimumOrderQuantity,
                bulkDiscounts: item.bulkDiscount || '-',
                deliveryCycle: item.deliveryCycle + "天",
                remarks: item.remarks || '-',
            }))
            showEmpty.value = supplierList.value.length === 0;
            emits('loadDataFinish', listRes.data)
        }
    }
    loading.value = false;
}


</script>

<style lang="scss" scoped>
.price-comparison-container {
    // padding: 0 20px;
    // background: #f5f7fa;
    box-sizing: border-box;
    // padding-top: 10px;
    .page-header {
        margin-bottom: 10px;
        display: flex;
        align-items: center;

        h2 {
            margin: 0;
            font-size: 20px;
            font-weight: bold;
            color: #303133;
            margin-right: 20px;
        }

        .supplier-count {
            color: #606266;
            font-size: 14px;
        }
    }

    .comparison-table-wrapper {
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        overflow-x: auto;
    }

    // 确保表格列宽自动调整
    :deep(.el-table) {
        table-layout: auto;
        font-size: 14px;
        
        // 统一表头和表体的padding，确保左边距一致
        .el-table__header-wrapper .el-table__cell,
        .el-table__body-wrapper .el-table__cell,
        .el-table__fixed .el-table__cell {
            padding-left: 15px !important;
            padding-right: 15px !important;
            font-size: 14px;
        }
    }

    // 供应商表头样式
    :deep(.el-table__header-wrapper) {
        .supplier-header {
            font-size: 14px;
            
            .company-name {
                font-weight: 500;
                color: #303133;
                margin-bottom: 8px;
                line-height: 1.4;
                font-size: 14px;
            }

            .company-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;

                .tag-item {
                    margin: 0;
                    font-size: 12px;
                }
            }
        }
    }

    // 固定列样式
    :deep(.el-table__fixed) {
        box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    }

    // 维度标签样式
    .dimension-label {
        font-weight: 500;
        color: #303133;
        font-size: 14px;
    }

    // 供应商单元格内容
    .supplier-cell-content {
        width: 100%;
        
        .product-info {
            .product-name {
                font-weight: 500;
                color: #303133;
                margin-bottom: 6px;
                font-size: 14px;
            }

            .product-sku,
            .product-unit {
                font-size: 14px;
                color: #909399;
                margin-bottom: 4px;
            }
        }

        .price-cell {
            .tax-inclusive-price {
                font-size: 18px;
                font-weight: bold;
                color: #f56c6c;
                margin-bottom: 6px;
            }

            .tax-exclusive-price {
                font-size: 14px;
                color: #909399;
            }
        }

        .discount-cell {
            line-height: 1.6;
            color: #606266;
            word-wrap: break-word;
            font-size: 14px;
        }

        .remarks-cell {
            line-height: 1.6;
            color: #606266;
            word-wrap: break-word;
            font-size: 14px;
        }
    }

    // 表格单元格样式
    :deep(.el-table__body-wrapper) {
        .el-table__cell {
            vertical-align: top;
        }
    }
}
</style>
