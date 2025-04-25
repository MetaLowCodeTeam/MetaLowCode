<template>
	<div class="reference-search-main">
		<div
			class="reference-search-table"
			v-loading="loading"
			:element-loading-text="loadingText"
		>
			<div
				class="work-flow-conditions w-100"
				v-if="referenceEntityName && showQueryPanel && !gDsv?.isExternalForm"
			>
				<mlSetConditions
					ref="mlSetConditionsRef"
					v-model="conditionConf"
					:entityName="referenceEntityName"
					notType
				>
					<template #afterAddConditions>
						<div class="fr">
							<el-dropdown
								trigger="click"
								@command="onSearch"
								class="mr-10 pt-5"
                                size="default"
							>
								<el-button type="primary" size="default">
									查询
									<el-icon class="el-icon--right">
										<arrow-down />
									</el-icon>
								</el-button>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item command="OR">
											符合任一条件
										</el-dropdown-item>
										<el-dropdown-item command="AND">
											符合全部条件
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
							<el-button type="primary" plain @click="onReset" size="default">
								重置
							</el-button>
							<el-button
								type="primary"
								plain
								@click="onSave"
								v-if="$TOOL.checkRole('r6008')"
                                size="default"
							>
								保存查询面板
							</el-button>
                            <el-button
								type="success"
								plain
								@click="onAdd"
                                size="default"
                                v-if="$TOOL.checkRole('r' + queryEntityCode(referenceEntityName) + '-2') && !isDetailEntityFlag(referenceEntityName)"
							>
								新建
							</el-button>
						</div>
					</template>
				</mlSetConditions>
			</div>
			<div class="main-table mt-10">
				<SimpleTable
					ref="SimpleTableRef"
					:columns="columns"
					:data="tableData"
					:pagination="page"
					:show-check-box="showCheckBox"
					:show-operation-column="!showCheckBox"
					:auto-column-width="true"
					@handleSizeChange="handleSizeChange"
					@handleCurrentChange="handleCurrentChange"
					table-size="default"
					table-width="100% !important"
					:maxHeight="tableHeight"
					@handleSelectionChange="handleSelectionChange"
					:defaultSelected="defaultSelected"
					:nameField="getIdNameField()"
					@selects="selects"
				>
					<template #table_operation="{ scope }">
						<el-button @click="selectRecord(scope.row)" size="default">
							<el-icon>
								<Check />
							</el-icon>
							选择
						</el-button>
					</template>
				</SimpleTable>
			</div>
		</div>
		<div class="footer-box" v-if="showMultipleSelectConfirm">
			<el-button type="primary" @click="multipleSelectRecord">
				确认选择
			</el-button>
		</div>
        <mlCustomEdit ref="editRefs" @saveFinishCallBack="loadTableTable" :nameFieldName="referenceEntityNameFieldName"/>
	</div>
    <!--  -->
</template>

