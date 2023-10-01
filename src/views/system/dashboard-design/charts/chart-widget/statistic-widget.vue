<template>
	<static-content-wrapper
		:designer="designer"
		:field="field"
		:design-state="designState"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
		:sub-form-row-index="subFormRowIndex"
		:sub-form-col-index="subFormColIndex"
		:sub-form-row-id="subFormRowId">
		<div class="card-panel" :style="{'justify-content':field.options.showIcon?'space-between':'center'}">
			<div class="card-panel-icon-wrapper icon-color" v-if="field.options.showIcon"
				 :style="{'color':field.options.iconColor,'--hover-color': field.options.iconColor }">
				<el-icon>
					<component :is="field.options.icon"/>
				</el-icon>
			</div>
			<div class="card-panel-description">
				<div class="card-panel-text">
					{{ field.options.label }}
				</div>
				<div>
					<count-up :startVal="0" :endVal="field.options.value" class="card-panel-num">
					</count-up>
				</div>
			</div>
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const {StaticContentWrapper, emitter, i18n, fieldMixin, Utils} = VisualDesign.VFormSDK
const {getDSByName, overwriteObj, runDataSourceRequest} = Utils

import CountUp from 'vue-countup-v3';

export default {
	name: "statistic-widget",
	componentName: "FieldWidget", //必须固定为FieldWidget，用于接收父级组件的broadcast事件
	mixins: [emitter, fieldMixin, i18n],
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,

		designState: {
			type: Boolean,
			default: false,
		},

		subFormRowIndex: {
			/* 子表单组件行索引，从0开始计数 */
			type: Number,
			default: -1,
		},
		subFormColIndex: {
			/* 子表单组件列索引，从0开始计数 */
			type: Number,
			default: -1,
		},
		subFormRowId: {
			/* 子表单组件行Id，唯一id且不可变 */
			type: String,
			default: "",
		},
	},
	watch: {
		field: {
			deep: true,
			handler(val) {
				//console.log(val, "2000")
			}
		}
	},
	components: {
		StaticContentWrapper,
		CountUp,
	},
	computed: {
		customClass() {
			return this.field.options.customClass || "";
		},
	},
	created() {
		this.registerToRefList();
		this.initEventHandler();
		this.handleOnCreated();
	},
	mounted() {
		if (!!this.field.options.dsEnabled) {
			this.loadDataFromDS({});
		}
		this.$nextTick(() => {
			this.onMounted();
		});
	},
	beforeUnmount() {
		this.unregisterFromRefList();
	},
	methods: {
		onCreated() {
			if (!!this.field.options.onCreated) {
				let customFunc = new Function(this.field.options.onCreated);
				customFunc.call(this);
			}
		},

		onMounted() {
			if (!!this.field.options.onMounted) {
				let customFunc = new Function(this.field.options.onMounted);
				customFunc.call(this);
			}
		},
		// /**
		//  * 获取图表数据
		//  */
		// getStatisticData() {
		// 	return this.field.options.option
		// },
		// /**
		//  * 设置图表数据
		//  * @param statisticData
		//  */
		// setStatisticData(statisticData) {
		// 	this.field.options.option = statisticData
		// },
		/**
		 * 从数据源加载统计数值
		 * @param localDsv 本地数据源变量DSV
		 * @param dsName 数据源名称，不传此值，则使用dsName属性绑定的数据源
		 */
		loadDataFromDS(localDsv = {}, dsName = '') {
			let curDSName = dsName || this.field.options.dsName
			let curDSetName = this.field.options.dataSetName
			let curDS = getDSByName(this.formConfig, curDSName)
			if (!!curDS) {
				let gDsv = this.getGlobalDsv() || {}
				let newDsv = new Object({})
				overwriteObj(newDsv, gDsv)
				overwriteObj(newDsv, localDsv)
				newDsv.fieldName = this.field.options.name
				runDataSourceRequest(curDS, newDsv, this.getFormRef(), false, this.$message).then(res => {
					if (!!curDSetName && res.hasOwnProperty(curDSetName)) {
						this.setStatisticData(res[curDSetName])
					} else {
						this.setStatisticData(res)
					}
				}).catch(err => {
					this.$message.error(err.message)
				})
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.chart {
	height: 300px;
	//height: 100%;
}

.card-panel {
	cursor: pointer;
	font-size: 12px;
	position: relative;
	overflow: hidden;
	color: rgb(212, 197, 197);
	background: #fff;
	box-shadow: 4px 4px 20px rgba(0, 0, 0, .05);
	border-color: rgba(0, 0, 0, .05);
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;

	&:hover {
		.card-panel-icon-wrapper {
			color: #fff !important;
		}

		.icon-color {
			background: var(--hover-color);
		}
	}

	.card-panel-icon-wrapper {
		float: left;
		margin-left: 10px;
		padding: 12px;
		transition: all 0.38s ease-out;
		border-radius: 6px;
	}

	.card-panel-icon {
		float: left;
		font-size: 48px;
	}

	.card-panel-description {
		float: right;
		font-weight: bold;
		margin: 14px;
		margin-left: 0px;
		text-align: center;

		.card-panel-text {
			line-height: 18px;
			color: rgba(0, 0, 0, 0.45);
			font-size: 16px;
			margin-bottom: 12px;
		}

		.card-panel-num {
			font-size: 24px;
		}
	}
}
</style>
