<template>
	<el-container class="main-container">
		<el-aside width="300px">
			<div class="fields-list" style="height: 100%">
				<div class="fields-list-header">{{ title }}</div>
				<div class="fields-list-box" v-loading="treeLoading">
					<el-scrollbar>
						<el-tree
							ref="treeRefs"
							:data="treeList"
							:props="treeProps"
							highlight-current
							empty-text="没有字段数据"
							check-strictly
							node-key="$inx"
							@node-click="handleTreeNodeClick"
						/>
					</el-scrollbar>
				</div>
			</div>
		</el-aside>
		<el-container class="main-container">
			<el-header class="main-header w-100">
				<div class="title fl">{{ cutNode.title }}</div>
				<div class="section-fr fr">
					<el-button
						@click.stop="operateItem(-1, 'add')"
						:disabled="treeList.length < 1"
					>
						<span class="btn-icon-t1">
							<el-icon>
								<ElIconPlus />
							</el-icon>
						</span>
						新增选项
					</el-button>
					<!-- <el-button type="primary" @click="onSave" :loading="mainLoading" :disabled="treeList.length < 1">保存</el-button> -->
				</div>
			</el-header>
			<el-main class="mian-box" v-loading="mainLoading" v-if="!isCascaderOption">
				<el-scrollbar>
					<el-empty
						v-if="mainList.length == 0"
						description="没有数据"
					/>
					<div
						class="op-item"
						v-for="(item, inx) of mainList"
						:key="inx"
					>
						<div class="op-item-text yichu" :title="item.label">
							{{ item.label }}
                            <span v-if="props.pageType == 'system'">
                                ({{ item.value }})
                            </span>
                            <span v-if="props.isCodeOption">
                                ({{ item.value }})
                            </span>
						</div>
						<div class="op-icon-box">
							<span
								title="插入"
								@click.stop="operateItem(inx, 'ins')"
							>
								<el-icon>
									<ElIconPlus />
								</el-icon>
							</span>
							<span
								title="上移"
								@click.stop="moveItem(inx, 'top')"
							>
								<el-icon>
									<ElIconTop />
								</el-icon>
							</span>
							<span
								title="下移"
								@click.stop="moveItem(inx, 'down')"
							>
								<el-icon>
									<ElIconBottom />
								</el-icon>
							</span>
							<span
								title="编辑"
								@click.stop="operateItem(inx, 'edit', item)"
							>
								<el-icon>
									<ElIconEdit />
								</el-icon>
							</span>
							<span title="删除" @click.stop="delItem(inx, item)">
								<el-icon>
									<ElIconDelete />
								</el-icon>
							</span>
						</div>
					</div>
				</el-scrollbar>
			</el-main>
            <el-main class="mian-box" v-loading="mainLoading" v-else>
                <CascaderOptionMain />
            </el-main>  
		</el-container>
	</el-container>
    <operateSystemDialog 
        ref="operateSystemDialogRef" 
        :saveFn="saveFn"
        @refresh="getMainList"
    />
    <EditCodeOptionDialog 
        ref="editCodeOptionDialogRef" 
        @confirm="onEditCodeOptionConfirm"
    />
</template>