<script>
import { setColumnFormatter } from "@/utils/util";
import { refFieldQuery2, saveRefFilterPanel } from "@/api/crud";
import { externalRefFieldQuery } from "@/api/external";
import useCommonStore from "@/store/modules/common";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
//
export default {
    components:{
        mlCustomEdit,
    },
	props: {
		entity: String,
		refField: String,
		extraFilter: String, // 查询条件
        extraSort: String, // 排序
		tableHeight: {
			type: Number,
			default: 480,
		},
		gDsv: Object,
		// 过滤条件
		filterConditions: {
			type: Object,
			default: () => {},
		},
		// 是否显示复选
		showCheckBox: {
			type: Boolean,
			default: false,
		},
		// 是否显示多选确认按钮
		showMultipleSelectConfirm: {
			type: Boolean,
			default: false,
		},
		// 是否显示查询条件
		showQueryPanel: {
			type: Boolean,
			default: true,
		},
		// 默认多选数据
		defaultSelected: {
			type: Array,
			default: () => [],
		},
	},
	watch: {
		refField: {
			handler(newVal) {
				this.loadTableTable();
			},
		},
	},
	name: "ReferenceSearchTable",
	data() {
		return {
			idField: null,
			nameField: null,
			queryText: "",
			columns: [],
			tableData: [],
			selectedData: [],
			page: {
				pageNo: 1,
				limit: 10,
				sizes: [10, 20, 50, 100, 200, 500],
				total: 0,
			},
			loading: false,
			loadingText: "数据加载中...",
			conditionConf: {
				equation: "AND",
				items: [],
			},
			referenceEntityName: "",
            referenceEntityNameFieldName: "",
			// 表格多选数据
			multipleSelection: [],
            notEmptyItems:[
                "NL",
                "NT",
                "SFU",
                "SFB",
                "SFD",
                "SFT",
                "YTA",
                "TDA",
                "TTA",
                "CUW",
                "CUM",
                "CUQ",
                "CUY",
                "REFD",
                "REFU",
            ],
		};
	},

	mounted() {
		this.loadTableTable("isReset");
	},

	methods: {
		/**
		 * 筛选条件方法 beg
		 */
		// 执行搜索
		onSearch(target) {
			// if (!this.$refs.mlSetConditionsRef.checkConditionList()) {
			// 	return;
			// }
			this.conditionConf.equation = target;
			this.loadTableTable();
		},
		// 重置
		onReset() {
            console.log(this.conditionConf);
			this.conditionConf.items.forEach((el) => {
				el.value = null;
				el.value2 = null;
                el.referTo = null;
                el.refLabel = null;
			});
			this.loadTableTable("isReset");
		},
		// 保存
		async onSave() {
			let saveConditionConf = JSON.parse(
				JSON.stringify(this.conditionConf)
			);
			saveConditionConf.items.forEach((el) => {
				el.value = null;
				el.value2 = null;
			});
			this.loading = true;
			let res = await saveRefFilterPanel(
				this.entity,
				this.refField,
				saveConditionConf
			);
			if (res) {
				this.$message.success("保存成功");
			}
			this.loading = false;
		},
		/**
		 * 筛选条件方法 end
		 */
		// 改变分页大小处理
		handleSizeChange(val) {
			this.page.limit = val;
			this.loadTableTable();
		},

		// 翻页处理
		handleCurrentChange(val) {
			this.page.pageNo = val;
			this.loadTableTable();
		},

		loadTableTable(type) {
			let paramStr;
			// 如果是外部表单
			if (this.gDsv?.isExternalForm) {
				paramStr = this.$route.query.externalId;
				this.refFieldQueryApi(
					externalRefFieldQuery(
						paramStr,
						this.refField,
						this.page.pageNo,
						this.page.limit,
						this.queryText,
						this.extraFilter,
						this.extraSort,
                        this.gDsv.tenantId,
					)
				);
			} else {
				paramStr = this.entity;
                let tempConditionConf = JSON.parse(JSON.stringify(this.conditionConf));
                tempConditionConf.items = tempConditionConf.items.filter(el => (el.value !== undefined && el.value !== null && el.value !== "") || (el.value2 !== undefined && el.value2 !== null && el.value2 !== "") || this.notEmptyItems.includes(el.op))
                this.refFieldQueryApi(
					refFieldQuery2(
						paramStr,
						this.refField,
						this.page.pageNo,
						this.page.limit,
						this.extraFilter,
						this.filterConditions || null,
						type == "isReset" ? null : tempConditionConf,
						this.extraSort
					)
				);
			}
		},

		async refFieldQueryApi(cb) {
			this.loading = true;
			let res = await cb;
			if (res) {
				this.idField = res.data.idFieldName;
				this.nameField = res.data.nameFieldName;
				let columnList = res.data.columnList;
				columnList.forEach((cl) => {
					setColumnFormatter(cl);
				});
				this.columns = columnList;
				this.tableData = res.data.dataList;
				if (
					this.defaultSelected &&
					this.defaultSelected.length > 0 &&
					this.selectedData &&
					this.selectedData.length < 1
				) {
					this.selectedData = this.defaultSelected.map((el) => {
						let row = {};
						row[this.idField] = el.id;
						row[this.nameField] = el.name;
						return row;
					});
				}
				if (this.selectedData.length > 0) {
					this.$refs.SimpleTableRef?.toggleRowSelection(
						this.selectedData,
						this.idField
					);
				}
				this.page.total = res.data.pagination.total;
				if (!this.referenceEntityName && res.data.filter) {
					this.conditionConf = JSON.parse(
						JSON.stringify(res.data.filter)
					);
				}
				this.referenceEntityName = res.data.entityName;
                this.referenceEntityNameFieldName = res.data.nameFieldName;
			}
			this.loading = false;
		},
		// 多选回填
		multipleSelectRecord() {
			if (this.multipleSelection.length < 1) {
				this.$message.info("还未选择数据...");
				return;
			}
			this.$emit(
				"multipleRecordSelected",
				{
					id: this.idField,
					label: this.nameField,
				},
				this.multipleSelection
			);
		},
		// 点选回填
		selectRecord(row) {
			this.$emit(
				"recordSelected",
				{
					id: row[this.idField],
					label: row[this.nameField],
				},
				row
			);
		},
		// 表格多选
		handleSelectionChange(v) {
			this.multipleSelection = v;
		},

		doSearch() {
			this.loadTableTable();
		},

		cancelSearch() {
			this.loadTableTable();
		},
		// 获取IDNAME字段
		getIdNameField() {
			return {
				idField: this.idField,
				nameField: this.nameField,
			};
		},
		// 获取所有选中数据
		getMultipleSelection() {
			return this.selectedData;
		},
		// 多选触发
		selects(selection, row) {
			if (this.selectedData.length === 0) {
				this.selectedData = selection;
			} else {
				if (this.selectedData.length > 0 && !row) {
					// 然后修改 回显数据
					// this.tableData 是所有的数据
					if (selection.length > 0) {
						//全选了
						this.tableData.forEach((item) => {
							let find = this.selectedData.find((selectedItem) => {
								return (
									selectedItem[this.idField] ==
									item[this.idField]
								);
							});
							if (!find) {
								this.selectedData.push(item);
							}
						});
					} else {
						// 仅保留当前页数据中未选中的行
						this.selectedData = this.selectedData.filter((item) => {
							// 检查当前行是否存在于当前页数据中
							let find = this.tableData.find(
								(pageItem) =>
									pageItem[this.idField] ===
									item[this.idField]
							);
							// 如果不存在，则保留该行
							return !find;
						});
					}
					return;
				} else {
					// 点击的时候有就删，没有就加
					const doms = this.selectedData.find(
						(item) => item[this.idField] === row[this.idField]
					);
					// 如果点击的行已经存在于 selectedData 中，则将其删除
					if (doms) {
						this.selectedData = this.selectedData.filter(
							(item) => item[this.idField] !== row[this.idField]
						);
					} else {
						// 如果点击的行不存在于 selectedData 中，则将其添加到 selectedData 中
						this.selectedData.push(row);
					}
				}
			}
		},
        // 新建
        onAdd() {
            this.$refs.editRefs?.openDialog({
                entityName: this.referenceEntityName,
                dialogConf: { showFullScreen: true },
            })
        },
        // 查询实体Code
        queryEntityCode(entityName){
            const { queryEntityCodeByName } = useCommonStore();
            return queryEntityCodeByName(entityName)
        },
        // 检查是否明细实体
        isDetailEntityFlag(entityName){
            const { checkDetailEntityFlag } = useCommonStore();
            return checkDetailEntityFlag(entityName)
        },
	},
};
</script>

<style lang="scss" scoped>
// :deep(.el-header) {
// 	padding: 0 12px;
// }

:deep(.el-main) {
	padding: 0px;
}

.reference-search-table {
	max-height: 600px;
	overflow-x: hidden;
	overflow-y: auto;
    :deep(.el-pagination) {
        justify-content: center;
    }
}

.footer-box {
	border-top: 1px solid #e5e5e5;
	line-height: 40px;
	padding: 0 20px;
	box-sizing: border-box;
	text-align: right;
}
</style>

<style>
.reference-dialog .el-dialog__body {
	/* padding-top: 10px !important;
	padding-bottom: 10px !important; */
	padding: 0 !important;
}
#simpleTableFooter {
	padding: 0 !important;
	margin-top: 8px;
	border-top: 0;
}

.reference-search-table .work-flow-conditions .ml-add-conditions {
	margin-top: 10px !important;
	border-bottom-width: 0 !important;
}

.reference-search-table .work-flow-conditions {
	padding-bottom: 4px !important;
	border-bottom: 1px solid #eee;
}
</style>
