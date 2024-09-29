<style lang="scss" scoped>
.main-header {
	height: 32px;
	line-height: 32px;
	margin-bottom: 10px;
	.main-search-icon {
		position: absolute;
		display: flex;
		align-items: center;
		align-content: center;
		width: 100%;
		height: 100%;
		cursor: pointer;
		top: 0;
		left: 0;
		.el-icon {
			width: 100%;
		}
	}
	.el-dropdown-link {
		display: inline-block;
		height: 32px;
		line-height: 32px;
		margin-right: 5px;
	}
}
.el-dropdown {
	cursor: pointer;
}
.main-body {
	display: flex;
	height: 580px;

	&.is-fold {
		.main-tree {
			width: 40px;
		}
		.main-table {
			width: calc(100% - 40px);
		}
	}
	&.is-expand {
		.main-tree {
			width: 200px;
		}
		.main-table {
			width: calc(100% - 200px);
		}
	}
	&.not-tree {
		.main-table {
			width: 100%;
		}
	}
	.main-tree {
		height: 621px;
		border: 1px solid #ebeef5;
		border-right: 0;
		position: relative;
		transition: all 0.3s;
		overflow: auto;
		.fold-icon {
			position: absolute;
			right: 10px;
			top: 4px;
			line-height: 32px;
			z-index: 9999;
			cursor: pointer;
		}
	}
	.main-table {
		// flex-grow: 1;
	}
	:deep(.el-tree-node) {
		position: relative;
	}
    :deep(.el-table .cell) {
        font-size: 13px;
    }
	.custom-tree-node {
		//
		.action-button {
			position: absolute;
			right: 0;
			background: #fff;
			border-radius: 4px;
			padding: 0 5px;
		}
	}
}
</style>

<template>
	<!--  -->
	<div
		class="ml-attachment-comp"
		v-loading="comLoading"
		element-loading-text="加载数据中..."
	>
		<div class="main-header">
			<el-input
				v-model="searchValue"
				placeholder="文件名称搜索"
				style="width: 300px"
			>
				<template #append>
					<span class="main-search-icon" @click="getTableList">
						<el-icon>
							<ElIconSearch />
						</el-icon>
					</span>
				</template>
			</el-input>
			<div class="fr fr-box">
				<el-dropdown
					class="mr-20"
					trigger="click"
					@command="sortCommand"
				>
					<span class="el-dropdown-link">
						{{ sortText }}
						<el-icon class="el-icon--right">
							<arrow-down />
						</el-icon>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="modifiedOnDesc">
								最近修改时间
							</el-dropdown-item>
							<el-dropdown-item command="createdOnDesc">
								最近创建时间
							</el-dropdown-item>
							<el-dropdown-item command="createdOnAsc">
								最早创建时间
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
				<el-dropdown
					split-button
					type="primary"
					@click="openDialog('file')"
					@command="command"
					v-if="$TOOL.checkRole('r6000')"
				>
					<span class="mr-5">
						<el-icon>
							<Upload />
						</el-icon>
					</span>
					上传文件
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="directory">
								新建目录
							</el-dropdown-item>
							<el-dropdown-item command="edit">
								编辑选中目录
							</el-dropdown-item>
							<el-dropdown-item command="del">
								删除选中目录
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
				<el-button v-else type="primary" @click="openDialog('file')">
					<span class="mr-5">
						<el-icon>
							<Upload />
						</el-icon>
					</span>
					上传文件
				</el-button>
			</div>
		</div>
		<div
			class="main-body"
			:class="{
				'is-fold': isFold,
				'is-expand': !isFold,
				'not-tree': !hasTree,
			}"
		>
			<div class="main-tree" v-if="hasTree">
				<span class="fold-icon" @click="isFold = !isFold">
					<el-icon size="18" v-if="!isFold"><Fold /></el-icon>
					<el-icon size="18" v-else><Expand /></el-icon>
				</span>
				<el-tree
					:data="dirList"
					:props="defaultProps"
					@node-click="handleNodeClick"
					highlight-current
					:expand-on-click-node="false"
                    :current-node-key="fileDirectory"
					default-expand-all
                    ref="treeRef"
                    node-key="value"
				/>
			</div>
			<div class="main-table">
				<el-table :data="tableData" :border="true" height="100%">
					<el-table-column
						v-for="(column, inx) of tableColumns"
						:key="inx"
						:label="column.label"
						:width="column.width"
                        :align="column.align"
					>
						<template #default="scope">
							<div v-if="column.formatter">
								{{ column.formatter(scope.row) }}
							</div>
							<div v-else>
                                {{ scope.row[column.prop] }}
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" :align="'center'" width="160px">
						<template #default="scope">
							<el-button
                                link
                                type="primary"
								@click="openDialog('file', scope.row)"
								v-if="$TOOL.checkRole('r6000')"
							>
								编辑
							</el-button>
							<el-button 
                                link  
                                type="primary"
                                @click="delAttachment(scope.row.attachmentId, scope.row.fileName)"
                            > 
                                删除 
                            </el-button>
                            <el-button
                                link
                                type="primary"
								@click="downFile(scope.row)"
							>
								下载
							</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="list-card-footer">
					<mlPagination
						:bottom="false"
						:no="pageConf.pageNo"
						:size="pageConf.pageSize"
						:total="pageConf.total"
						@pageChange="pageChange"
						@handleSizeChange="handleSizeChange"
						style="background: #fff"
					/>
				</div>
			</div>
		</div>
	</div>

	<OperateDialog ref="OperateDialogRef" @onSuccess="loadDirList" />
