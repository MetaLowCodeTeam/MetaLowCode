<template>
	<!--  -->
	<el-drawer
		size="45%"
		class="ml-drawer"
		v-model="detailDialog.isShow"
		direction="rtl"
		:show-close="false"
		:append-to-body="true"
		:modal-append-to-body="false"
		footer-class="drawer-footer"
	>
		<div
			class="data-transformation-detail"
			v-loading="loading"
			:element-loading-text="loadingText"
		>
			<div class="d-t-header">
				<span class="transformation-title">数据转化</span> /
				<span class="transformation-name">{{ row.transformName }}</span>
			</div>
			<div class="d-t-main">
                <el-tabs 
                    v-model="activeTab" 
                    editable
                    @tab-add="addSubTransform"
                    @tab-remove="removeTab"
                    @tab-change="tabChange"
                >
                    <el-tab-pane 
                        v-for="(tab, inx) of tabList"
                        :key="inx"
                        :label="tab.label"
                        :name="tab.name"
                    >
                        <div class="d-t-m">
                            <el-scrollbar height="100%">
                                <el-form label-width="100px">
                                    <el-form-item label="附加过滤条件" v-if="tab.name != 'transform'">
                                        <SetConditionsDialog 
                                            title="附加过滤条件"
                                            :conditionConf="tab.filter"
                                            :entityName="tab.detailEntityName"
                                            @confirm="(v) => conditionConfirm(v, tab.name)"
                                            enableSql
                                        />
                                    </el-form-item>
                                    <el-form-item class="info-form-item">
                                        <el-row :gutter="10" class="info-form-row">
                                            <el-col :span="9">
                                                {{ targetEntity.label }}
                                            </el-col>
                                            <el-col :span="9" :offset="4">
                                                {{ sourceEntity.label }}
                                            </el-col>
                                        </el-row>
                                    </el-form-item>
                                    <el-form-item label="转化字段映射">
                                        <MappingComp
                                            v-if="isFinish"
                                            v-model="tab.fieldMapping"
                                            :sourceEntity="sourceEntity"
                                            :targetEntity="tab.transformTargetEntity"
                                            title="转化字段映射"
                                            :isError="fieldMappingError"
                                            @clearError="fieldMappingError = false"
                                        />
                                    </el-form-item>
                                    <el-form-item
                                        class="info-form-item"
                                        style="margin-top: 100px"
                                    >
                                        <el-row :gutter="10" class="info-form-row">
                                            <el-col :span="9">
                                                {{ sourceEntity.label }}
                                            </el-col>
                                            <el-col :span="9" :offset="4">
                                                {{ targetEntity.label }}
                                            </el-col>
                                        </el-row>
                                    </el-form-item>
                                    <el-form-item label="回填字段映射">
                                        <MappingComp
                                            v-if="isFinish"
                                            v-model="tab.backfill"
                                            :sourceEntity="targetEntity2"
                                            :targetEntity="sourceEntity2"
                                            title="回填字段映射"
                                        />
                                        <div class="info-text mt-10">
                                            注意：回填逻辑在 自定义按钮-基于选中新建 这种前端转化中并不生效。
                                        </div>
                                    </el-form-item>
                                </el-form>
                            </el-scrollbar>
                        </div>
                    </el-tab-pane>
                </el-tabs>
			</div>
		</div>
		<ml-dialog
			v-model="notTitleDialogShow"
			width="500"
			not-header
			top="30vh"
		>
			<div class="save-success">
				<div>
					<el-icon class="save-icon" size="50">
						<ElIconWarning />
					</el-icon>
				</div>
				<div class="mt-5 save-info">保存成功</div>
				<div class="mt-20">
					<el-button @click="goDataTransformation">
						回列表
					</el-button>
					<el-button
						type="primary"
						@click="notTitleDialogShow = false"
					>
						继续编辑
					</el-button>
				</div>
			</div>
		</ml-dialog>
		<template #footer>
			<el-button @click="detailDialog.isShow = false">取消</el-button>
			<el-button type="primary" @click="onSave">
				保存
			</el-button>
		</template>
	</el-drawer>
    <Edit ref="EditRefs" isSubTransform @saveFinish="addSubTransformCallback"/>
</template>

<script setup>
import { ref } from "vue";
import { saveTransform, queryById } from "@/api/transform";

import useCommonStore from "@/store/modules/common";




/**
 * API
 */
