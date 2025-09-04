<template>
	<!--  -->
	<el-form-item
		label="开启在位输入搜索"
		label-width="120px"
		v-if="!optionModel.useTreeDataSelect && !isDashboard"
	>
		<el-switch
			v-model="optionModel.openSearchInPlace"
		/>
	</el-form-item>
   
	<el-form-item
		label="搜索字段"
		label-width="120px"
		v-loading="loading"
        v-if="optionModel.openSearchInPlace"
	>
		<el-button @click="handleSearchField" class="w-100">
			{{ getQueryFieldLabel() }}
		</el-button>
	</el-form-item>
    <el-form-item 
        label="回车开始查询"
        label-width="120px"
        v-if="optionModel.openSearchInPlace"
    >
        <el-switch
            v-model="optionModel.enterStartSearch"
        />
        <el-tooltip
            content="默认输入后立即查询数据，开启选项后按回车键才查询数据。"
            placement="top"
        >
            <el-icon size="16" class="ml-5">
                <QuestionFilled />
            </el-icon>
        </el-tooltip>
    </el-form-item>
     <!--  -->
	<el-form-item
		label="移动端扫码回填"
		label-width="120px"
		v-if="!optionModel.useTreeDataSelect && !isDashboard"
	>
		<el-switch
			v-model="optionModel.openScanFillBack"
		/>
	</el-form-item>
	<ml-dialog title="选择搜索字段" v-model="isShow" width="700" append-to-body>
		<div
			v-loading="loading"
			element-loading-text="字段加载中..."
			class="pb-5 ml-scrollbar"
		>
			<el-row :gutter="20">
				<el-col
					:span="8"
					v-for="(item, index) in fieldList"
					:key="index"
				>
					<el-checkbox
						v-model="item.isSelected"
						:label="item.label"
						size="default"
					/>
				</el-col>
			</el-row>
		</div>
		<template #footer>
			<el-button @click="isShow = false" size="default">取消</el-button>
			<el-button
				type="primary"
				@click="handleSearchFieldConfirm"
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
import common from "@/api/common";
import { checkIsSubForm } from '@/utils/util';
export default {
	name: "reference-fillBackEnabled-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

	data() {
		return {
			loading: false,
			fieldList: [],
			isShow: false,
		};
	},
    inject: ["isSubFormChildWidget", "getDesignerConfig"],
    computed: {
        isDashboard() {
            return this.getDesignerConfig().isDashboard;
        }
    },
	methods: {
        getQueryFieldLabel() {
            if(this.optionModel.searchFields?.length > 0) {
                return '已设置字段 ' + this.optionModel.searchFields.length + ' 个';
            }
            return '选择搜索字段';
        },
		async handleSearchField() {
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
				if (checkIsSubForm(el.type)) {
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
			this.isShow = true;
			this.loading = true;
			let param = {
				entity: paramEntity,
				refField: this.optionModel.name,
				queryReference: true,
			};
			let res = await common.getFieldListByRefField(param);
			if (res) {
				let newList = res.data || [];

				let showType = [
					"TextArea",
					"Text",
					"Money",
					"Decimal",
					"Integer",
				];
				this.fieldList = newList.filter((item) =>
					showType.includes(item.type)
				);
				this.fieldList.map((item) => {
					item.isSelected = false;
					if (
						this.optionModel.searchFields &&
						this.optionModel.searchFields.includes(item.name)
					) {
						item.isSelected = true;
					}
				});
			}
			this.loading = false;
		},
		handleSearchFieldConfirm() {
			this.optionModel.searchFields = this.fieldList
				.filter((item) => item.isSelected)
				.map((item) => item.name);
			if (!this.optionModel.searchFields || this.optionModel.searchFields.length === 0) {
				this.optionModel.openSearchInPlace = false;
			}
			this.isShow = false;
		},
	},
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
.ml-scrollbar {
	max-height: 400px;
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