</template>

<script setup>
import { inject, nextTick, onMounted, ref } from "vue";
/**
 * API
 */
import { 
    queryAttachmentDirectory, 
    queryAttachmentFile,
    deleteAttachment
} from "@/api/attach";
/**
 * 组件
 */
import OperateDialog from "./OperateDialog.vue";
import { formatFileSize } from "@/utils/util";
import { ElMessage, ElMessageBox } from "element-plus";

const $TOOL = inject("$TOOL");

const props = defineProps({
	// 主实体 Code
	entityCode: { type: [String, Number], default: "" },
	// 记录Id
	recordId: { type: String, default: "" },
});
onMounted(() => {
	// console.log("测试触发");
	loadDirList();
});

// 文件名称搜索
let searchValue = ref("");

/**
 * 排序相关 ******************************************************************
 */

// 卡片视图排序
let sortText = ref("默认排序");
let sortFields = ref("modifiedOn desc");
const sortCommand = (e) => {
	if (e == "modifiedOnDesc") {
		sortFields.value = "modifiedOn desc";
		sortText.value = "最近修改时间";
	}
	if (e == "createdOnDesc") {
		sortFields.value = "createdOn desc";
		sortText.value = "最近创建时间";
	}
	if (e == "createdOnAsc") {
		sortFields.value = "createdOn asc";
		sortText.value = "最早创建时间";
	}
	getTableList();
};

let comLoading = ref(false);

/**
 * 树相关    ******************************************************************
 */
// 是否折叠
let isFold = ref(false);
// 是否有树
let hasTree = ref(false);
// 目录数据
let dirList = ref([]);
let treeRef = ref();
// 指定目录 value(id)
let fileDirectory = ref(null);
let curtNode = ref(null);
const defaultProps = {
	children: "children",
	label: "label",
};

// 树节点点击
const handleNodeClick = (node) => {
	if (fileDirectory.value != node.value) {
		fileDirectory.value = node.value;
		curtNode.value = node;
		getTableList();
	}
};

// 加载目录列表
const loadDirList = async (notNeedLoadTable) => {
	comLoading.value = true;
	hasTree.value = false;
	let res = await queryAttachmentDirectory(props.entityCode);
	if (res) {
		dirList.value = [res.data] || [];
		if (res.data.children.length > 0) {
			hasTree.value = true;
		}
		// 如果不需要加载表格数据
		if (notNeedLoadTable) {
			comLoading.value = false;
		}
		// 需要加载表格数据
		else {
			comLoading.value = false;
			getTableList();
		}
        if(curtNode.value && hasTree.value) {
            nextTick(()=>{
                fileDirectory.value = curtNode.value.value;
                treeRef.value.setCurrentKey(curtNode.value.value);
            })
           
        }
	} else {
		comLoading.value = false;
	}
};

