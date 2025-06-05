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
										<el-button
                                            link
                                            type="primary"
                                            icon="el-icon-edit"
                                            title="修改显示名称"
											@click="modifyEntityLabel"
                                        >
                                        </el-button>
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
										<el-button
                                            link
                                            type="primary"
                                            icon="el-icon-edit"
                                            title="修改名称字段"
                                            @click="modifyEntityNameField">
                                        </el-button>
									</template>
								</el-input>
							</el-form-item>
                            <el-form-item label="排序字段：" v-if="entityProps.detailEntityFlag">
								<el-input link type="primary" v-model="entityProps.displayOrderFieldLabel" :readonly="true">
									<template #suffix>
										<el-button
                                            link
                                            type="primary"
                                            icon="el-icon-edit"
                                            title="修改排序字段"
                                            @click="modifyEntityOrderField">
                                        </el-button>
									</template>
								</el-input>
							</el-form-item>
                            <!-- this.entityProps -->
							<!-- <el-form-item label="允许设计表单：">
								<el-switch v-model="entityProps.layoutable" style="float: right" disabled></el-switch>
							</el-form-item>
							<el-form-item label="允许设计列表：">
								<el-switch v-model="entityProps.listable" style="float: right" disabled></el-switch>
							</el-form-item> -->
							<el-form-item label="开启记录级权限：">
								<el-switch v-model="entityProps.authorizable" style="float: right" disabled></el-switch>
							</el-form-item>
							<el-form-item label="是否明细实体：">
								<el-switch
                                    v-model="entityProps.detailEntityFlag"
                                    style="float: right"
									disabled
                                >
                                </el-switch>
							</el-form-item>
                            <!-- <el-form-item label="开启流程审批：">
								<el-switch
                                    v-model="openApprovalField"
                                    style="float: right"
									:disabled="openApprovalField"
                                    :before-change="toOpenApprovalField"
                                >
                                </el-switch>
							</el-form-item> -->
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
								<el-input
                                    link
                                    type="primary"
                                    v-model="entityProps.mainEntity.label"
									disabled
                                >
                                </el-input>
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

		<el-container v-loading="mainLoading">
			<el-header class="list-search-panel">
				<div class="search-panel-left">
					<AddField 
                        @onFieldSaved="onFieldSaved" 
                        :entity="entity" 
                        :entityProps="entityProps"
                        ref="addFieldRef"
                    />
				</div>
				<div style="flex: 1"></div>
				<div class="search-panel-right">
					<el-input
                        link
                        type="primary"
                        v-model="searchText"
                        :clearable="true"
                        @clear="clearTableSearch"
						class="v-middle"
						@keyup.enter="searchTableData"
                        size="small"
                        placeholder="请输入关键词搜索"
                    >
						<template #append>
							<el-button icon="el-icon-search" @click="searchTableData"></el-button>
						</template>
					</el-input>
				</div>
                <el-button class="ml-10" type="primary" @click="goFormDesign" v-if="!entityProps.detailEntityFlag && !isAppManagement">表单设计</el-button>
			</el-header>

			<el-main ref="tableContainer">
				<div>
					<SimpleTable
                        :columns="columns"
                        :data="filteredData"
                        :show-pagination="false"
						:show-check-box="false"
						:show-operation-column="true"
						:height="'100%'"
                        table-size="small"
                        table-width="100% !important"
                    >
						<template #table_operation="{scope}">
							<template v-if="!scope.row['reserved']">
								<el-button
                                    type="primary"
                                    link
                                    size="small"
                                    icon="el-icon-edit"
									@click="editTableData(scope.row)"
                                >
                                    修改
								</el-button>
								<el-button
                                    type="primary"
                                    link
                                    size="small"
                                    icon="el-icon-delete"
									@click="deleteTableData(scope.row)"
                                >
                                    删除
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

			<ml-dialog
                :title="fieldDialogFlagType == 1 ? '修改名称字段' : '修改排序字段'"
                v-model="showNameFieldDialogFlag"
                v-if="showNameFieldDialogFlag"
				:append-to-body="true"
                :destroy-on-close="true"
                class="name-field-dialog"
                width="486px"
                draggable
            >
				<div class="name-field-hint">
                    <i class="el-icon-bell"></i>
                    <span v-if="fieldDialogFlagType == 1">提示：只有文本(Text)类型字段可设置为名称字段。</span>
                    <span v-else>提示：只有数值({{ allowOrderField.join('、') }})类型字段可设置为排序字段。</span>
				</div>
                <div v-if="fieldDialogFlagType == 2">
                    <el-form label-position="left" :label-width="'100px'" size="small">
                        <el-form-item label="自动排序：">
                            <el-switch v-model="entityProps.detailEntityAutoDisplayOrder" :disabled="entityProps.displayOrderFieldType !== 'Decimal'"></el-switch>
                            <el-tooltip placement="top">
                                <template #content>
                                    <div>
                                        只有排序字段为数值(Decimal)时，自动排序才有能开启<br>
                                        开启字段排序后，排序字段会自动赋值保证数据按添加顺序排列
                                    </div>
                                </template>
                                <el-icon size="16" class="ml-10" style="cursor: default">
                                    <Warning />
                                </el-icon>
                            </el-tooltip>
                        </el-form-item>
                        <el-form-item label="排序顺序：" v-if="!entityProps.detailEntityAutoDisplayOrder">
                            <el-select 
                                v-model="entityProps.detailEntityDisplayOrderIsAsc"
                            >
                                <el-option label="升序" :value="true"></el-option>
                                <el-option label="降序" :value="false"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
				<SimpleTable
                    :show-pagination="false"
                    :show-check-box="false"
                    :table-size="'small'"
					:show-operation-column="true"
					:columns="nameFieldColumns"
                    :data="nameFieldData"
                    :max-height="420"
                    :table-width="'100%'"
                >
					<template #table_operation="{scope}">
						<el-button
                            v-if="!scope.row.nameFieldFlag"
                            class=""
                            icon="el-icon-check"
							@click="fieldDialogFlagType == 1 ? selectNameField(scope.row) : selectOrderField(scope.row)"
                        >
                            选择
						</el-button>
						<el-button v-else :disabled="true">
                            <span v-if="fieldDialogFlagType == 1">当前名称字段</span>
                            <span v-else>当前排序字段</span>
                        </el-button>
					</template>
				</SimpleTable>
                <template #footer v-if="fieldDialogFlagType == 2">
                    <el-button @click="showNameFieldDialogFlag = false">取 消</el-button>
                    <el-button type="primary" @click="selectNameField(currentOrderField)">保 存</el-button>
                </template>
			</ml-dialog>
			<el-dialog
                title="编辑实体属性"
                v-model="showEntityPropsDialogFlag"
                v-if="showEntityPropsDialogFlag"
				:show-close="false"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
				:destroy-on-close="true"
                draggable
            >
				<EntityPropEditor
                    ref="EPEditor"
                    :entityProps="entityProps"
                    :show-title="false"
					:filter-entity-method="filterMainEntity"
                >
                </EntityPropEditor>
				<template #footer>
					<div class="dialog-footer">
						<el-button type="primary" @click="saveEntity">保 存</el-button>
						<el-button @click="cancelSaveEntity">取 消</el-button>
					</div>
				</template>
			</el-dialog>
		</el-container>

        <!-- 设置标签 -->
        <ml-dialog 
            v-model="addTagDialogIsShow" 
            title="设置标签" 
            width="400"
            draggable
        >
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
                    <el-button
                        v-else
                        class="mb-5 button-new-tag ml-1"
                        @click="showInput"
                        :disabled="allTags?.length > 49"
                    >
                        + 新增标签
                    </el-button>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button
                        type="primary"
                        @click="setConfirmTags"
                        v-loading="addTagDialogLoading"
                    >
                        确 定
                    </el-button>
                    <el-button
                        @click="addTagDialogIsShow = false"
                        v-loading="addTagDialogLoading"
                    >
                        取 消
                    </el-button>
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
    updateDisplayOrderField,
    fieldCanBeDeleted,
    deleteField,
    fieldCanBeEdited,
    updateEntityTags,
    getAllTagsOfEntity
} from '@/api/system-manager'
import { createApprovalSystemFields } from "@/api/approval";
import {formatBooleanColumn, isEmptyStr, copyNew} from '@/utils/util'
import EntityPropEditor from "@/views/system/entity-editor/entity-property-editor.vue";
import {h} from 'vue';
import useCommonStore from "@/store/modules/common";
// 新增字段
import AddField from "@/components/mlFormDesignComp/AddField.vue";
const { getEntityList } = useCommonStore();
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
export default {
	name: "EntityFieldTable",
	components: {
		EntityPropEditor,
		AddField,
	},
    props: {
        isAppManagement: {
            type: Boolean,
            default: false
        }
    },
	data() {
		return {
			columns: [
				{prop: 'name', label: '字段名称', width: '130', align: 'left', fixed: true},
				{prop: 'label', label: '显示名称', align: 'center'},
				{prop: 'physicalName', label: '数据库字段名', align: 'left'},
				{prop: 'type', label: '字段类型', width: '100', align: 'left'},
				{prop: 'referTo', label: '引用实体', width: '120', align: 'center'},
				{
					prop: 'idFieldFlag',
					label: '主键字段',
					width: '80',
					align: 'center',
					formatter: formatBooleanColumn
				},
				{
					prop: 'nameFieldFlag',
					label: '名称字段',
					width: '80',
					align: 'center',
					formatter: formatBooleanColumn
				},
				{
					prop: 'mainDetailFieldFlag',
					label: '主从字段',
					width: '80',
					align: 'center',
					formatter: formatBooleanColumn
				},
				{
					prop: 'nullable',
					label: '允许空值',
					width: '80',
					align: 'center',
					formatter: formatBooleanColumn
				},
				{
					prop: 'reserved',
					label: '系统字段',
					width: '80',
					align: 'center',
					formatter: formatBooleanColumn
				},
			],
			tableData: [],
			filteredData: [],
			searchText: '',
			tableHeight: 100,
			showNameFieldDialogFlag: false,
            // 1 修改名称 2 修改排序
            fieldDialogFlagType: 1,
			showEntityPropsDialogFlag: false,
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
            mainLoading: false,
            allTags:[],
            addTagDialogIsShow:false,
            addTagDialogLoading:false,
            inputVisible:false,
            tagValue:"",
            // 开启审批字段
            openApprovalField: false,
            // 允许排序的字段类型
            allowOrderField: ['Integer', 'Decimal', 'Money', 'Text', 'Date', 'DateTime'],
            // 当前排序字段
            currentOrderField: null,
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
                this.tableHeight = this.$refs.tableContainer.$el?.offsetHeight - 42 + 42/*覆盖表格页脚高度*/
            }
		},

        // 进入表单设计
        goFormDesign(){
            const appPath = import.meta.env.VITE_APP_PATH;
            this.$router.push({
                path:appPath + "form-design",
                query:{
                    entity: this.entityProps.name,
                    entityLabel: this.entityProps.label
                }
            })
        },

		async initEntityProps() {
            this.propsLoading = true;
			let res = await getEntityProps(this.entity)
            if(res && res.data){
                this.entityProps = res.data
                this.entityProps.tags = res.data.tags ? res.data.tags.split(",") : [];
                this.getAllTags();
                
            }
            this.propsLoading = false;
		},

		async initPageData() {
			await this.initEntityProps()
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
		async initTableData() {
            this.mainLoading = true;
			let res = await getFieldListOfEntity(this.entity);
            if(res){
                this.tableData = res.data
                this.filteredData = copyNew(this.tableData)
                this.searchText = '';
                // 查找是否有审批字段
                let findApprovalStatus = this.tableData.filter(el => el.name == 'approvalStatus');
                this.openApprovalField = findApprovalStatus.length > 0;
                this.entityProps.displayOrderFieldType = this.tableData.find(el => el.name == this.entityProps.displayOrderField)?.type;
                if(this.entityProps.displayOrderFieldType !== 'Decimal') {
                    this.entityProps.detailEntityAutoDisplayOrder = false;
                }
            }
            this.mainLoading = false;
		},

		async editTableData(row) {
			if (!!row.type) {
				let res = await fieldCanBeEdited(row.name, this.entity)
                if(res && res.code == 200){
                    if (res.data !== true) {
						this.$message.info('提示：系统字段/保留字段不能编辑！')
						return
					}
                    this.$refs.addFieldRef.handleNewFieldCommand(row.type + 'WE', row.name)
                }
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
			this.initTableData()
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
                this.fieldDialogFlagType = 1;
				this.showNameFieldDialogFlag = true
            }
		},

        modifyEntityOrderField() {
            let decimalField = this.tableData.filter(el => this.allowOrderField.includes(el.type));
            this.currentOrderField = null;
            let orderField = decimalField.map((el) => {
                if(this.entityProps.displayOrderField == el.name){
                    this.currentOrderField = el;
                }
                return {
                    name: el.name,
                    label: el.label,
                    nameFieldFlag: this.entityProps.displayOrderField == el.name,
                    type: el.type,
                }
            })
            this.nameFieldData = orderField;
            this.fieldDialogFlagType = 2;
            this.showNameFieldDialogFlag = true
        },
        // 选择排序字段
        selectOrderField(row){
            this.nameFieldData.forEach(el=>{
                el.nameFieldFlag = false;
                if(el.name == row.name){
                    el.nameFieldFlag = true;
                }
            })
            this.currentOrderField = row;
            this.entityProps.displayOrderFieldType = row.type;
        },
		async selectNameField(row) {
            let res
            if(this.fieldDialogFlagType == 1){
                res = await updateEntityNameField(this.entityProps.name, row.name);
            }
            else {
                res = await updateDisplayOrderField(
                    this.entityProps.name, 
                    row.name,
                    this.entityProps.detailEntityAutoDisplayOrder,
                    this.entityProps.detailEntityDisplayOrderIsAsc
                );
            }
            if(res && res.code == 200){
                this.$message({message: '修改成功', type: 'success'})
                if(this.fieldDialogFlagType == 1){
                    this.entityProps.nameField = row.label
                }
                else {
                    this.entityProps.displayOrderFieldLabel = row.label
                    this.entityProps.displayOrderField = row.name
                }
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

        // 开启审批字段
        toOpenApprovalField(){


            return new Promise((resolve) => {
                this.$confirm(
                    "是否确认开启流程审批?",
                    "开启流程审批确认",
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        type: 'info',
                    }
                ).then(async () => {
                    this.propsLoading = true;
                    let res = await createApprovalSystemFields(this.entity);
                    if(res){
                        this.initTableData()
                        this.propsLoading = false;
                        return resolve(true)
                    }else {
                        this.propsLoading = false;
                        return resolve(false)
                    }

                })
                .catch(() => {
                    return resolve(false)
                })

            })
        }

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
    padding: 0;
	.el-dialog__header {
		margin: 0;
		background-color: var(--el-color-primary) !important;
        padding: 0px 20px;
        height: 60px;
        line-height: 66px;
        box-sizing: border-box;
		.el-dialog__title {
			color: #fff;
		}
        .el-dialog__headerbtn:focus .el-dialog__close, .el-dialog__headerbtn:hover .el-dialog__close {
            color: #fff;
        }
	}
}
</style>
