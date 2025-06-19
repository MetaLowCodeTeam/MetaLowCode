<style scoped lang="scss">
.right-div {
	border: 1px solid #eee;
	height: 388px;
	box-sizing: border-box;
	line-height: 0;
	padding: 2px;
}
.parent-li {
	// height: 888px;
	font-size: 13px;
	color: #303030;
	text-decoration: none;
	background: none repeat scroll 0 0 #fff;

	.paren-div {
		height: 36px;
		margin-bottom: 3px;
		position: relative;
		&:hover {
			.action-icon {
				display: block;
			}
		}
		&.is-active {
			background: #dedede;
		}
        .item.tag {
            &::before {
                content: "*";
                color: #fdd455;
                font-size: 16px;
                position: relative;
                top: 2px;
                left: -2px;
            }
        }
	}
}
.action-icon {
	position: absolute;
	right: 10px;
	top: 10px;
	display: none;
	.icon-span {
		cursor: pointer;
		display: inline-block;
		color: #a1a1a1;
		&.add-icon {
			position: relative;
			top: -1px;
		}
		&:hover {
			color: #666;
		}
	}
}

.source-field-box {
	height: calc(388px - 43px);
	margin-bottom: 12px;
	overflow-x: auto;
	margin-top: 5px;
	padding: 0 3px;
	&::-webkit-scrollbar {
		display: none;
	}

	.field-li {
		height: 36px;
		line-height: 36px;
		border: 1px solid #dedede;
		margin-bottom: 2px;
		color: #303030;
		border-radius: 1px;
		padding: 0 10px;
		width: calc(100% - 22px);
		.field-item {
			width: calc(100% - 32px);
		}
		&:hover {
			background: var(--el-color-primary);
			color: #fff;
			cursor: pointer;
		}
		.icon-span {
			margin-top: 2px;
		}
	}
	&:hover {
		&::-webkit-scrollbar {
			display: block;
		}
		&.need-auto {
			.field-li {
				width: calc(100% - 22px);
			}
		}
	}
}
.mover,
.submover {
	width: 32px;
	height: 36px;
	line-height: 36px;
	background: var(--el-color-primary-light-3);
	text-align: center;
	color: #fff;
	.icon {
		float: left;
		margin-left: 6px;
		margin-top: 8px;
	}
	&:hover {
		cursor: move;
		background: var(--el-color-primary);
	}
}
.item {
	height: 36px;
	line-height: 36px;
	border: 1px solid #dedede;
	border-left: 0;
	width: calc(100% - 32px);
	box-sizing: border-box;
	padding: 0 10px;
}

