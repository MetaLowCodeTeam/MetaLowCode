<template>
	<el-container class="hidden-x-scrollbar">
		<el-aside class="left-props-panel">
			<el-scrollbar class="props-scrollbar">
				<div class="entity-property" v-loading="propsLoading">
					<div class="entity-property-header">&lt;{{ entityProps.label }}&gt;实体属性</div>
					<div class="entity-property-form">
						<el-form label-position="left" :label-width="'120px'" size="small">
							<el-form-item label="实体名称：">
								<el-input link type="primary" v-model="entityProps.name" disabled></el-input>
							</el-form-item>
							<el-form-item label="显示名称：">
								<el-input link type="primary" v-model="entityProps.label" :readonly="true">
									<template #suffix>
										<el-button link type="primary" icon="el-icon-edit" title="修改显示名称"
												   @click="modifyEntityLabel"></el-button>
									</template>
								</el-input>
							</el-form-item>
							<el-form-item label="实体编码：">
								<el-input link type="primary" v-model="entityProps.entityCode" disabled></el-input>
							</el-form-item>
							<el-form-item label="数据库表名：">
								<el-input link type="primary" v-model="entityProps.physicalName" disabled></el-input>
							</el-form-item>
							<el-form-item label="名称字段：">
								<el-input link type="primary" v-model="entityProps.nameField" :readonly="true">
									<template #suffix>
										<el-button link type="primary" icon="el-icon-edit" title="修改名称字段"
												   @click="modifyEntityNameField"></el-button>
									</template>
								</el-input>
							</el-form-item>
							<el-form-item label="允许设计表单：">
								<el-switch v-model="entityProps.layoutable" style="float: right" disabled></el-switch>
							</el-form-item>
							<el-form-item label="允许设计列表：">
								<el-switch v-model="entityProps.listable" style="float: right" disabled></el-switch>
							</el-form-item>
							<el-form-item label="开启记录级权限：">
								<el-switch v-model="entityProps.authorizable" style="float: right" disabled></el-switch>
							</el-form-item>
							<el-form-item label="是否明细实体：">
								<el-switch v-model="entityProps.detailEntityFlag" style="float: right"
										   disabled></el-switch>
							</el-form-item>
                            <el-form-item label="标签">
								<el-tag
                                    v-for="tag in entityProps.tags"
                                    :key="tag"
                                    class="mr-5 mb-5"
                                >
                                    {{ tag }}
                                </el-tag>
                                <div class="w-100">
                                    <el-button
                                        :disabled="entityProps.tags?.length > 9"
                                        class="button-new-tag ml-1"
                                        size="small"
                                        @click="addTagDialogIsShow = true"
                                        plain
                                    >
                                        设置标签
                                    </el-button>
                                </div>
							</el-form-item>
							<el-form-item label="所属主实体：" v-if="!!entityProps.detailEntityFlag">
								<el-input link type="primary" v-model="entityProps.mainEntity.label"
										  disabled></el-input>
							</el-form-item>
						</el-form>
					</div>

					<!--
					<div style="text-align: center">
					  <el-button type="" size="small" @click="modifyEntity">修改实体设置</el-button>
					</div>
					-->
				</div>
			</el-scrollbar>
		</el-aside>

		<el-container>
			<el-header class="list-search-panel">
				<div class="search-panel-left">
					<el-dropdown @command="handleNewFieldCommand" size="small">
						<el-button type="primary">
							新建字段<el-icon><ArrowDown /></el-icon>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="BooleanWE">布尔 / Boolean</el-dropdown-item>
								<el-dropdown-item command="IntegerWE">整数 / Integer</el-dropdown-item>
								<el-dropdown-item command="DecimalWE">精度小数 / Decimal</el-dropdown-item>
								<el-dropdown-item command="MoneyWE">金额 / Money</el-dropdown-item>
								<el-dropdown-item command="TextWE" divided>文本 / Text</el-dropdown-item>
								<el-dropdown-item command="TextAreaWE">长文本 / TextArea</el-dropdown-item>
								<el-dropdown-item command="OptionWE" divided>单选项 / Option</el-dropdown-item>
								<el-dropdown-item command="TagWE">多选项 / Tag</el-dropdown-item>
								<el-dropdown-item command="AreaSelectWE">地区选择 / AreaSelect</el-dropdown-item>
								<el-dropdown-item command="DateWE" divided>日期 / Date</el-dropdown-item>
								<el-dropdown-item command="DateTimeWE">日期时间 / DateTime</el-dropdown-item>
								<el-dropdown-item command="PictureWE" divided>图片 / Picture</el-dropdown-item>
								<el-dropdown-item command="FileWE">文件 / File</el-dropdown-item>
								<el-dropdown-item command="ReferenceWE" divided>一对一引用 / Reference
								</el-dropdown-item>
								<!--
								<el-dropdown-item command="AnyReferenceWE">一对多引用 / AnyReference</el-dropdown-item>
								<el-dropdown-item command="ReferenceListWE">多对多引用 / ReferenceList</el-dropdown-item>
								-->
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
				<div style="flex: 1"></div>
				<div class="search-panel-right">
					<el-input link type="primary" v-model="searchText" :clearable="true" @clear="clearTableSearch"
							  class="v-middle"
							  @keyup.enter="searchTableData" size="small" placeholder="请输入关键词搜索">
						<template #append>
							<el-button icon="el-icon-search" @click="searchTableData"></el-button>
						</template>
					</el-input>
				</div>
                <el-button class="ml-10" type="primary" @click="goFormDesign">表单设计</el-button>
			</el-header>

			<el-main ref="tableContainer">
				<div>
					<SimpleTable :columns="columns" :data="filteredData" :show-pagination="false"
								 :show-check-box="false"
								 :show-operation-column="true"
								 :height="'100%'" table-size="small" table-width="100% !important">
						<template #table_operation="{scope}">
							<template v-if="!scope.row['reserved']">
								<el-button type="primary" link size="small" icon="el-icon-edit"
										   @click="editTableData(scope.row)">修改
								</el-button>
								<el-button type="primary" link size="small" icon="el-icon-delete"
										   @click="deleteTableData(scope.row)">删除
								</el-button>
							</template>
						</template>
					</SimpleTable>
				</div>

			</el-main>

			<el-footer>
				<div style="height: 32px; line-height: 32px; font-size: 13px; background-color: white">
					字段列表：当前实体共 {{ tableData.length }} 个字段
				</div>
			</el-footer>

			<el-dialog title="修改名称字段" v-model="showNameFieldDialogFlag" v-if="showNameFieldDialogFlag"
					   :append-to-body="true" :destroy-on-close="true" class="name-field-dialog" width="480px">
				<div class="name-field-hint"><i class="el-icon-bell"></i>提示：只有文本(Text)类型字段可设置为名称字段。
				</div>
				<SimpleTable :show-pagination="false" :show-check-box="false" :table-size="'small'"
							 :show-operation-column="true"
							 :columns="nameFieldColumns" :data="nameFieldData" :max-height="420">
					<template #table_operation="{scope}">
						<el-button v-if="!scope.row.nameFieldFlag" class="" icon="el-icon-check"
								   @click="selectNameField(scope.row)">选择
						</el-button>
						<el-button v-else :disabled="true">当前名称字段</el-button>
					</template>
				</SimpleTable>
			</el-dialog>

			<el-dialog :title="'新建字段 / ' + curEditorType" v-model="showNewFieldDialogFlag"
					   v-if="showNewFieldDialogFlag"
					   :show-close="true" :destroy-on-close="true" :close-on-click-modal="false"
					   :close-on-press-escape="false" class="no-padding field-setting-dialog" width="620px">
				<component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved" @cancelSave="onCancelSaveField"
						   :showingInDialog="true"></component>
			</el-dialog>

			<el-dialog :title="'编辑字段 / ' + curEditorType" v-model="showEditFieldDialogFlag"
					   v-if="showEditFieldDialogFlag"
					   :show-close="false" :destroy-on-close="true" :close-on-click-modal="false"
					   :close-on-press-escape="false" class="no-padding field-setting-dialog" width="620px">
				<component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved" @cancelSave="onCancelSaveField"
						   :showingInDialog="true" :field-name="editingFieldName" :field-state="2"></component>
			</el-dialog>

			<el-dialog title="编辑实体属性" v-model="showEntityPropsDialogFlag" v-if="showEntityPropsDialogFlag"
					   :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false"
					   :destroy-on-close="true">
				<EntityPropEditor ref="EPEditor" :entityProps="entityProps" :show-title="false"
								  :filter-entity-method="filterMainEntity"></EntityPropEditor>
				<template #footer>
					<div class="dialog-footer">
						<el-button type="primary" @click="saveEntity">保 存</el-button>
						<el-button @click="cancelSaveEntity">取 消</el-button>
					</div>
				</template>
			</el-dialog>
		</el-container>

        <!-- 设置标签 -->
        <ml-dialog v-model="addTagDialogIsShow" title="设置标签" width="400">
            <div v-loading="addTagDialogLoading">
                <el-check-tag
                    v-for="(tag,inx) of allTags" :key="inx"
                    class="mr-5 mb-5"
                    :checked="tag.checked"
                    @change="onTagsChange(tag)"
                >
                    {{ tag.name }}
                </el-check-tag>
                <div class="w-100">
                    <el-input
                        v-if="inputVisible"
                        class="mb-5"
                        ref="InputRef"
                        v-model="tagValue"
                        style="width: 100px;"
                        @keyup.enter="handleInputConfirm"
                        @blur="handleInputConfirm"
                    />
                    <el-button v-else class="mb-5 button-new-tag ml-1" @click="showInput" :disabled="allTags?.length > 9">+ 新增标签</el-button>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button
                        type="primary"
                        @click="setConfirmTags"
                        v-loading="addTagDialogLoading"
                    >确 定</el-button>
                    <el-button @click="addTagDialogIsShow = false" v-loading="addTagDialogLoading"
                    >取 消</el-button>
                </div>
            </template>
        </ml-dialog>
	</el-container>