import { queryEntityFields } from "@/api/crud";

/**
 * 组件
 */
import MappingComp from "./MappingComp.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Edit from "../Edit/index.vue";
// 条件弹框
import SetConditionsDialog from "@/components/mlSetConditions/Dialog.vue";

const { queryEntityCodeByName, queryEntityLabelByName } = useCommonStore();

let recordId = ref();

let loading = ref(false);
let loadingText = ref("数据加载中...");
let isFinish = ref(false);

// 页签
let activeTab = ref("transform");

let defaultTransformTab = ref({
    label: "主实体转化",
    name: "transform",
    fieldMapping: [],
    backfill: [],
    detailEntityName: "",
    targetEntityName: "",
    // 转化目标实体
    transformTargetEntity: null,
});

let tabList = ref([]);

let detailDialog = ref({
	isShow: false,
});

const openDetailDialog = (id) => {
	detailDialog.value.isShow = true;
    activeTab.value = 'transform';
	recordId.value = id;
	if (recordId.value) {
		queryTransformById(recordId.value);
	}
};

// 行数据
let row = ref({});
// 源实体
let sourceEntity = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});
// 目标实体
let targetEntity = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});

// 源实体
let sourceEntity2 = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});
// 目标实体
let targetEntity2 = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});


const queryTransformById = async () => {
	loading.value = true;
	loadingText.value = "数据加载中...";
	isFinish.value = false;
    tabList.value = [defaultTransformTab.value];
	let res = await queryById({
		entityId: recordId.value,
	});
	if (res) {
		row.value = res.data || {};
        if(res.data.detailTransformConfig) {
            let detailTransformConfig = JSON.parse(res.data.detailTransformConfig);
            detailTransformConfig.forEach(el => {
                let sourceLabel = queryEntityLabelByName(el.detailEntityName);
                let targetLabel = queryEntityLabelByName(el.targetEntityName);
                let tabName = 'tab' + tabList.value.length;
                let newTab = {
                    label: sourceLabel + " -> " + targetLabel,
                    name: tabName,
                    fieldMapping: el.fieldMapping,
                    backfill: el.backfill,
                    detailEntityName: el.detailEntityName,
                    targetEntityName: el.targetEntityName,
                    // 转化目标实体
                    transformTargetEntity: {},
                    filter: el.filter,
                };
                tabList.value.push(newTab);
            })
        }
		// 格式化源实体
		if (row.value.sourceEntity) {
			formatEntityData(sourceEntity, "sourceEntity");
			formatEntityData(sourceEntity2, "sourceEntity");
			let sourceRes = await queryEntityFields(
				sourceEntity.value.code,
				true,
				true,
				true,
				true,
                false,
                true
			);
			if (sourceRes) {
				sourceEntity.value.fields = sourceRes.data;
			}
			let sourceRes2 = await queryEntityFields(
				sourceEntity2.value.code,
				false,
				false,
				true,
				true
			);
			if (sourceRes2) {
				sourceEntity2.value.fields = sourceRes2.data;
			}
		}
		// 格式化目标实体
		if (row.value.targetEntity) {
			formatEntityData(targetEntity, "targetEntity");
			formatEntityData(targetEntity2, "targetEntity");
			let targetRes = await queryEntityFields(
				targetEntity.value.code,
				false,
				false,
				true,
				true
			);
			if (targetRes) {
				targetEntity.value.fields = targetRes.data;
			}
			let targetRes2 = await queryEntityFields(
				targetEntity2.value.code,
				true,
				true,
				true,
				true,
                false,
                true,
			);
			if (targetRes2) {
				targetEntity2.value.fields = targetRes2.data;
			}
		}
		// 转化字段映射
		tabList.value[0].fieldMapping = row.value.fieldMapping
			? JSON.parse(row.value.fieldMapping)
			: [];
		// 回填字段映射
		tabList.value[0].backfill = row.value.backfill
			? JSON.parse(row.value.backfill)
			: [];
        // 转化目标实体数据
        tabList.value[0].transformTargetEntity = targetEntity.value;
	}
	if (!res.data) {
		ElMessage.warning("没有查询到：" + recordId.value + " 相关的数据。");
	}
	loading.value = false;
	isFinish.value = true;
};

// 格式化实体数据
const formatEntityData = (target, key) => {
	target.value = {
		name: row.value[key],
		label: queryEntityLabelByName(row.value[key]),
		code: queryEntityCodeByName(row.value[key]),
		fields: [],
	};
};