/**
 * 表格相关    ******************************************************************
 */
let tableData = ref([
	{
		name: "test.rar",
	},
]);
const tableColumns = [
	{
		label: "文件名称",
		prop: "fileName",
	},
	{
		label: "文件大小",
		prop: "fileSize",
		width: 120,
		formatter: (row) => {
			return formatFileSize(row.fileSize || 0);
		},
	},
	{
		label: "修改时间",
		prop: "createdOn",
		width: 150,
	},
	{
		label: "修改人",
		prop: "modifiedBy",
		width: 150,
        formatter: (row) => {
			return row.modifiedBy?.name;
		},
	},
];

let pageConf = ref({
	pageNo: 1,
	pageSize: 20,
	total: 0,
});

// 分页切换
const handleSizeChange = (v) => {
	pageConf.value.pageNo = 1;
};
const pageChange = (v) => {
	pageConf.value.pageSize = v;
};
// 获取表格数据
const getTableList = async () => {
	comLoading.value = true;
	let param = {
		recordId: props.recordId,
		fileDirectory: fileDirectory.value,
		searchValue: searchValue.value,
		sort: sortFields.value,
		pageNo: pageConf.value.pageNo,
		pageSize: pageConf.value.pageSize,
	};
	let res = await queryAttachmentFile(param);
	if (res) {
		tableData.value = res.data.dataList;
		pageConf.value.total = res.data.pagination.total;
	}
	comLoading.value = false;
};

/**
 * 操作弹框 ******************************************************************
 */
let OperateDialogRef = ref();
const command = (v) => {
	if ((v == "edit" || v == "del") && !fileDirectory.value) {
		ElMessage.error("请先选中节点，根目录不可操作。");
		return;
	}
	if (v == "del") {
        delAttachment(curtNode.value.value, getNodeLabel(
			curtNode.value.value,
			dirList.value
		))
		return;
	}
	if (v == "edit") {
		openDialog("directory", curtNode.value);
		return;
	}
	openDialog("directory");
};
const openDialog = (type, row) => {
	let param = {
		attachmentId: row?.attachmentId || null,
		entityCode: type == "file" ? "" : props.entityCode,
		fileType: type,
		parentDirectory: fileDirectory.value,
		recordId: type == "file" ? props.recordId || null : null,
		fileSize: 0,
		fileUrl: "",
		fileName: "",
		operateType: "",
		directoryLabel: getNodeLabel(
			fileDirectory.value,
			dirList.value
		),
	};
	// 如果是文件
	if (type == "file") {
		param.operateType = row?.attachmentId ? "edit" : "add";
        param.fileName = row?.fileName || null;
	}
	// 如果是目录
	else {
		param.operateType = row ? "edit" : "add";
		param.attachmentId = row ? row.value : null;
		param.fileName = row ? getNodeLabel(
			row.value,
			dirList.value
		) : null;
        // 是编辑 父级目录用父级目录
        if(param.operateType == 'edit') {
            param.parentDirectory = row ? row.parentId : null;
        }
        // 是 父级目录 用自身目录
        else {
            param.parentDirectory = fileDirectory.value;
        }
		param.directoryLabel = getNodeLabel(
			param.parentDirectory,
			dirList.value
		);
	}
	OperateDialogRef.value?.openDialog(param);
};

const getNodeLabel = (id, list) => {
	for (let index = 0; index < list.length; index++) {
		const element = list[index];
		if (element.value == id) {
			return element.label;
		}
		return getNodeLabel(id, element.children);
	}
};

// 删除
const delAttachment = (attachmentId, fileName) => {
    ElMessageBox.confirm("是否确认删除【"+ fileName +"】?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            comLoading.value = true;
            let res = await deleteAttachment(attachmentId);
            if(res) {
                ElMessage.success("删除成功");
                loadDirList();
            }
            comLoading.value = false;
        })
        .catch(() => {});
}

// 下载
const downFile = (row) => {
    window.open(import.meta.env.VITE_APP_BASE_API + row.fileUrl);
}

</script>
