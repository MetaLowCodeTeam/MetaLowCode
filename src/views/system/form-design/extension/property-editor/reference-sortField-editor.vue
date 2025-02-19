<template>
	<!--  -->
	<el-form-item
		label="排序条件"
		label-width="120px"
		v-if="!optionModel.useTreeDataSelect"
	>
		<!-- <el-switch v-model="optionModel.fillBackEnabled" /> -->
		<el-button class="w-100" @click="openSortDialog" v-if="!optionModel.sortField">
			设置排序字段
		</el-button>
		<el-button class="w-100" @click="openSortDialog" v-else>
			{{ optionModel.sortFieldLabel }}（{{ optionModel.sortOrder || '默认' }}）
		</el-button>
	</el-form-item>
	<ml-dialog v-model="sortDialogConf.isShow" title="设置排序字段" width="500">
		<div v-loading="sortDialogConf.loading">
			<el-form>
				<el-form-item label="排序字段">
					<el-select
						v-model="sortDialogConf.sortField"
						placeholder="请选择排序字段"
						clearable
					>
						<el-option
							v-for="item in fieldItems"
							:key="item.name"
							:label="item.label"
							:value="item.name"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="排序顺序">
					<el-select
						v-model="sortDialogConf.sortOrder"
						placeholder="请选择排序顺序"
					>
						<el-option label="升序" value="ASC" />
						<el-option label="降序" value="DESC" />
					</el-select>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="sortDialogConf.isShow = false" size="default">
				取消
			</el-button>
			<el-button
				type="primary"
				@click="onConfirm"
				size="default"
			>
				确定
			</el-button>
		</template>
	</ml-dialog>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;
import { getRefFieldExtras } from "@/api/system-manager";
export default {
	name: "reference-fillBackEnabled-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	inject: ["isSubFormChildWidget"],
	data() {
		return {
			sortDialogConf: {
				isShow: false,
				loading: false,
                sortField: "",
                sortOrder: "",
			},
			fieldItems: [],
		};
	},
	methods: {
        onConfirm() {
            this.sortDialogConf.isShow = false;
            this.optionModel.sortField = this.sortDialogConf.sortField;
            this.optionModel.sortOrder = this.sortDialogConf.sortOrder;
            this.optionModel.sortFieldLabel = this.fieldItems.find(item => item.name == this.sortDialogConf.sortField)?.label;
        },
		async openSortDialog() {
			let paramEntity = "";
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
				if (el.type == "sub-form" || el.type == "grid-sub-form") {
					this.allSubFormWidgets.push(el);
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
							subFormWidgets.push(subFw);
							subFormFieldIds.push(fw.id);
							if (el.type == "grid-sub-form") {
								gridSubFormIds.push(fw.id);
							}
						}
					);
				}
			});
			// 取选中字段
			let selectedId = this.designer.selectedId;
			// 如果不是子表单 并且 多行子表单里没有这个选中的组件
			if (
				!this.isSubFormChildWidget() &&
				!gridSubFormIds.includes(selectedId)
			) {
				paramEntity = this.$route.query.entity;
			}
			// 如果是子表单
			else {
				subFormWidgets.forEach((el) => {
					if (el.id == selectedId) {
						paramEntity = el.targetSubForm;
					}
				});
			}
			this.sortDialogConf.isShow = true;
			this.sortDialogConf.loading = true;
			// 通过引入字段，当前实体获取引入字段的实体
			let refRes = await getRefFieldExtras(
				this.optionModel.name,
				paramEntity
			);
			if (refRes) {
				this.fieldItems = refRes.data.fieldItems;
                if(!this.optionModel.sortOrder) {
                    this.sortDialogConf.sortOrder = "ASC";
                }
			}
			this.sortDialogConf.loading = false;
			// this.sortDialogConf.isShow = true;
		},
	},
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
</style>
