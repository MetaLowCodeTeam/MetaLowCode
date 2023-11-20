<template>
	<el-container>
		<el-header>
			<el-input v-model="queryText" type="text" placeholder="请输入关键词搜索"
					  @keyup.enter.native="doSearch"
			          clearable @clear="cancelSearch">
				<template #append>
					<el-button @click="doSearch">
						<el-icon>
							<Search/>
						</el-icon>
					</el-button>
				</template>
			</el-input>
		</el-header>
		<el-main>
			<SimpleTable :columns="columns" :data="tableData" :pagination="page" :show-check-box="false"
						 :height="tableHeight"
						 :show-operation-column="true"
						 @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"
						 table-size="small" table-width="100% !important">
				<template #table_operation="{scope}">
					<el-button @click="selectRecord(scope.row)">
						<el-icon>
							<Check/>
						</el-icon>
						选择
					</el-button>
				</template>
			</SimpleTable>
		</el-main>
	</el-container>
</template>

<script>
import {setColumnFormatter} from '@/utils/util'
import {refFieldQuery} from '@/api/crud'

export default {
	props: {
		entity: String,
		refField: String,
		extraFilter: String,  // 查询条件
		tableHeight: {
			type: String,
			default: '480px'
		}
	},
	name: "ReferenceSearchTable",
	data() {
		return {
			idField: null,
			nameField: null,
			queryText: '',
			columns: [],
			tableData: [],
			page: {
				pageNo: 1,
				limit: 10,
				sizes: [10, 20, 30],
				total: 0
			},
		}
	},

	mounted() {
		this.loadTableTable()
	},

	methods: {
		// 改变分页大小处理
		handleSizeChange(val) {
			this.page.limit = val
			this.loadTableTable()
		},

		// 翻页处理
		handleCurrentChange(val) {
			this.page.pageNo = val
			this.loadTableTable()
		},

		loadTableTable() {
			refFieldQuery(this.entity, this.refField, this.page.pageNo,
				this.page.limit, this.queryText, this.extraFilter).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
				} else {
					this.idField = res.data.idFieldName
					this.nameField = res.data.nameFieldName
					let columnList = res.data.columnList
					columnList.forEach(cl => {
						setColumnFormatter(cl)
					})
					this.columns = columnList
					this.tableData = res.data.dataList
					//console.log(this.tableData)
					this.page.total = res.data.pagination.total
				}
			}).catch(res => {
				this.$message({message: res.error, type: 'error'})
			})
		},

		selectRecord(row) {
			this.$emit('recordSelected', {
				'id': row[this.idField],
				'label': row[this.nameField],
			})
		},

		doSearch() {
			this.loadTableTable()
		},

		cancelSearch() {
			this.loadTableTable()
		}

	}
}
</script>

<style lang="scss" scoped>
:deep(.el-header) {
	padding: 0 12px;
}

:deep(.el-main) {
	padding: 6px;
}
</style>