</template>

<script>
import {
	getEntityProps,
    getFieldListOfEntity,
    getEntitySet,
    updateEntityLabel,
    getTextFieldList,
	updateEntityNameField,
    fieldCanBeDeleted,
    deleteField,
    fieldCanBeEdited,
    updateEntityTags,
    getAllTagsOfEntity
} from '@/api/system-manager'
import {formatBooleanColumn, isEmptyStr, copyNew} from '@/utils/util'
import EntityPropEditor from "@/views/system/entity-editor/entity-property-editor.vue";
import {ElMessage} from "element-plus";
import BooleanWE from '@/views/system/field-editor/boolean-widget-editor.vue';
import IntegerWE from '@/views/system/field-editor/integer-widget-editor.vue';
import DecimalWE from '@/views/system/field-editor/decimal-widget-editor.vue';
import PercentWE from '@/views/system/field-editor/percent-widget-editor.vue';
import MoneyWE from '@/views/system/field-editor/money-widget-editor.vue';
//
import TextWE from '@/views/system/field-editor/text-widget-editor.vue';
import EmailWE from '@/views/system/field-editor/email-widget-editor.vue';
import UrlWE from '@/views/system/field-editor/url-widget-editor.vue';
import TextAreaWE from '@/views/system/field-editor/textarea-widget-editor.vue';
import PasswordWE from '@/views/system/field-editor/password-widget-editor.vue';
//
import OptionWE from '@/views/system/field-editor/option-widget-editor.vue';
import TagWE from '@/views/system/field-editor/tag-widget-editor.vue';
import AreaSelectWE from '@/views/system/field-editor/areaselect-widget-editor.vue';
//
import DateWE from '@/views/system/field-editor/date-widget-editor.vue';
import DateTimeWE from '@/views/system/field-editor/datetime-widget-editor.vue';
//
import PictureWE from '@/views/system/field-editor/picture-widget-editor.vue';
import FileWE from '@/views/system/field-editor/file-widget-editor.vue';
//
import ReferenceWE from '@/views/system/field-editor/reference-widget-editor.vue';
import AnyReferenceWE from '@/views/system/field-editor/anyreference-widget-editor.vue';
import ReferenceListWE from '@/views/system/field-editor/referencelist-widget-editor.vue';
import {h} from 'vue';
import useCommonStore from "@/store/modules/common";
const { getEntityList } = useCommonStore();
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
export default {
	name: "EntityFieldTable",
	components: {
		EntityPropEditor,
		BooleanWE,
		IntegerWE,
		DecimalWE,
		MoneyWE,
		TextWE,
		EmailWE,
		UrlWE,
		TextAreaWE,
		PasswordWE,
		OptionWE,
		TagWE,
		AreaSelectWE,
		DateWE,
		DateTimeWE,
		PictureWE,
		FileWE,
		ReferenceWE,
		AnyReferenceWE,
		ReferenceListWE,
	},
	data() {
		return {
			columns: [
				{prop: 'name', label: '字段名称', width: '130', align: 'left', fixed: true},
				{prop: 'label', label: '显示名称', align: 'center'},
				{prop: 'physicalName', label: '数据库字段名', align: 'left'},
				{prop: 'type', label: '字段类型', width: '100', align: 'left'},
				{prop: 'referTo', label: '引用实体', width: '120', align: 'center'},
				{prop: 'idFieldFlag', label: '主键字段', width: '70', align: 'center', formatter: formatBooleanColumn},
				{
					prop: 'nameFieldFlag',
					label: '名称字段',
					width: '70',
					align: 'center',
					formatter: formatBooleanColumn
				},
				{
					prop: 'mainDetailFieldFlag',
					label: '主从字段',
					width: '70',
					align: 'center',
					formatter: formatBooleanColumn
				},
				{prop: 'reserved', label: '系统字段', width: '70', align: 'center', formatter: formatBooleanColumn},
			],
			tableData: [],
			filteredData: [],
			searchText: '',
			tableHeight: 100,

			curFWEditor: '',
			curEditorType: '',
			showNameFieldDialogFlag: false,
			showNewFieldDialogFlag: false,
			showEditFieldDialogFlag: false,
			showEntityPropsDialogFlag: false,
			editingFieldName: null,

			nameFieldColumns: [
				{prop: 'name', label: '字段名称', width: '148', align: 'left', fixed: true},
				{prop: 'label', label: '显示名称', width: '148', align: 'center'},
			],
			nameFieldData: [],

			entityProps: {
				name: 'Account',
				label: '客户',
				entityCode: 0,
				physicalName: '',
				nameField: '',
				detailEntityFlag: false,
				mainEntity: '',
				layoutable: true,
				listable: true,
				authorizable: false,
				assignable: false,
				shareable: false,
			},
			entity: "",
            propsLoading:false,
            allTags:[],
            addTagDialogIsShow:false,
            addTagDialogLoading:false,
            inputVisible:false,
            tagValue:"",
		}
	},
	created() {
		this.entity = this.$route.query.entity;
	},
	mounted() {
		this.$nextTick(() => {
			this.resizeTableHeight()
		})
		window.onresize = () => {
			this.resizeTableHeight()
		}
		this.initPageData()
	},
	methods: {
		resizeTableHeight() {  /* table自适应高度 */
            if(this.$refs.tableContainer){
                this.tableHeight = this.$refs.tableContainer.$el.offsetHeight - 42 + 42/*覆盖表格页脚高度*/
            }
		},

        // 进入表单设计
        goFormDesign(){
            this.$router.push({
                path:"/web/form-design",
                query:{
                    entity: this.entityProps.name,
                    entityLabel: this.entityProps.label
                }
            })
        },

		initEntityProps() {
            this.propsLoading = true;
			getEntityProps(this.entity).then(res => {
                if(res && res.data){
                    this.entityProps = res.data
                    this.entityProps.tags = res.data.tags ? res.data.tags.split(",") : [];
                    this.getAllTags();
                }
				this.propsLoading = false;
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
                this.propsLoading = false;
			})

		},

		initPageData() {
			this.initEntityProps()
			this.initTableData()

		},
        // 获取所有tag
        async getAllTags(){
            let res = await getAllTagsOfEntity();
            if (res && res.data) {
                // let filterTags = res.data.filter(el=> !this.entityProps.tags.includes(el))
                this.allTags = res.data.map((el) => {
                    return {
                        name: el,
                        checked: this.entityProps.tags.includes(el),
                    };
                })
            }
        },
        // 标签选中切换
        onTagsChange(item)  {
            item.checked = !item.checked;
        },
        // 设置标签确认
        async setConfirmTags(){
            this.addTagDialogLoading = true;
            let setTags = [];
            this.allTags.forEach(el=>{
                if(el.checked){
                    setTags.push(el.name)
                }
            })
            let res = await updateEntityTags(this.entity,setTags.join(","))
            if(res && res.data){
                this.$message.success('标签设置成功')
                this.addTagDialogIsShow = false;
				this.initEntityProps()
            }
            this.addTagDialogLoading = false;
        },
        // 点击新增标签
        showInput(){
            this.inputVisible = true;
            this.$nextTick(()=>{
                this.$refs.InputRef.focus()
            })
        },
        // 新建确认
        handleInputConfirm  () {
            let hasTag = this.allTags.filter(
                (el) => el.name == this.tagValue
            );
            if (this.tagValue && hasTag.length < 1) {
                this.allTags.push({
                    name: this.tagValue,
                    checked: true,
                });
            }
            this.inputVisible = false;
            this.tagValue = "";
        },
		initTableData() {
			getFieldListOfEntity(this.entity).then(res => {
                if (res.code  != 200) {
                    return
                }

				this.tableData = res.data
				this.filteredData = copyNew(this.tableData)
				this.searchText = ''
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		handleNewFieldCommand(command) {
			this.curFWEditor = command
			this.curEditorType = command.replace(/WE$/, '')
			this.showNewFieldDialogFlag = true
		},

		async editTableData(row) {
			if (!!row.type) {
				fieldCanBeEdited(row.name, this.entity).then(res => {
					if (res.code  != 200) {
						return
					}

					if (res.data !== true) {
						this.$message.info('提示：系统字段/保留字段不能编辑！')
						return
					}

					this.curEditorType = row.type
					this.curFWEditor = row.type + 'WE'
					this.editingFieldName = row.name
					this.showEditFieldDialogFlag = true
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}
		},

		async deleteTableData(row) {
            if(publicSetting.value.trialVersionFlag){
                this.$message.error("试用版本已禁用删除字段功能，敬请谅解");
                return
            }
			if (!!this.entity && !!row.type && !!row.name) {
                let res = await fieldCanBeDeleted(row.name, this.entity);
                if(res && res.code == 200){
                    if (res.data !== true) {
						this.$message.info('提示：系统字段/保留字段不能被删除！')
						return
					}

					let confirmText = ['字段删除后不能恢复，是否确认删除?', '1. 删除字段会清空该字段的所有数据，且不能恢复；’',
						'2. 删除字段不会同步更新表单和列表，请手工从表单布局和列表中移除；']
					let pTags = []
					confirmText.forEach(ct => {
						pTags.push(h('p', null, ct))
					})
					this.$confirm('删除提醒', {
						message: h('div', null, pTags),
						showCancelButton: true,
						type: 'warning'
					}).then(() => {
						//再次确认删除
						this.$prompt('请输入大写"MLC"', '再次确认删除', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							inputPattern: /^MLC$/,
							inputErrorMessage: '输入不正确'
						}).then(({value}) => {
							if (value === 'MLC') {
								this.deleteField(row.name, this.entity)
							}
						}).catch((err) => {
							console.error('eeee', err)
							this.$message({type: 'info', message: '已取消删除'});
						})
					}).catch(() => {
						this.$message({type: 'info', message: '已取消删除'});
					});
                }

			}
		},

		async deleteField(field, entity) {
            let res = await deleteField(field, entity);
            if(res && res.code == 200){
                this.$message.success('字段已删除')
				this.initTableData()
            }
		},

		onFieldSaved() {
			this.showNewFieldDialogFlag = false
			this.showEditFieldDialogFlag = false
			this.initTableData()
		},

		onCancelSaveField() {
			this.showNewFieldDialogFlag = false
			this.showEditFieldDialogFlag = false
		},

		async filterMainEntity(filterList, callBack) {
            let res = await getEntitySet();
            if(res && res.code == 200){
                let entityItems = res.data
				filterList.length = 0  /* 清空数组，不能用filterList=[]，否则SimpleTable显示不出数据！！ */
				filterList = entityItems.filter(entity => {
					if (entity.systemEntityFlag || entity.internalEntityFlag) {
						//
					} if (entity.detailEntityFlag === false) {
						filterList.push({name: entity.name, label: entity.label})
					}
				})

				callBack()
            }
		},

		/*
		modifyEntity() {
		  this.showEntityPropsDialogFlag = true
		},
		*/

		saveEntity() {
			//
		},

		cancelSaveEntity() {
			this.initEntityProps()
			this.showEntityPropsDialogFlag = false
		},

		modifyEntityLabel() {
			this.$prompt('修改实体显示名称', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputValue: this.entityProps.label,
				inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
				inputErrorMessage: '输入不正确'
			}).then(async ({value}) => {
                let res = await updateEntityLabel(this.entityProps.name, value);
                if(res && res.code == 200){
                    this.entityProps.label = value
                    getEntityList()
					this.$message({message: '修改成功', type: 'success'})
                }

			}).catch(() => {
				this.$message.info('已取消')
			})
		},

		async modifyEntityNameField() {
            let res = await getTextFieldList(this.entityProps.name);
            if(res && res.code == 200){
                this.nameFieldData = res.data
				this.showNameFieldDialogFlag = true
            }
		},

		async selectNameField(row) {
            let res = await updateEntityNameField(this.entityProps.name, row.name);
            if(res && res.code == 200){
                this.$message({message: '修改成功', type: 'success'})
				this.entityProps.nameField = row.label
				this.showNameFieldDialogFlag = false
				this.initTableData()
            }
		},

		searchTableData() {
			if (isEmptyStr(this.searchText)) {
				this.filteredData = copyNew(this.tableData)
				return
			}

			this.filteredData.length = 0
			this.filteredData = this.tableData.filter(item => {
				return item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
					item.label.toLowerCase().includes(this.searchText.toLowerCase()) ||
					item.physicalName.toLowerCase().includes(this.searchText.toLowerCase())
			})
		},

		clearTableSearch() {
			this.filteredData = copyNew(this.tableData)
		},

	}
}
</script>

<style lang="scss" scoped>
.el-container.hidden-x-scrollbar {
	overflow-x: hidden; /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
}

.entity-property {
	font-size: 12px;

	.entity-property-header {
		font-size: 14px;
		text-align: center;
		height: 54px;
		line-height: 54px;
		border-bottom: 1px dashed #eeeeee;
	}

	.entity-property-form {
		padding: 16px;
	}

	:deep(.el-input) > input {
		border-width: 0;
		text-align: right;
		/*border-bottom: 1px #cac6c6 solid;*/
	}
}

:deep(.el-main) {
	padding: 0;
}

.el-aside {
	background-color: #ffffff;
}

.props-scrollbar {
	height: 100%;

	:deep(.el-scrollbar__wrap) {
		overflow-x: hidden;
		overflow-y: auto; /* TODO: 待解决问题——IE浏览器垂直方向会生成两个滚动条：虚拟滚动条和真实滚动条 */
		/*overflow-y: hidden;*/
	}
}

.left-props-panel {
	width: 300px;
	height: 100%;
	margin-right: 0;
	border-right: 2px dotted #EBEEF5;
}

.list-search-panel {
	height: 62px !important;
	line-height: 62px;
	border-left: 1px solid #EBEEF5;
	margin-bottom: 0;
	justify-content: space-between;
}

.list-search-panel:after {
	content: "";
	display: block;
	clear: both;
}

.search-panel-left {
	display: flex;
}

.search-panel-right {
	width: 360px;

	/* 解决IE浮动元素垂直居中问题 begin */
	position: relative;
	height: 62px;

	:deep(.el-input.v-middle) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	/* end */
}

:deep(.el-table th.gutter) { /* 解决表头与内容列不对齐差1个像素的问题！！ */
	display: table-cell !important;
}

.name-field-dialog {
	.name-field-hint {
		font-size: 12px;
		color: #999999;
		margin: 0 10px 10px 0;
	}

	:deep(.el-dialog__header) {
		padding: 15px;
		padding-bottom: 3px;
	}

	:deep(.el-dialog__body) {
		padding: 6px;
	}
}
</style>
<style lang="scss">
.field-setting-dialog {
	.el-dialog__header {
		margin: 0;
		background-color: var(--el-color-primary) !important;

		.el-dialog__title {
			color: #fff;
		}
	}
}
</style>