let fieldMappingError = ref(false);
// 保存
const onSave = async () => {
    // 收集第一个有缺失必填映射的页签及字段
    let firstMissingFields = [];
    let firstMissingTabIndex = -1;

    for (let inx = 0; inx < tabList.value.length; inx++) {
        const cutTab = tabList.value[inx];
        if (cutTab.transformTargetEntity && cutTab.transformTargetEntity.fields) {
            // 必填目标字段
            const requiredTargets = cutTab.transformTargetEntity.fields.filter((el) => !el.isNullable);
            // 已映射的目标字段名
            const mappedTargets = cutTab.fieldMapping.map((el) => el.targetField);
            // 找出缺失的必填目标字段
            const missing = [];
            requiredTargets.forEach((tf) => {
                if (!mappedTargets.includes(tf.fieldName)) {
                    missing.push(tf.fieldLabel);
                }
            });
            if (missing.length > 0 && firstMissingTabIndex === -1) {
                firstMissingFields = missing;
                firstMissingTabIndex = inx;
            }
        }
    }

    if (firstMissingTabIndex !== -1) {
        // 切换至对应页签并标红
        const missTab = tabList.value[firstMissingTabIndex];
        if (activeTab.value !== missTab.name) {
            activeTab.value = missTab.name;
            await tabChange(missTab.name);
        }
        fieldMappingError.value = true;

        const content = `转化字段映射目标字段【${firstMissingFields.join("、")}】为必填字段，请确认是否不做任何映射。`;
        try {
            await ElMessageBox.confirm(content, '主实体转化', {
                confirmButtonText: '继续保存',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: false,
            });
            // 用户确认 -> 继续保存
        } catch (e) {
            // 取消
            return;
        }
    }
    let detailTransformConfig = [];
    if(tabList.value.length > 1) {
        tabList.value.forEach(el => {
            if(el.name != 'transform') {
                detailTransformConfig.push({
                    detailEntityName: el.detailEntityName,
                    targetEntityName: el.targetEntityName,
                    fieldMapping: el.fieldMapping,
                    backfill: el.backfill,
                    filter: el.filter,
                })
            }
        })
    }
	loading.value = true;
	loadingText.value = "数据保存中...";
	let res = await saveTransform(
		{
			fieldMapping: JSON.stringify(tabList.value[0].fieldMapping),
			backfill: JSON.stringify(tabList.value[0].backfill),
			isPreview: false,
            detailTransformConfig: JSON.stringify(detailTransformConfig),
		},
		{
			params: {
				recordId: recordId.value,
				entity: "Transform",
			},
		}
	);
	if (res) {
		notTitleDialogShow.value = true;
	}
	loading.value = false;
};

// 保存回调弹框
let notTitleDialogShow = ref(false);
// 返回列表
const goDataTransformation = () => {
	notTitleDialogShow.value = false;
	detailDialog.value.isShow = false;
};

/**
 * 2025-05-22 新加功能 子表转换
*/



let EditRefs = ref();


// 新建子表转换
const addSubTransform = () => {
    EditRefs.value.openDialog(
        {
            title: "新建子表转换",
            sourceEntity: row.value.sourceEntity,
            targetEntity: row.value.targetEntity,
        }
    );
}

// 添加子表回调
const addSubTransformCallback = (data) => {
    // subTransformTabs.value.push(data);
    let sourceLabel = queryEntityLabelByName(data.sourceEntity);
    let targetLabel = queryEntityLabelByName(data.targetEntity);
    let tabName = 'tab' + tabList.value.length;
    let newTab = {
        label: sourceLabel + " -> " + targetLabel,
        name: tabName,
        fieldMapping: [],
        backfill: [],
        detailEntityName: data.sourceEntity,
        targetEntityName: data.targetEntity,
        // 转化目标实体
        transformTargetEntity: null,
        filter: null,
    };
    tabList.value.push(newTab);
    activeTab.value = newTab.name;
    querySubTransform(data.sourceEntity, data.targetEntity, tabName);
}