<script setup>
import { inject, nextTick, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import operateSystemDialog from "./operateSystemDialog.vue";
import EditCodeOptionDialog from "./EditCodeOptionDialog.vue";
import CascaderOptionMain from "./CascaderOptionMain.vue";
import { optionCanBeDeleted, codeOptionCanBeDeleted } from "@/api/system-manager";
const props = defineProps({
	title: { type: String, default: "" },
	getTreeFn: { type: Function },
	getMainFn: { type: Function },
	saveFn: { type: Function },
    deleteFn: { type: Function },
    pageType: { type: String, default: "" },
    // 是否是编码单选项
    isCodeOption: { type: Boolean, default: false },
    // 是否是级联选项
    isCascaderOption: { type: Boolean, default: false },
});
const router = useRouter();
const $ElMessage = inject("$ElMessage");
// 搜索参数
let keyword = ref("");
// 左侧树loading
let treeLoading = ref(false);
let treeList = ref([]);
let treeProps = reactive({
	children: "children",
	label: "label",
});
let treeRefs = ref("");
// 选中节点
let cutNode = ref({});
// 右侧主体loading
let mainLoading = ref(false);
let mainList = ref([]);
onMounted(() => {
	getTreeList();
});

// 获取tree数据
const getTreeList = async () => {
	treeLoading.value = true;
	mainLoading.value = true;
    let { appAbbr } = router.currentRoute.value.query;  
	let res = await props.getTreeFn(appAbbr, props.isCodeOption ? 'CodeOption' : '');
	if (res) {
        treeList.value = [];
        if(props.pageType == 'system') {
            treeList.value = formatSystemTree(res.data);
        }
        else {
            treeList.value = formatTree(res.data || []);
        }
		if (treeList.value.length > 0) {
			cutNode.value = treeList.value[0].children[0];
			nextTick(() => {
				treeRefs.value.setCurrentKey("1-1");
				getMainList();
			});
		} else {
			mainLoading.value = false;
		}
	} else {
		mainLoading.value = false;
	}
	treeLoading.value = false;
};

// 格式化系统项tree
const formatSystemTree = (data) => {
    let formatArr = [];
    // 遍历data对象
    let num = 0;
    for(let key in data) {
        let obj = {
            label: key,
            name: key,
            $inx: `${num + 1}`,
            children: data[key].map((el,inx) => {
                return {
                    label: el.label,
                    name: el.value,
                    $inx: `${num + 1}-${inx + 1}`,
                }
            }),
        }
        formatArr.push(obj);
        num++;
    }
    return formatArr;
}


// 格式化Tree数据
const formatTree = (data) => {
	let formatArr = [];
	data.forEach((el, inx) => {
		let obj = {
			label: el.entityLabel,
			name: el.entityName,
			$inx: `${inx + 1}`,
			children: [],
		};
		el.fieldList.forEach((subEl, subInx) => {
			let subObj = {
				label: subEl.fieldLabel + (subEl.syncFlag == "1" ? "(已同步)" : ""),
				name: subEl.fieldName,
				parentName: el.entityName,
                title: getSubElTitle(subEl),
				$inx: `${inx + 1}-${subInx + 1}`,
			};
			obj.children.push(subObj);
		});
		if (obj.children.length > 0) {
			formatArr.push(obj);
		}
	});
	return formatArr;
};

const getSubElTitle = (subEl) => {
    let title = subEl.fieldLabel;
    if(subEl.syncFlag == "1"){
        title +=  " (已同步：[" + subEl.syncEntityLabel + '.' + subEl.syncFieldLabel + '])'
    }
    return title;
}

// 节点点击
const handleTreeNodeClick = (node) => {
	if (!node.children) {
		cutNode.value = node;
		getMainList();
	}
};

// 获取主体数据
const getMainList = async () => {
	mainLoading.value = true;
	let res;
    if(props.pageType == 'system') {
        res = await props.getMainFn(cutNode.value.name);
    }else {
        res = await props.getMainFn(
            cutNode.value.parentName,
            cutNode.value.name
        );
    }
	if (res) {
		mainList.value = res.data || [];
	}
	mainLoading.value = false;
};
let operateSystemDialogRef = ref(null);
let editCodeOptionDialogRef = ref(null);
let currentEditType = ref('');
let currentEditInx = ref(null);
// 新增、插入、编辑
const operateItem = (inx, targe, item) => {
    if(props.isCodeOption) {
        currentEditType.value = targe;
        currentEditInx.value = inx;
        console.log(item);
        let data = item ? JSON.parse(JSON.stringify(item)) : null;
        editCodeOptionDialogRef.value.openDialog(data);
        return
    }
    if(props.pageType == 'system') {
        operateSystemDialogRef.value.openDialog({ 
            systemName: cutNode.value.name,
            inx, 
            targe, 
            item, 
            mainList: JSON.parse(JSON.stringify(mainList.value))
        });
        return
    }
	let infoText = "";
	let inputValue = null;
	if (targe == "edit") {
		infoText = "请修改选项名称";
		inputValue = item.label;
	} else {
		infoText = "请输入选项名称";
	}
	ElMessageBox.prompt(infoText, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		inputValue,
		inputPattern:/^[^\s,](?:.*[^\s,])?$/,
		inputErrorMessage: "输入不正确",
		beforeClose: (action, instance, done) => {
			if (action === "confirm") {
				if (instance.inputValue) {
					let newItem = {
						label: instance.inputValue,
						value: getOptionMaxValue(),
						saved: false,
					};
                    if(newItem.label.indexOf('/') !== -1){
                        $ElMessage.warning("选项名称不能包含【/】");
                        return;
                    }
					//  判断选项是否存在
					for (
						let index = 0;
						index < mainList.value.length;
						index++
					) {
						const el = mainList.value[index];
						if (el.label == newItem.label) {
							$ElMessage.warning(
								"已存在【" + instance.inputValue + "】选项"
							);
							return;
						}
					}
					// 插入
					if (targe == "ins") {
						mainList.value.splice(inx + 1, 0, newItem);
					}
					// 新增
					else if (targe == "add") {
						mainList.value.push(newItem);
					}
					// 编辑
					else {
						mainList.value[inx].label = newItem.label;
					}
				}
			}
			done();
		},
	})
		.then(() => {
			onSave();
		})
		.catch(() => {});
};
const getOptionMaxValue = () => {
	let maxValue = 0;
	mainList.value.forEach((item, idx) => {
		if (item.value > maxValue) {
			maxValue = item.value;
		}
	});
	return maxValue + 1;
};
// 上移下移
const moveItem = (inx, target) => {
	let prevItem = { ...mainList.value[inx - 1] };
	let nextItem = { ...mainList.value[inx + 1] };
	if (target == "top") {
		if (inx == 0) {
			$ElMessage.warning("已经在最上面了");
            return
		} else {
			mainList.value[inx - 1] = mainList.value[inx];
			mainList.value[inx] = prevItem;
		}
	} else {
		if (inx == mainList.value.length - 1) {
			$ElMessage.warning("已经在最下面面了");
            return
		} else {
			mainList.value[inx + 1] = mainList.value[inx];
			mainList.value[inx] = nextItem;
		}
	}
	onSave();
};