.ghost {
	background: #fff !important;
	border: 1px dashed #999;
	.mover,
	.item {
		opacity: 0;
	}
}
.chosenClass {
	background: #fff;
	// background-color: #f1f1f1;
}
.sortable-box {
	height: 388px;
	border: 1px solid #eee;
	padding: 2px;
	box-sizing: border-box;
	margin-bottom: 12px;
	overflow-x: auto;
	&::-webkit-scrollbar {
		display: none;
	}
	&:hover {
		&::-webkit-scrollbar {
			display: block;
		}
	}
}
</style>
<template>
	<el-empty description="暂无字段可选" v-if="fieldList.length === 0" />
	<div v-else>
		<el-row :gutter="10">
			<el-col :span="12">
				<div class="sortable-box">
					<VueDraggableNext
						ghost-class="ghost"
						chosen-class="chosenClass"
						animation="300"
						:force-fallback="false"
						handle=".mover"
						:list="modelValue"
					>
						<div
							class="parent-li"
							v-for="(parent, inx) of modelValue"
							:key="inx"
						>
							<div class="paren-div">
								<div class="mover fl">
									<el-icon size="20" class="icon">
										<ElIconRank />
									</el-icon>
								</div>
								<div 
                                    class="fl item text-ellipsis"
                                    :class="{'tag':isShowItemTag(parent)}"
                                    :title="parent.label"
                                >
									{{ parent.label }}
								</div>
								<div class="action-icon">
                                    <span
										class="icon-span mr-5"
										@click.stop="editField(parent, inx)"
									>
										<el-icon size="16">
											<ElIconEditPen />
										</el-icon>
									</span>
									<span
										class="icon-span"
										@click.stop="delField(parent, inx)"
									>
										<el-icon size="16">
											<ElIconCloseBold />
										</el-icon>
									</span>
								</div>
							</div>
						</div>
					</VueDraggableNext>
				</div>
			</el-col>
			<el-col :span="12">
				<div class="right-div">
					<el-input
						class="right-div-input"
						v-model="searchField"
						placeholder="筛选字段"
						clearable
					>
						<template #prefix>
							<el-icon class="el-input__icon">
								<ElIconSearch />
							</el-icon>
						</template>
					</el-input>
					<div
						class="source-field-box"
						:class="{ 'need-auto': notShowField().length > 8 }"
					>
						<div
							class="field-li"
							v-for="(field, inx) of notShowField()"
							:key="inx"
							@click="addShowField(field)"
						>
							<div 
                                class="fl field-item text-ellipsis"
                                :title="field.label"
                            >
								{{ field.label }}
							</div>
							<span class="fr icon-span">
								<el-icon size="16">
									<ElIconPlus />
								</el-icon>
							</span>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
	<ml-dialog
		title="编辑字段"
		v-model="editFieldDialogConfig.isShow"
        width="500"
	>
		<el-form label-width="80px">
            <el-form-item label="当前字段">
                <el-input 
                    :value="editFieldDialogConfig.field.label + '（' + editFieldDialogConfig.field.name + '）'" 
                    disabled 
                />
            </el-form-item>
            <el-form-item label="别名">
                <el-input v-model="editFieldDialogConfig.field.aliasName" clearable/>
            </el-form-item>
            <template v-if="moreSetting">
                <el-form-item label="是否隐藏">
                    <el-switch v-model="editFieldDialogConfig.field.isHide" />
                </el-form-item>
                <el-form-item label="列宽">
                    <el-input-number v-model="editFieldDialogConfig.field.width" :min="0" :max="1000" />
                </el-form-item>
            </template>
        </el-form>
		<template #footer>
			<el-button @click="editFieldDialogConfig.isShow = false">取消</el-button>
			<el-button type="primary" @click="saveEditField">确认</el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref, watchEffect } from "vue";
// 引入拖拽组件
import { VueDraggableNext } from "vue-draggable-next";
const props = defineProps({
	fieldList: {
		type: Array,
		default: () => [],
	},
    modelValue: {
        type: Array,
        default: () => [],
    },
    // 是否更多设置
    moreSetting: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(["update:modelValue"]);

// 源数据
let sourceFieldList = ref([]);

// 删除显示字段
const delField = (field, inx) => {
    const newArray = props.modelValue.filter((_, i) => i !== inx);
    emit("update:modelValue", newArray);
};

// 添加显示字段
const addShowField = (field) => {
    const newArray = [...props.modelValue, field];
    emit("update:modelValue", newArray);
};

let editFieldDialogConfig = ref({
    isShow: false,
    field: {},
    inx: 0
});

// 编辑字段
const editField = (field, inx) => {
    editFieldDialogConfig.value.isShow = true;
    editFieldDialogConfig.value.field = JSON.parse(JSON.stringify(field));
    editFieldDialogConfig.value.inx = inx;
};

// 保存编辑字段
const saveEditField = () => {
    let newArray = props.modelValue;
    newArray[editFieldDialogConfig.value.inx] = editFieldDialogConfig.value.field;
    console.log(newArray, 'newArray')
    emit("update:modelValue", newArray);
    editFieldDialogConfig.value.isShow = false;
};

// 是否显示标签
const isShowItemTag = (field) => {
    return field.aliasName && field.aliasName.length > 0;  
};

// 筛选字段
let searchField = ref("");
const notShowField = () => {
    let names = props.modelValue.map(item => item.name);
    let filterFieldList = sourceFieldList.value.filter(item => !names.includes(item.name));
	if (!searchField) {
		return filterFieldList;
	} else {
		return filterFieldList.filter(
			(el) => el.label.indexOf(searchField.value) != -1
		);
	}
};

watchEffect(() => {
    sourceFieldList.value = props.fieldList;
})

</script>