// 加载子表字段
const querySubTransform = async (sourceEntityName, targetEntityName, tabName) => {
    formatSubEntityData(sourceEntity, sourceEntityName);
	formatSubEntityData(sourceEntity2, sourceEntityName);
    formatSubEntityData(targetEntity, targetEntityName);
	formatSubEntityData(targetEntity2, targetEntityName);
    loading.value = true;
	loadingText.value = "数据加载中...";
	isFinish.value = false;
    let sourceRes = await queryEntityFields(
        sourceEntity.value.code,
        true,
        true,
        true,
        true,
        false,
        true
    );
    if (sourceRes) {
        sourceEntity.value.fields = sourceRes.data;
    }
    let sourceRes2 = await queryEntityFields(
        sourceEntity2.value.code,
        false,
        false,
        true,
        true
    );
    if (sourceRes2) {
        sourceEntity2.value.fields = sourceRes2.data;
    }
    let targetRes = await queryEntityFields(
        targetEntity.value.code,
        false,
        false,
        true,
        true
    );
    let cutTab = tabList.value.find(el => el.name === tabName);
    if (targetRes) {
        targetEntity.value.fields = targetRes.data;
    }
    let targetRes2 = await queryEntityFields(
        targetEntity2.value.code,
        true,
        true,
        true,
        true,
        false,
        true
    );
    if (targetRes2) {
        targetEntity2.value.fields = targetRes2.data;
    }
    // 转化目标实体数据
    cutTab.transformTargetEntity = targetEntity.value;
    loading.value = false;
    isFinish.value = true;
}

// 附加过滤条件
const conditionConfirm = (v, tabName) => {
    let findTab = tabList.value.find(el => el.name === tabName);
    findTab.filter = v;
}

// 格式化子实体数据
const formatSubEntityData = (target, entityName) => {
	target.value = {
		name: entityName,
		label: queryEntityLabelByName(entityName),
		code: queryEntityCodeByName(entityName),
	};
};

// 删掉子表回填
const removeTab = (tabName) => {
    if(tabName == 'transform') {
        ElMessage.info("主实体转换不可删除")
    }else {
        let findInx = tabList.value.findIndex(el => el.name === tabName);
        tabList.value = tabList.value.filter(el => el.name !== tabName);
        activeTab.value = tabList.value[findInx - 1].name;
        if(findInx - 1 == 0) {
            querySubTransform(row.value.sourceEntity, row.value.targetEntity, tabList.value[findInx - 1].name);
        }else {
            querySubTransform(tabList.value[findInx - 1].detailEntityName, tabList.value[findInx - 1].targetEntityName, tabList.value[findInx - 1].name);
        }
    }
}

// 点击页签
const tabChange = (tab) => {
    fieldMappingError.value = false;
    if(tab == 'transform') {
        querySubTransform(row.value.sourceEntity, row.value.targetEntity, tab);
    }else {
        let findTab = tabList.value.find(el => el.name === tab);
        querySubTransform(findTab.detailEntityName, findTab.targetEntityName, tab);
    }
}

defineExpose({
	openDetailDialog,
});
</script>
<style lang="scss" scoped>
.data-transformation-detail {
	// padding: 20px;
	height: 100%;
	box-sizing: border-box;
	.d-t-header {
		height: 60px;
		line-height: 60px;
		box-sizing: border-box;
		padding: 0 20px;
		border-bottom: 1px solid #e4e7ed;
		background: #fff;
		font-size: 14px;
		color: #5e5e5e;
		.transformation-title {
			font-size: 18px;
			color: #6b6b6b;
			margin-right: 5px;
		}
		.transformation-name {
			font-weight: 700;
		}
	}
	.d-t-main {
		padding: 20px;
		height: calc(100% - 100px);
	}
	.d-t-m {
		height: 100%;
		padding: 20px 20px 0 20px;
		box-sizing: border-box;
		background: #fff;
		border-radius: 4px;
	}
	.info-form-item {
		margin-bottom: 0 !important;
		text-align: center;
		font-weight: bold;
		.info-form-row {
			width: 680px;
			font-size: 16px;
			margin-bottom: 5px;
			// border-bottom: 1px solid #e4e8eb;
		}
	}
	.el-form-item {
		align-items: initial;
	}
}
.save-success {
	text-align: center;
	.save-icon {
		color: var(--el-color-primary);
		position: relative;
		left: 12px;
	}
	.save-info {
		font-size: 13px;
		font-weight: bold;
		color: #404040;
	}
}
</style>
<style lang="scss">
.drawer-footer {
	border-top: 1px solid #e4e7ed;
	padding: 10px 20px;
}
</style>