// 删除
const delItem = (inx, item) => {
	ElMessageBox.confirm("确定删除该选项?", "提示")
		.then(async () => {
            if(props.pageType == 'system') {
                let res = await props.deleteFn(cutNode.value.name, item.name);
                if(res && res.data) {
                    mainList.value.splice(inx, 1);
                    onSave("删除成功");
                }else {
                    $ElMessage.warning("该系统常量无法删除。");
                }
                return
            }
			if (!item.saved) {
				mainList.value.splice(inx, 1);
				$ElMessage.success("删除成功");
				return;
			}
			//TODO：后台需要检查改选项是否已被实体记录所引用！！
			if (props.title == "单选项管理") {
				let res = await optionCanBeDeleted(cutNode.value.parentName, cutNode.value.name, item.value);
				if (res) {
					if (res.data) {
						mainList.value.splice(inx, 1);
						onSave("删除成功");
					} else {
						$ElMessage.warning("该选项有数据正在使用，无法删除。");
					}
				}
			} 
            else if(props.isCodeOption) {
                let res = await codeOptionCanBeDeleted(cutNode.value.parentName, cutNode.value.name, item.value);
                if(res && res.data) {
                    mainList.value.splice(inx, 1);
                    onSave("删除成功");
                }else {
                    $ElMessage.warning("该选项有数据正在使用，无法删除。");
                }
            }
            else {
				mainList.value.splice(inx, 1);
				onSave("删除成功");
			}
		})
		.catch(() => {});
};


