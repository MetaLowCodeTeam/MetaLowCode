<template>
	<div>
		<form-item-wrapper
			:designer="designer"
			:field="field"
			:rules="rules"
			:design-state="designState"
			:parent-widget="parentWidget"
			:parent-list="parentList"
			:index-of-parent-list="indexOfParentList"
			:sub-form-row-index="subFormRowIndex"
			:sub-form-col-index="subFormColIndex"
			:sub-form-row-id="subFormRowId"
		>
			<el-input
				ref="fieldEditor"
				v-model="fieldModel"
				:disabled="field.options.disabled"
				readonly
				:size="field.options.size"
				class="hide-spin-button"
				:type="'text'"
				:placeholder="field.options.placeholder"
				:prefix-icon="field.options.prefixIcon"
				:suffix-icon="field.options.suffixIcon"
			>
				<template #suffix>
					<el-icon
						title="清除"
						v-if="!!fieldModel && !posReadonly"
						class="el-input__icon"
						@click="handleClearEvent"
					>
						<Close />
					</el-icon>
				</template>
				<template #append>
					<el-button
						:disabled="field.options.disabled"
						@click="onAppendButtonClick"
					>
						<el-icon>
							<component :is="field.options.buttonIcon" />
						</el-icon>
					</el-button>
				</template>
			</el-input>
		</form-item-wrapper>
		<el-dialog
			:title="posDialogTitle"
			v-if="showLocationDialogFlag"
			v-model="showLocationDialogFlag"
			:show-close="false"
			class="small-padding-dialog"
			:width="dialogWidth"
			draggable
			:fullscreen="runOnMobile"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			destroy-on-close
			:append-to-body="true"
		>
			<div class="vue-amap-container">
				<el-amap :zoom="zoomLevel" :center="curPos" @init="initMap">
					<el-amap-layer-custom
						v-if="posReadonly"
						:canvas="canvasObj"
						:render="render"
						:always-render="false"
						:visible="true"
					/>
					<el-amap-control-scale></el-amap-control-scale>
					<el-amap-control-tool-bar :position="'RT'"></el-amap-control-tool-bar>
					<el-amap-control-geolocation v-if="!posReadonly"
                                                 :need-address="true"
                                                 @complete="getLocation"></el-amap-control-geolocation>
				</el-amap>
			</div>
			<el-form-item v-if="!posReadonly" label="当前定位" style="margin-top: 12px">
				<el-input v-model="newPosModel" placeholder="请点击地图上的定位按钮" readonly></el-input>
			</el-form-item>
            <el-form-item v-if="!posReadonly" label="地址名称" style="margin-top: 12px">
                <el-input v-model="newPosName" placeholder="定位所在地址，供参考" readonly></el-input>
            </el-form-item>
			<el-form-item v-if="posReadonly" label="已定位" style="margin-top: 12px">
				<el-input v-model="fieldModel" readonly></el-input>
			</el-form-item>
			<template #footer>
				<el-button @click="showLocationDialogFlag=false">关闭</el-button>
				<el-button v-if="!posReadonly" type="primary" @click="saveLocation()">保存定位</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import {ElAmap, ElAmapControlGeolocation} from "@vuemap/vue-amap";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { FormItemWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK;

export default {
	name: "location-widget",
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
			/* 子表单组件行索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormColIndex: {
			/* 子表单组件列索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormRowId: {
			/* 子表单组件行Id，唯一id且不可变 */ type: String,
			default: "",
		},
	},
	components: {
		FormItemWrapper,
		ElAmap,
		ElAmapControlGeolocation,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			displayValue: "",
			rules: [],

			showLocationDialogFlag: false,
			zoomLevel: 18,
			curPos: [],
			newPos: [],
			newPosModel: null,
            newPosName: '',

			mapObj: null,
			canvasObj: null,
			pathObj: null,
		};
	},
	computed: {
		inputType() {
			if (this.field.options.type === "number") {
				return "text"; //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
			}

			return this.field.options.type;
		},

		runOnMobile() {
			return this.getGlobalDsv() && this.getGlobalDsv().runOnMobile;
		},

		dialogWidth() {
			return this.field.options.searchDialogWidth || "50%";
		},

		posReadonly() {
			return this.isReadMode || this.field.options.disabled;
		},

		posDialogTitle() {
			return this.posReadonly ? '查看定位' : '选择定位';
		},

	},
	beforeCreate() {
		/* 这里不能访问方法和属性！！ */
	},

	created() {
		/* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
		   需要在父组件created中初始化！！ */
		this.registerToRefList();
		this.initFieldModel();
		this.initEventHandler();
		this.buildFieldRules();
		this.handleOnCreated();

		this.canvasObj = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.curPos = [121.472692,31.233018];  //默认地图中心点：上海市人民广场地铁站
	},

	mounted() {
		this.handleOnMounted();
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
		onAppendButtonClick() {
			if (this.posReadonly) {
				if (!this.fieldModel) {
					this.$message.warning('没有定位数据！')
					return
				}

				//设置查看模式的回显经纬度
				const posArray = this.fieldModel.split(',')
				if ((posArray.length !== 2) && (posArray.length !== 3)) {
					this.$message.warning('定位数据无效！')
					return
				}
				this.curPos.length = 0
				this.curPos.push( posArray[0] * 1)
				this.curPos.push( posArray[1] * 1)
				this.zoomLevel = 20
			} else {
				this.zoomLevel = 18
			}

			this.newPos.length = 0;
			this.newPosModel = null;
            this.newPosName = '';
			this.showLocationDialogFlag = true;
		},

		handleClearEvent() {
			this.fieldModel = null;
			this.handleChangeEvent(this.fieldModel);
		},

		initMap(mapInstance) {
			this.mapObj = mapInstance;
			const size = mapInstance.getSize();
			this.canvasObj = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			this.canvasObj.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			this.canvasObj.setAttribute('width', size.width);
			this.canvasObj.setAttribute('height', size.height);

			this.pathObj = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			this.pathObj.onclick = function () {
				console.log('svg path clicked')
			};
			const styleText = [];
			styleText.push('stroke:red');
			styleText.push('fill:green');
			styleText.push('fill-opacity:0.3');
			this.pathObj.style.cssText = styleText.join(';');
			this.canvasObj.appendChild(this.pathObj);
		},

		render() {
			const paths = [];
			const centerPixel = this.mapObj.lngLatToContainer(this.curPos);

			for (let k = 0; k < 6; k += 1) {
				const ag = Math.PI * 60 / 180 * k;
				const x = centerPixel.x + Math.cos(ag) * 50;
				const y = centerPixel.y + Math.sin(ag) * 50;
				paths.push(`${(k == 0 ? 'M' : 'L') + x  } ${  y}`);
			}
			const newPath = `${paths.join(' ')  } Z`;
			this.pathObj.setAttribute('d', newPath);
		},

		getLocation(value) {
			if (value && value.position) {
				this.newPos.length = 0
				this.newPos.push(value.position.lng)
				this.newPos.push(value.position.lat)
				this.newPosModel = this.newPos[0] + ',' + this.newPos[1]
                this.newPosName = value.formattedAddress || ''
			}
		},

		saveLocation() {
			if (!this.newPos || (this.newPos.length <= 0)) {
				this.$message.warning('无法获取到当前位置，请点击地图右下角的定位按钮！')
				return
			}

			this.fieldModel = this.newPos[0] + ',' + this.newPos[1] + ',' + this.newPosName
			this.handleChangeEvent(this.fieldModel)
			this.showLocationDialogFlag = false;
		},
	},
};
</script>

<style lang="scss" scoped>
.vue-amap-container {
	height: 380px;
}

</style>

<style lang="scss">
.small-padding-dialog .el-dialog__body {
	padding: 0 10px 10px 10px !important;
}

.readonly-mode-field {
	cursor: pointer;

	.small-circle-button {
		height: 16px !important;
		width: 16px !important;
	}
}
</style>
