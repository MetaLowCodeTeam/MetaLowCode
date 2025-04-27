<template>
	<!--  -->
	<el-form-item
		label="表单回填"
		label-width="120px"
		v-if="optionModel.fillBackEnabled"
	>
		<el-button class="w-100" 
            @click="openFillBackDialog"
		>
            设置回填规则
        </el-button>
	</el-form-item>
	<!--  -->
	<mlDialog v-model="fillBackDialogConf.isShow" title="表单回填" width="760">
		<div v-loading="fillBackDialogConf.loading">
            <el-tabs v-model="activeTabName" class="demo-tabs">
                <el-tab-pane label="同级表单回填" name="mainTableFillBack">
                    <el-form-item
                        label-width="75"
                        :class="{
                            'has-row': fillBackDialogConf.fllBackItems.length > 0,
                        }"
                        style="align-items:normal"
                    >
                        <template #label>
                            <span class="form-label"> 回填规则 </span>
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                placement="bottom"
                            >
                                <template #content>
                                    1. 引用字段可以回填引用字段、文本字段； <br />
                                    2. 单选项可以回填单选项、文本字段； <br />
                                    3. 多选项可以回填多选项、文本字段； <br />
                                    4. 其他字段只可回填同类型字段。
                                </template>
                                <span class="fillBack-help-icon">
                                    <el-icon><QuestionFilled /></el-icon>
                                </span>
                            </el-tooltip>
                        </template>
                        <div class="row-box">
                            <el-scrollbar max-height="365px">
                                <div
                                    v-for="(
                                        item, inx
                                    ) of fillBackDialogConf.fllBackItems"
                                    :key="inx"
                                    :gutter="20"
                                    class="mb-10"
                                >
                                    <!-- 源字段 -->
                                    <el-select
                                        v-model="item.sourceField"
                                        placeholder="请选择源字段"
                                        style="width: 200px"
                                        size="default"
                                        :class="{ 'is-error': item.sourceError }"
                                        @focus="item.sourceError = false"
                                        clearable
                                        filterable
                                        @change="sourceFieldChange(item, inx)"
                                    >
                                        <el-option
                                            v-for="sourceOp in sourceColumn"
                                            :key="sourceOp.prop"
                                            :label="
                                                sourceOp.label +
                                                '(' +
                                                sourceOp.formFieldType +
                                                ')'
                                            "
                                            :value="sourceOp.prop"
                                        />
                                    </el-select>
                                    <!-- 标签 -->
                                    <div class="item-icon-div">
                                        <span class="item-icon-span">
                                            <el-icon><DArrowRight /></el-icon>
                                        </span>
                                    </div>
                                    <!-- 目标字段 -->
                                    <el-select
                                        v-model="item.targetField"
                                        placeholder="请选择目标字段"
                                        style="width: 200px"
                                        size="default"
                                        :class="{ 'is-error': item.targetError }"
                                        @focus="item.targetError = false"
                                        clearable
                                        filterable
                                        @change="targetFieldChange(item)"
                                    >
                                        <el-option
                                            v-for="targetOp in targetColumn"
                                            :key="targetOp.name"
                                            :label="
                                                targetOp.label +
                                                '(' +
                                                targetOp.fieldType +
                                                ')'
                                            "
                                            :disabled="
                                                selectedTargetColumn.includes(
                                                    targetOp.name
                                                ) ||
                                                !item.targetTypes.includes(
                                                    targetOp.fieldType
                                                )
                                            "
                                            :value="targetOp.name"
                                        />
                                    </el-select>
                                    <!-- 是否强制回填 -->
                                    <el-checkbox
                                        v-model="item.forceFillBack"
                                        size="default"
                                        class="force-fllbacl"
                                    >
                                        强制回填
                                        <el-tooltip
                                            class="box-item"
                                            effect="dark"
                                            content="勾选后无论目标字段是否有值都将强制回填"
                                            placement="bottom"
                                        >
                                            <span class="question-icon">
                                                <el-icon><QuestionFilled /></el-icon>
                                            </span>
                                        </el-tooltip>
                                    </el-checkbox>
                                    <!-- 删除 -->
                                    <div class="delete-btn" @click="delFllBack(inx)">
                                        <span class="delete-span-icon">
                                            <el-icon><Delete /></el-icon>
                                        </span>
                                    </div>
                                </div>
                            </el-scrollbar>
                        </div>
                        <div class="row-box row-btn">
                            <span class="ml-a-span" @click="addFllBack">+ 添加</span>
                        </div>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane 
                    label="子级表单回填" 
                    name="subFormFillBack"
                >
                    <el-row class="mb-10">
                        <el-button size="default" @click="openWidgetMappingDialog">添加明细回填映射</el-button>
                    </el-row>
                    <el-card 
                        shadow="never" 
                        v-for="(widgets,WidgetsInx) of widgetMappingList"
                        :key="WidgetsInx"
                    >
                        <template #header>
                            <div class="card-header">
                                <span>
                                    {{ `${widgets.sourceWidget.entityLabel}` }}
                                    <span class="info-text">回填到</span>
                                    {{ `${widgets.targetWidget.container?.options?.label}` }}
                                </span>
                                <div class="delete-btn" @click="subFormDelWidgets(WidgetsInx)">
                                    <span class="delete-span-icon">
                                        <el-icon><Delete /></el-icon>
                                    </span>
                                </div>
                                <div class="force-fill-back fr">
                                    <el-checkbox
                                        v-model="widgets.forceFillBack"
                                        size="default"
                                        class="force-fllbacl"
                                    >
                                        覆盖模式
                                        <el-tooltip
                                            class="box-item"
                                            effect="dark"
                                            content="覆盖模式会清空子表单现有数据，不覆盖则在现有数据后追加"
                                            placement="bottom"
                                        >
                                            <span class="question-icon">
                                                <el-icon><QuestionFilled /></el-icon>
                                            </span>
                                        </el-tooltip>
                                    </el-checkbox>
                                </div>
                            </div>
                        </template>
                        <el-form-item
                            label-width="75"
                            :class="{
                                'has-row': widgets.fllBackItems.length > 0,
                            }"
                            style="align-items:normal; position: relative;"
                        >
                            <template #label>
                                <span class="form-label"> 回填规则 </span>
                                <el-tooltip
                                    class="box-item"
                                    effect="dark"
                                    placement="bottom"
                                >
                                    <template #content>
                                        1. 选择源字段自动加载可回填的目标的字段； <br />
                                        2. 引用字段可以回填引用字段、文本字段； <br />
                                        3. 单选项可以回填单选项、文本字段； <br />
                                        4. 多选项可以回填多选项、文本字段； <br />
                                        5. 其他字段只可回填同类型字段。
                                    </template>
                                    <span class="fillBack-help-icon">
                                        <el-icon><QuestionFilled /></el-icon>
                                    </span>
                                </el-tooltip>
                            </template>
                            <div class="row-box">
                                <el-scrollbar max-height="365px">
                                    <div
                                        v-for="(
                                            item, inx
                                        ) of widgets.fllBackItems"
                                        :key="inx"
                                        :gutter="20"
                                        class="mb-10"
                                    >
                                        <!-- 源字段 -->
                                        <el-select
                                            v-model="item.sourceField"
                                            placeholder="请选择源字段"
                                            style="width: 250px"
                                            size="default"
                                            :class="{ 'is-error': item.sourceError }"
                                            @focus="item.sourceError = false"
                                            clearable
                                            filterable
                                            @change="subFormSourceFieldChange(item, inx, widgets)"
                                        >
                                            <el-option
                                                v-for="sourceOp in entityListFields[widgets.sourceWidget.entityCode]"
                                                :key="sourceOp.fieldName"
                                                :label="
                                                    sourceOp.fieldLabel +
                                                    '(' +
                                                    sourceOp.fieldType +
                                                    ')'
                                                "
                                                :value="sourceOp.fieldName"
                                            />
                                        </el-select>
                                        <!-- 标签 -->
                                        <div class="item-icon-div">
                                            <span class="item-icon-span">
                                                <el-icon><DArrowRight /></el-icon>
                                            </span>
                                        </div>
                                        <!-- 目标字段 -->
                                        <el-select
                                            v-model="item.targetField"
                                            placeholder="请选择目标字段"
                                            style="width: 250px"
                                            size="default"
                                            :class="{ 'is-error': item.targetError }"
                                            @focus="item.targetError = false"
                                            clearable
                                            filterable
                                            @change="targetFieldChange(item)"
                                        >
                                            <el-option
                                                v-for="targetOp in item.targetOps"
                                                :key="targetOp.name"
                                                :label="
                                                    targetOp.label +
                                                    '(' +
                                                    targetOp.fieldType +
                                                    ')'
                                                "
                                                :value="targetOp.name"
                                            />
                                        </el-select>
                                        <!-- 删除 -->
                                        <div class="delete-btn sub-form" @click="subFormDelFllBack(widgets, inx)">
                                            <span class="delete-span-icon">
                                                <el-icon><Delete /></el-icon>
                                            </span>
                                        </div>
                                    </div>
                                </el-scrollbar>
                            </div>
                            <div class="row-box row-btn">
                                <span class="ml-a-span" @click="addFllBack('subForm', widgets)">+ 添加</span>
                            </div>
                        </el-form-item>
                    </el-card>
                </el-tab-pane>
            </el-tabs>
			
		</div>
		<template #footer>
			<el-button
				@click="fillBackDialogConf.isShow = false"
				:loading="fillBackDialogConf.loading"
				size="default"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="confirmFllBack"
				size="default"
				:loading="fillBackDialogConf.loading"
			>
				确认
			</el-button>
		</template>
	</mlDialog>
    <!-- 映射组件回填 -->
    <mlDialog 
        v-model="widgetMappingDialogConf.show"
        title="明细实体回填映射关系"
        width="600"
    >
        <div v-loading="widgetMappingDialogConf.loading">
            <el-form-item
                label-width="75"
            >
                <template #label>
                    <span class="form-label"> 映射关系 </span>
                </template>
                <el-select 
                    v-model="widgetMappingDialogConf.sourceWidget"
                    placeholder="请选择源明细实体"
                    style="width: 200px"
                    size="default"
                    class="mr-15"
                    value-key="entityCode"
                >
                    <el-option
                        v-for="item in widgetMappingDialogConf.sourceWidgetList"
                        :key="item.entityCode"
                        :label="item.entityLabel"
                        :value="item"
                    />
                </el-select>
                <el-select 
                    v-model="widgetMappingDialogConf.targetWidget"
                    placeholder="请选择目标明细实体"
                    style="width: 200px"
                    size="default"
                    value-key="name"
                >
                    <el-option
                        v-for="item in allSubFormWidgets"
                        :key="item.name"
                        :label="item.container?.options.label"
                        :value="item"
                        :disabled="checkSubFormWidget(item)"
                    />
                </el-select>
            </el-form-item>
        </div>
        <template #footer>
			<el-button
				@click="widgetMappingDialogConf.show = false"
				size="default"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="confirmAddWidgetMapping"
				size="default"
			>
				确认
			</el-button>
		</template>
    </mlDialog>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;
