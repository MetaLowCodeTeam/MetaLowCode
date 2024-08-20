<template>
	<el-container id="commonTable">
		<el-main>
			<el-table
				ref="multipleTable"
				:data="data"
				:max-height="maxHeight"
				border
				stripe
				tooltip-effect="light"
				:style="{ width: tableWidth }"
				:header-cell-style="{ background: '#f6f8f9' }"
				@select="selects"
				@select-all="selects"
			>
				<el-table-column
					v-if="showCheckBox"
					type="selection"
					width="45"
				></el-table-column>
				<template v-for="(item, index) in columns">
					<el-table-column
						v-if="item.show !== false"
						:key="index"
						:fixed="item.fixed"
						:prop="item.prop"
						:label="item.label"
						:align="item.align ? item.align : 'center'"
						:width="item.width"
						:show-overflow-tooltip="true"
					>
						<template #default="scope">
							<FormatRow :row="scope.row" :column="item" />
						</template>
					</el-table-column>
				</template>
				<template v-if="showOperationColumn">
					<el-table-column fixed="right" label="操作" width="150">
						<template #default="scope">
							<slot name="table_operation" :scope="scope" />
						</template>
					</el-table-column>
				</template>
			</el-table>
		</el-main>

		<el-footer
			id="simpleTableFooter"
			v-if="showPagination"
			style="height: 42px; padding-top: 6px; background: white"
		>
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				style="text-align: right; margin: 0"
				:current-page="pagination.pageNo"
				:page-size="pagination.limit"
				:page-sizes="pagination.sizes"
				:total="pagination.total"
				layout="total, sizes, prev, pager, next, jumper"
			>
			</el-pagination>
		</el-footer>
	</el-container>
</template>

<script>
//TODO: 如果实体对应的数据库表已经存在数据记录，则不允许修改引用实体，防止数据错乱！！
import FormatRow from "./FormatRow.vue";
export default {
	name: "SimpleTable",
	props: {
		tableWidth: [String, Number],
		columns: Array,
		data: Array,
		showPagination: {
			type: Boolean,
			default: true,
		},
		showCheckBox: {
			type: Boolean,
			default: false,
		},
		pagination: Object,
		height: {
			type: String,
			default: "100%",
		},
		maxHeight: {
			type: Number,
			default: 2000,
		},
		tableSize: {
			type: String,
			default: "large",
		},
		showOperationColumn: {
			type: Boolean,
			default: false,
		},
		// nameField: {
		// 	type: Object,
		// 	default: () => ({ idField: "id" }),
		// },
		// defaultSelected: {
		// 	type: Object,
		// 	default: () => [],
		// },
	},
	watch: {
		// nameField:{
		//     handler(newVal) {
		//         this.$nextTick(() => {
		//             let { idField } = newVal;
		//             if(idField && this.defaultSelected.length > 0) {
		//                 this.defaultSelected.forEach(el => {
		//                     let row = this.data.find( subEl => subEl[idField] == el.id);
		//                     if(row){
		//                         this.$refs.multipleTable.toggleRowSelection(row, true)
		//                     }
		//                 })
		//             }
		//         })
		//     }
		// },
		// defaultSelected: {
		//     handler(newVal) {
		//         this.$nextTick(() => {
		//             let { idField } = this.nameField;
		//             if(idField && newVal.length > 0) {
		//                 newVal.forEach(el => {
		//                     let row = this.data.find( subEl => subEl[idField] == el.id);
		//                     if(row){
		//                         this.$refs.multipleTable.toggleRowSelection(row)
		//                     }
		//                 })
		//             }
		//         })
		//     }
		// }
	},
	components: {
		FormatRow,
	},
	methods: {
		handleSelectionChange(val) {
			this.$emit("handleSelectionChange", val);
		},
		handleSizeChange(val) {
			this.$emit("handleSizeChange", val);
		},
		handleCurrentChange(val) {
			this.$emit("handleCurrentChange", val);
		},
		selects(selection, row) {
            this.handleSelectionChange(selection)
			this.$emit("selects", selection, row);
		},
		formatterValue(row, column, cellValue) {
			return cellValue;
		},
		toggleRowSelection(rows, idField) {
            this.$nextTick(() => {
                rows.forEach((el) => {
                    let dom = this.data.filter((item) => {
                        return item[idField] == el[idField];
                    });
                    if (dom.length > 0) {
                        this.$refs.multipleTable.toggleRowSelection(dom[0], true);
                    }
                });
            })
		},
	},
};
</script>

<style lang="scss" scoped>
.el-table {
	// 解决table组件内容滚动时页面滚动条同步滚动
	overflow: auto;
	// 必须设置
	position: relative;

	:deep(.el-table__fixed-header-wrapper) thead th > .cell {
		white-space: nowrap !important; /* 禁止表头换行 */
	}

	:deep(.el-table__header-wrapper) thead th > .cell {
		white-space: nowrap !important; /* 禁止表头换行 */
	}

	:deep(.el-table__body-wrapper) {
		//height: 100% !important;
	}
}
</style>