const onEditCodeOptionConfirm = (item) => {
    if(currentEditType.value == 'add') {
        // 检查是否已存在相同项（根据实际业务需求调整校验条件）
        if(isEditCodeOption(mainList.value, item)) {
            mainList.value.push(item);
            onSave();
        }
    }
    if(currentEditType.value == 'ins') {
        // 检查是否已存在相同项（根据实际业务需求调整校验条件）
        if(isEditCodeOption(mainList.value, item)) {
            mainList.value.splice(currentEditInx.value, 0, item);
            onSave();
        }
    }
    if(currentEditType.value == 'edit') {
        let oldItem = mainList.value[currentEditInx.value];
        // 检查是否有其他项使用了相同的值（排除当前编辑的项）
        let list = mainList.value.filter(el => el.value != oldItem.value);
        if(isEditCodeOption(list, item)) {
            mainList.value[currentEditInx.value] = {
                ...oldItem,  // 保留原有属性
                ...item,     // 应用新属性
                saved: false // 标记为需要保存
            };
            onSave();
        }
    }
    
}

const isEditCodeOption = (list, item) => {
    const isValueConflict = list.some((existItem) => 
       existItem.value === item.value
    );
    const isLabelConflict = list.some((existItem) => 
        existItem.label === item.label
    );
    
    if (isValueConflict) {
        $ElMessage.warning('已存在相同【编码】的选项');
        return;
    }
    if (isLabelConflict) {
        $ElMessage.warning('已存在相同【名称】的选项');
        return;
    }
    return true;
}


// 保存
const onSave = async (msg) => {
	// 如果是多选选管理，value = label
	if (props.title == "多选项管理") {
		mainList.value.map((el) => {
			if (el.value != el.label) {
				el.value = el.label;
			}
		});
	}
	mainLoading.value = true;
    let res;
    if(props.pageType == 'system') {
        res = await props.saveFn(cutNode.value.name, mainList.value);
    }else {
        res = await props.saveFn(
            cutNode.value.parentName,
            cutNode.value.name,
            mainList.value
        );
    }
	if (res) {
		$ElMessage.success(msg || "保存成功");
        editCodeOptionDialogRef.value.closeDialog();
		getMainList();
	}else {
        mainLoading.value = false;
    }

	
};

// const getApprovalList = () => {};
</script>
<style lang="scss" scoped>
.main-container {
	background: #fff;
}
.main-header,
.fields-list-header {
	font-size: 14px;
	height: 54px;
	line-height: 54px;
	border-bottom: 1px dashed #eeeeee;
}
.fields-list-header {
	text-align: center;
	font-size: 16px;
}
.fields-list-box {
	height: calc(100% - 55px);
}
.main-header {
	padding: 0 20px;
	.title {
		font-size: 16px;
	}
	.btn-icon-t1 {
		position: relative;
		top: 1px;
		margin-right: 3px;
	}
}
.mian-box {
	// background: red;
	padding: 0;
	.op-item {
		height: 32px;
		line-height: 32px;
		font-size: 14px;
		padding-left: 20px;
		border-bottom: 1px solid #eeeeee;
		position: relative;
		.op-item-text {
			float: left;
			max-width: calc(100% - 160px);
		}
		.op-icon-box {
			float: left;
			width: 125px;
			margin-left: 30px;
			display: none;
			& > span {
				position: relative;
				top: 2px;
				cursor: pointer;
				margin-left: 5px;
				&:hover {
					color: var(--el-color-primary);
				}
			}
		}
		&:hover {
			background: #f5f5f5;
			.op-icon-box {
				display: block;
			}
		}
	}
}
</style>