import { refFieldQuery, queryEntityListFields } from "@/api/crud";
import { formFieldMapping } from "@/views/system/form-design/formFieldMapping";
import { queryEntityListByReferenceField } from '@/api/system-manager';
import { checkIsSubForm } from '@/utils/util';
export default {
	name: "reference-fillBackConfig-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	data() {
		return {
            entity:"",
            subFormName:"",
			defaultFllBackItem: {
				// 源字段
				sourceField: "",
				// 原字段类型
				sourceFieldType: "",
				sourceError: false,
				// 目标字段
				targetField: "",
				targetError: false,
				// 是否强制回填
				forceFillBack: false,
				// 明细实体名称
				targetSubForm: "",
				// 目标字段下拉选项
				targetTypes: [],
			},
			// 源列
			sourceColumn: [],
			// 目标列
			targetColumn: [],
			// 已选目标列
			selectedTargetColumn: [],
			// 回填弹框配置
			fillBackDialogConf: {
				isShow: false,
				loading: false,
				fllBackItems: [],
			},
            activeTabName: "mainTableFillBack",
            // 所有子表单
            allSubFormWidgets: [],
            // 所有子表单对应的字段
            allSubFormFields: {},
            // 映射组件弹框
            widgetMappingDialogConf: {
                show: false,
                loading: false,
                // 源实体组件
                sourceWidgetList: [],
                sourceWidget: {},
                targetWidget: {},
            },
            // 源实体Codes
            sourceEntityCodes: [],
            // 源实体对应的所有字段[] maps
            entityListFields: {},
            // 所有组件
            widgetMappingList: []
            
		};
	},
	inject: ["isSubFormChildWidget"],
	methods: {
		// 打开回填弹框
		openFillBackDialog() {
			this.fillBackDialogConf.isShow = true;
			let optionFillBackConfig = this.optionModel.fillBackConfig || [];
			// 加载已有数据
			this.fillBackDialogConf.fllBackItems = optionFillBackConfig.map(
				(el) => {
					this.selectedTargetColumn.push(el.targetField);
					let newItem = Object.assign({}, el);
					el.sourceError = false;
					el.targetError = false;
					return newItem;
				}
			);
            // 加载第二列数据
			this.loadTargetColumn();
			// 加载第一列数据
			this.loadSourceColumn();
            // 加载子表单回填数据
            this.loadSubFormFillBack();
		},
		// 加载第一列数据
		async loadSourceColumn() {
			this.fillBackDialogConf.loading = true;
			this.entity = this.subFormName || this.$route.query.entity;
			let refField = this.optionModel.name;
			let res = await refFieldQuery(this.entity, refField, 1, 10, "", null, null);
			if (res) {
				this.sourceColumn = res.data.columnList.map((el) => {
					el.formFieldType = formFieldMapping[el.type]?.type;
					return el;
				});
			}
			this.fillBackDialogConf.loading = false;
		},
		// 加载第二列数据
		loadTargetColumn() {
			// 1 获取表单上的字段组件
			let allFieldWidgets = Utils.getAllFieldWidgets(
				this.designer.widgetList
			);
			// 2. 用getAllContainerWidgets获取表达上的容器组件；
			let allContainerWidgets = Utils.getAllContainerWidgets(
				this.designer.widgetList
			);
			// 3. 遍历上述容器组件，找出子表单容器，type是sub-form或grid-sub-form；获取到子表单内部的字段组件；
			// 所有子表单字段组件
			let subFormWidgets = [];
			// 所有子表单字段名称
			let subFormFieldIds = [];
			// 多行子表单字段
			let gridSubFormIds = [];
            // 所有子表单组件
            this.allSubFormWidgets = [];
			allContainerWidgets.forEach((el) => {
				if (checkIsSubForm(el.type)) {
                    this.allSubFormWidgets.push(el);
                    this.allSubFormFields[el.name] = [];
					Utils.traverseFieldWidgetsOfContainer(
						el.container,
						(fw) => {
							let subFw = {
								name: fw.options.name,
								label: fw.options.label,
								targetSubForm: el.container.options.name,
								fieldType: fw.type,
								id: fw.id,
							};
                            this.allSubFormFields[el.name].push(subFw);
							subFormWidgets.push(subFw);
							subFormFieldIds.push(fw.id);
							if (el.type == "grid-sub-form") {
								gridSubFormIds.push(fw.id);
							}
						}
					);
				}
			});
			// 第2列字段
			let widgetList = [];
			// 取选中字段
			let selectedId = this.designer.selectedId;
			// 如果不是子表单 并且 多行子表单里没有这个选中的组件
			if (
				!this.isSubFormChildWidget() &&
				!gridSubFormIds.includes(selectedId)
			) {
				// 遍历所有字段，把自己和子表单字段排除
				allFieldWidgets.forEach((el) => {
					if (
						el.field.id != selectedId &&
						!subFormFieldIds.includes(el.field.id)
					) {
						widgetList.push({
							name: el.name,
							label: el.field.options.label,
							targetSubForm: "",
							fieldType: el.field.type,
						});
					}
				});
			}
			// 如果是子表单
			else {
				// 取当前子表单名称
				let targetSubForm = "";
				subFormWidgets.forEach((el) => {
					if (el.id == selectedId) {
						targetSubForm = el.targetSubForm;
                        this.subFormName = el.targetSubForm;
					}
				});
				// 取自身子表单所有字段组件，且把自身过滤掉
				subFormWidgets.forEach((el) => {
					if (
						el.targetSubForm == targetSubForm &&
						el.id != selectedId
					) {
						widgetList.push(el);
					}
				});
			}
			this.targetColumn = [...widgetList];
		},
		// 源字段切换
		sourceFieldChange(item, inx) {
			let findColumn = this.sourceColumn.filter(
				(el) => el.prop == item.sourceField
			);
			item.sourceFieldType = findColumn[0]
				? findColumn[0].formFieldType
				: "";
			this.selectedTargetColumn.splice(inx, 1);
			// 字段一对一(只能回填类型跟他一样的)
			item.targetTypes = [item.sourceFieldType];
			item.targetField = "";
            item.targetError = false;
		},
		// 目标字段切换
		targetFieldChange(item) {
			let findColumn = this.targetColumn.filter(
				(el) => el.name == item.targetField
			);
			item.targetSubForm = findColumn[0]
				? findColumn[0].targetSubForm
				: "";
			this.selectedTargetColumn.push(item.targetField);
		},
		// 首字母大写
		capitalizeFirstLetter(string) {
			if (!string) {
				return "";
			}
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		// 添加回填
		addFllBack(target, widgets) {
            // 子表单回填
            if(target == 'subForm'){
                let newDefaultFllBackItem = JSON.parse(JSON.stringify(this.defaultFllBackItem));
                newDefaultFllBackItem.targetOps = [];
                widgets.fllBackItems.push(newDefaultFllBackItem)
            }else {
                this.fillBackDialogConf.fllBackItems.push(
                    JSON.parse(JSON.stringify(this.defaultFllBackItem))
                );
            }
			
		},
		// 删除回填
		delFllBack(inx) {
			this.fillBackDialogConf.fllBackItems.splice(inx, 1);
			this.selectedTargetColumn.splice(inx, 1);
		},
		// 回填弹框确认
		confirmFllBack() {
			// 把至少选了1个的给过滤出来
			let fllBackItems = this.fillBackDialogConf.fllBackItems.filter(
				(el) => el.sourceField || el.targetField
			); 
			// 如果有数据
			if (fllBackItems.length > 0) {
				// 遍历数据
				for (let index = 0; index < fllBackItems.length; index++) {
					const el = fllBackItems[index];
					// 如果源字段为空，标红
					if (!el.sourceField) {
						el.sourceError = true;
                        this.activeTabName ="mainTableFillBack";
						return;
					}
					// 如果目标字段为空，标红
					if (!el.targetField) {
						el.targetError = true;
                        this.activeTabName = "mainTableFillBack";
						return;
					}
				}
				this.optionModel.fillBackConfig = fllBackItems.map((el) => {
					let newItem = Object.assign({}, el);
					delete newItem.sourceError;
					delete newItem.targetError;
					return newItem;
				});
			} else {
				this.optionModel.fillBackConfig = [];
			}
            // 子表单回填检测
            for (let index = 0; index < this.widgetMappingList.length; index++) {
                const fllBackItems = this.widgetMappingList[index]?.fllBackItems || [];
                for (let subInx = 0; subInx < fllBackItems.length; subInx++) {
                    const el = fllBackItems[subInx];
                    // 如果源字段为空，标红
					if (!el.sourceField) {
						el.sourceError = true;
                        this.activeTabName ="subFormFillBack";
						return;
					}
					// 如果目标字段为空，标红
					if (!el.targetField) {
						el.targetError = true;
                        this.activeTabName = "subFormFillBack";
						return;
					}
                }
            }
            let subFormFillBackConfig = [];
            this.widgetMappingList.forEach(el => {
                subFormFillBackConfig.push({
                    fllBackItems: el.fllBackItems.map((subEl) => {
                        return {
                            sourceField: subEl.sourceField,
                            targetField: subEl.targetField
                        };
                    }),
                    sourceWidget: {
                        entityLabel: el.sourceWidget.entityLabel,
                        entityCode: el.sourceWidget.entityCode,
                        entityName: el.sourceWidget.entityName
                    },
                    targetWidget: {
                        name: el.targetWidget.name,
                        container: { 
                            options: {
                                label: el.targetWidget?.container?.options?.label
                            }   
                        }
                    },
                    forceFillBack: el.forceFillBack,
                })
            })
            this.optionModel.subFormFillBackConfig = Object.assign([], subFormFillBackConfig);
            this.fillBackDialogConf.isShow = false;
        },
        /**
         * 子表单回填相关
         */
        // 打开映射组件弹框
        async openWidgetMappingDialog(){
            this.widgetMappingDialogConf.show = true;
            this.widgetMappingDialogConf.loading = true;
            let fieldName = this.selectedWidget.options.name;
            this.widgetMappingDialogConf.sourceWidget = {};
            this.widgetMappingDialogConf.targetWidget = {};
            let res = await queryEntityListByReferenceField(this.entity, fieldName);
            if(res){
                this.widgetMappingDialogConf.sourceWidgetList = res.data || [];
            }
            this.widgetMappingDialogConf.loading = false;
        },
        // 确认映射
        confirmAddWidgetMapping() {
            let { sourceWidget, targetWidget } = this.widgetMappingDialogConf;
            this.sourceEntityCodes.push(sourceWidget.entityCode)
            this.loadSourceEntityFields(
                ()=> {
                    this.widgetMappingList.push({
                        sourceWidget,
                        targetWidget,
                        fllBackItems:[],
                        forceFillBack: false,
                    });
                    this.widgetMappingDialogConf.show = false;
                }
            );
        },
        // 加载所有源实体对应的字段
        async loadSourceEntityFields(cb){
            this.widgetMappingDialogConf.loading = true;
            this.fillBackDialogConf.loading = true;
            let res = await queryEntityListFields(this.sourceEntityCodes, false, true, true);
            if(res){
                this.entityListFields = res.data || {};
                if(cb){
                    cb();
                }
            }
            this.widgetMappingDialogConf.loading = false;
            this.fillBackDialogConf.loading = false;
        },
        // 子表单回填-源字段切换
        subFormSourceFieldChange(item, inx, widgets, target){
            // 1 根据当前字段名称找到源字段数据
            let findSourceField = this.entityListFields[widgets.sourceWidget.entityCode].filter((el) => item.sourceField == el.fieldName);
            // 2 取源字段的字段类型
            let fieldType = findSourceField[0]?.fieldType;
            // 3 找到源字段可回填的目标字段
            let targetType = formFieldMapping[fieldType]?.type;
            // 4 如果不是 init 清空欲回填的字段以及欲回填的字段下拉数据
            if(target !== 'init'){
                widgets.fllBackItems[inx].targetField = "";
                widgets.fllBackItems[inx].targetError = false;
            }
            widgets.fllBackItems[inx].targetOps = [];
            // 5 判断如果有没有选择 源字段
            if(fieldType){
                let allSubFormFields = this.allSubFormFields[widgets.targetWidget.name];
                if(fieldType == 'PrimaryKey'){
                    widgets.fllBackItems[inx].targetOps = allSubFormFields.filter(el=> el.fieldType == 'reference');
                }
                else {
                    widgets.fllBackItems[inx].targetOps = allSubFormFields.filter(el=> el.fieldType == targetType);
                }
            }
            // 5.1 如果没有选择，直接返回全部的待回填 方便展示
            else {
                this.allSubFormFields[widgets.targetWidget.name].forEach( el => {
                    widgets.fllBackItems[inx].targetOps.push(el);
                })
            }
        },
        // 子表单回填-检测是否存在回填实体
        checkSubFormWidget(item){
            let hsaWidget = false;
            let findWidget = this.widgetMappingList.filter(el => el.targetWidget.name == item.name);
            if(findWidget && findWidget.length > 0){
                return true;
            }
            return hsaWidget;
        },
        // 子表单回填-删除回填实体
        subFormDelWidgets(inx){
            this.widgetMappingList.splice(inx, 1);
        },
        // 子表单回填- 删除回填规则
        subFormDelFllBack(widgets, inx){
            widgets.fllBackItems.splice(inx, 1);
        },
        // 加载子表单回填数据
        loadSubFormFillBack(){
            this.widgetMappingList = Object.assign([], this.optionModel.subFormFillBackConfig);
            this.sourceEntityCodes = [];
            this.widgetMappingList.forEach(el => {
                this.sourceEntityCodes.push(el.sourceWidget.entityCode)
            })
            this.loadSourceEntityFields(() => {
                this.widgetMappingList.forEach(el => {
                    el.fllBackItems.forEach((subEl, subInx) => {
                        this.subFormSourceFieldChange(subEl, subInx, el, 'init')
                    })
                })
            });
        },
	},
};
</script>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
	height: 32px;
}
.fillBack-help-icon {
	position: relative;
	top: 5px;
	margin-left: 3px;
	cursor: pointer;
	font-size: 14px;
}
.form-label {
	line-height: 32px;
	font-size: 14px;
	position: relative;
}
.has-row {
	.form-label {
		top: 3px;
	}
	.fillBack-help-icon {
		top: 8px;
	}
}
.delete-btn {
    float: right;
    width: 23px;
    height: 23px;
    box-sizing: border-box;
    border: 1px solid #747679;
    margin-top: 8px;
    border-radius: 50%;
    text-align: center;
    font-size: 13px;
    cursor: pointer;
    &.sub-form {
        margin-top: 5px;
    }
    .delete-span-icon {
        color: #747679;
        position: relative;
        top: -3px;
    }
    &:hover {
        background: #747679;
        .delete-span-icon {
            color: #fff;
        }
    }
}
.row-box {
	width: 100%;
	box-sizing: border-box;
	line-height: 32px;
	font-size: 14px;
	&.row-btn {
		padding-left: 10px;
	}
	.item-icon-div {
		display: inline-block;
		height: 32px;
		width: 40px;
		text-align: center;
		.item-icon-span {
			position: relative;
			top: 4px;
		}
	}
	.force-fllbacl {
		margin-left: 20px;
		position: relative;
		top: 3px;
		.question-icon {
			position: relative;
			top: 1px;
		}
	}
	
}
:deep(.el-card__header){
    padding: 10px 15px;
}
.card-header {
    font-size: 14px;
    .delete-btn {
        margin-top: 2px;
        .delete-span-icon {
            top: 1px;
        }
    }
    .force-fill-back {
        margin-right: 15px;
        margin-top: -3px;
        .question-icon {
            position: relative;
            top: 2px;
        }
    }
}
</style>
