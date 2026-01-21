<template>
	<div class="full-width">
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
				v-model="formatFieldModel"
				v-show="!isReadMode"
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
			<template v-if="isReadMode">
				<span class="readonly-mode-field">
					{{formatFieldModel}}
					<el-button link @click="onAppendButtonClick">
						<el-icon>
							<component :is="field.options.buttonIcon" />
						</el-icon>
					</el-button>
				</span>
			</template>
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
                <MlTdtMap 
                    :center="curPos"
                    :zoom="zoomLevel"
                    :tdtConfig="tdtConfig"
                    :disabledTdtChange="field.options?.tdtConfig?.setLocationArea"
                    @tdtMapInit="tdtMapInit"
                    @tdtHandleChange="tdtHandleChange"
                    @controlClick="controlClick"
                    :enableFineTuning="field.options?.tdtConfig?.allowFineTuning"
                    :fineTuningRange="{
                        range: field.options?.tdtConfig?.fineTuningRange,
                        lnglat: selfLocationPos
                    }"
                    :locationArea="field.options?.tdtConfig?.setLocationArea ? field.options?.tdtConfig.locationArea.map(el => {
                        return {
                            range: el.range * 1,
                            lnglat: el.lonlat
                        }
                    }): [] "
                />
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

		<el-dialog
			:title="posDialogTitle"
			v-if="showLocationPickDialogFlag"
			v-model="showLocationPickDialogFlag"
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
				<MlTdtMap 
                    :showCityCascader="!posReadonly"
                    :showSearchAround="!posReadonly"
                    :center="curPos"
                    :zoom="zoomLevel"
                    :tdtConfig="tdtConfig"
                    :disabledTdtChange="field.options?.tdtConfig?.setLocationArea"
                    @tdtMapInit="tdtMapInit"
                    @tdtHandleChange="tdtHandleChange"
                    @controlClick="controlClick"
                    :enableFineTuning="field.options?.tdtConfig?.allowFineTuning"
                    :fineTuningRange="{
                        range: field.options?.tdtConfig?.fineTuningRange,
                        lnglat: selfLocationPos
                    }"
                     :locationArea="field.options?.tdtConfig?.setLocationArea ? field.options?.tdtConfig.locationArea.map(el => {
                        return {
                            range: el.range * 1,
                            lnglat: el.lonlat
                        }
                    }): [] "
                />
			</div>
			<el-form-item v-if="!posReadonly" label="已选位置" style="margin-top: 12px">
				<el-input v-model="newPosModel" placeholder="请点击地图上的定位按钮" readonly></el-input>
			</el-form-item>
			<el-form-item v-if="!posReadonly" label="位置名称" style="margin-top: 12px">
				<el-input v-model="newPosName" placeholder="定位所在地址，供参考" readonly></el-input>
			</el-form-item>
			<el-form-item v-if="posReadonly" label="已定位" style="margin-top: 12px">
				<el-input v-model="fieldModel" readonly></el-input>
			</el-form-item>
			<template #footer>
				<el-button @click="showLocationPickDialogFlag=false">关闭</el-button>
				<el-button v-if="!posReadonly" type="primary" @click="saveSelectedPosition()">保存位置</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import {ElAmap, ElAmapControlGeolocation, ElAmapSearchBox} from "@vuemap/vue-amap";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import CityCodes from "@/views/system/form-design/extension/field-widgets/cityCodes";
import {deepClone} from "@/utils/util";
import MlTdtMap from "@/components/mlTdt/index.vue";
const { FormItemWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK;

export default {
	name: "tianditu-location-widget",
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
		ElAmapSearchBox,
        MlTdtMap,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			displayValue: "",
			rules: [],

			showLocationDialogFlag: false,
			zoomLevel: 14,
			curPos: [],
			newPos: [],
			newPosModel: null,
            newPosName: '',

			mapObj: null,
			canvasObj: null,
			pathObj: null,

			showLocationPickDialogFlag: false,
			curAreaCode: null,  //curAreaCode: '310100',
			cityCodes: CityCodes,
			cityCode: '全国',  //cityCode: '310100',
			searchBoxVisible: true,
            // 天地图配置
            tdtConfig: {
                target: null,
                content: '',
                tk: "3a0c8bd4b5ff37c83b3617d51cb14803",
            },
            // 天地图搜索加载中
            tdtSearchLoading: false,
            // 天地图自定义搜索周边选择框选中值
            tdtHotPointID: null,
            // 天地图自定义搜索周边选择框选项
            tdtAddressOptions: [],
            // 自己定位坐标
            selfLocationPos: [],
		};
	},
	computed: {
		inputType() {
			if (this.field.options.type === "number") {
				return "text"; //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
			}

			return this.field.options.type;
		},
        formatFieldModel(){
            return this.fieldModel ? this.fieldModel.split(',')[2] : null;
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
			return this.posReadonly ? '查看位置' : '选择位置';
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
		this.curPos = [121.47057, 31.23469];  //默认地图中心点：上海市人民广场地铁站
	},

	mounted() {
		this.handleOnMounted();
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
        // 天地图初始化
        tdtMapInit(map){
            this.mapObj = map;
        },
        // 逆向地址，通过坐标获取实际地址
        async getTiandituAddress(lng, lat, cb){
            const response = await fetch(`https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lng},'lat':${lat},'ver':1}&tk=${this.tdtConfig.tk}`);
            const data = await response.json();
            if(!data?.result?.formatted_address) {
                this.$message.error("获取地址失败，当前定位：" + data?.result?.addressComponent?.nation + "，如果开启了Vpn请关闭后重试");
                return;
            }
            this.newPosName = data?.result?.formatted_address || '';
            this.newPosModel = this.curPos[0] + ',' + this.curPos[1] + ',' + this.newPosName;
            if(cb) {
                cb();
            }
        },
        // 获取当前位置信息
        async getLocation () {
            if(this.posReadonly) {
                return;
            }
            if (!navigator.geolocation) {
                this.$message.error('浏览器不支持地理位置服务');
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // state.center = [position.coords.longitude, position.coords.latitude];
                    this.selfLocationPos = [position.coords.longitude, position.coords.latitude];
                    this.getTiandituAddress(position.coords.longitude, position.coords.latitude);
                },
                (err) => {
                    this.$message.error("请开启浏览器/电脑位置服务！");
                }
            );
        },
        // 定位点击
        controlClick() {
            if(this.posReadonly) {
                let posArray = this.fieldModel.split(',');
                this.curPos = [posArray[0], posArray[1]];
                return;
            }
            if (!navigator.geolocation) {
                this.$message.error("浏览器不支持地理位置服务");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.selfLocationPos = [position.coords.longitude, position.coords.latitude];
                    this.getTiandituAddress(position.coords.longitude, position.coords.latitude, () => {
                        this.curPos = [position.coords.longitude, position.coords.latitude];
                    });
                },
                (err) => {
                    console.log(err,'err');
                    this.$message.error("请开启浏览器/电脑位置服务！");
                }
            )
        },
        
        // 天地图地图切换事件
        tdtHandleChange({formatted_address, lonlat}){
            // if(!val) return;
            // const arr = val.split(",");
            this.curPos = lonlat;
            this.getTiandituAddress(lonlat[0], lonlat[1]);
        },

		async onAppendButtonClick() {
			if (this.field.options.positionSelectable) {
				this.showLocationPickDialogFlag = this.initPositionDialog()
				return;
			}
            await this.getLocation();
            if(this.selfLocationPos.length == 0) {
                this.selfLocationPos = [121.47057, 31.23469];
                this.$message.error("获取位置失败，请点击定位图标手动获取！");
            }
			this.showLocationDialogFlag = this.initLocationDialog();
            this.getTiandituAddress(this.curPos[0], this.curPos[1]);
		},

		initPositionDialog() {
			if (this.posReadonly) {
				if (!this.fieldModel) {
					this.$message.warning('没有地图位置数据！')
					return false
				}

				//设置查看模式的回显经纬度
				const posArray = this.fieldModel.split(',')
				if ((posArray.length !== 2) && (posArray.length !== 3)) {
					this.$message.warning('地图位置数据无效！')
					return false
				}

				this.curPos.length = 0
				this.curPos.push( posArray[0] * 1)
				this.curPos.push( posArray[1] * 1)
			} else {
				if (this.fieldModel) {
					const posArray = this.fieldModel.split(',')
					this.curPos.length = 0
					this.curPos.push( posArray[0] * 1)
					this.curPos.push( posArray[1] * 1)

					this.newPos.length = 0
					this.newPos.push( posArray[0] * 1)
					this.newPos.push( posArray[1] * 1)
					this.newPosModel = deepClone(this.fieldModel)
					this.newPosName = posArray[2]
				} 
			}

			return true;
		},

		initLocationDialog() {
			if (this.posReadonly) {
				if (!this.fieldModel) {
					this.$message.warning('没有地图位置数据！')
					return false
				}

				//设置查看模式的回显经纬度
				const posArray = this.fieldModel.split(',')
				if ((posArray.length !== 2) && (posArray.length !== 3)) {
					this.$message.warning('地图位置数据无效！')
					return false
				}
				this.curPos.length = 0
				this.curPos.push( posArray[0] * 1)
				this.curPos.push( posArray[1] * 1)
			} else {
                if(this.fieldModel) {
                    const posArray = this.fieldModel.split(',')
                    this.curPos = [posArray[0], posArray[1]];
                    this.newPosName = posArray[2];
                }
			}
			return true;
		},
		handleClearEvent() {
			this.fieldModel = null;
			this.onFieldChangeEvent(this.fieldModel);
		},

		/**
		 * 计算两个经纬度坐标之间的距离（单位：米）
		 * 使用 Haversine 公式
		 */
		calculateDistance(lon1, lat1, lon2, lat2) {
			const R = 6371000; // 地球半径（米）
			const dLat = this.deg2rad(lat2 - lat1);
			const dLon = this.deg2rad(lon2 - lon1);
			const a = 
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return R * c;
		},

		/**
		 * 将角度转换为弧度
		 */
		deg2rad(deg) {
			return deg * (Math.PI / 180);
		},

		/**
		 * 校验当前位置是否在允许的范围内
		 */
		validateLocationRange() {
			let remoteConfig = this.field?.options?.tdtConfig || {};
			let locationArea = remoteConfig.locationArea || [];

			if (locationArea.length === 0) {
				return true; // 没有设置范围限制，允许
			}

			for (let item of locationArea) {
				let range = item.range; // 允许的范围（米）
				let lonlat = item.lonlat; // 中心点 [经度, 纬度]

				if (!lonlat || lonlat.length < 2 || !range) {
					continue;
				}

				// 计算当前位置到中心点的距离
				let distance = this.calculateDistance(
					this.curPos[0], this.curPos[1],
					lonlat[0], lonlat[1]
				);

				if (distance <= range) {
					return true; // 在范围内
				}
			}

			return false; // 超出所有允许的范围
		},

		saveLocation() {
            if (!this.newPosName) {
				this.$message.warning('未指定地图位置')
				return
			}
			// 字段表单配置
			let remoteConfig = this.field?.options?.tdtConfig || {};
             // 是否允许微调
            let allowFineTuning = remoteConfig.allowFineTuning || false;
            // 微调范围
            let fineTuningRange = remoteConfig.fineTuningRange || 0;
            // 是否设置定位区域
            let setLocationArea = remoteConfig.setLocationArea || false;
			// 已设置的定位区域
			let locationArea = remoteConfig.locationArea || [];

			// 如果开启了定位区域校验，且定位区域设置了定位中心
			if (setLocationArea && locationArea.length > 0) {
				if (!this.validateLocationRange()) {
					this.$message.error('当前位置超出允许的定位范围，请重新选择！');
					return;
				}
			}
            // 如果开启了微调校验，且设置了微调范围
            if(allowFineTuning && fineTuningRange > 0) {
                // 校验微调范围是否超出 当前自身定位坐标
                let distance = this.calculateDistance(
                    this.curPos[0], this.curPos[1],
                    this.selfLocationPos[0], this.selfLocationPos[1]
                );
                if (distance > fineTuningRange) {
                    this.$message.error('微调范围超出允许的范围，请重新选择！');
                    return;
                }
            }
			this.fieldModel = this.curPos[0] + ',' + this.curPos[1] + ',' + this.newPosName
			this.onFieldChangeEvent(this.fieldModel)
			this.showLocationDialogFlag = false;
		},

		saveSelectedPosition() {
			if (!this.newPosName) {
				this.$message.warning('未指定地图位置')
				return
			}

			this.fieldModel = this.curPos[0] + ',' + this.curPos[1] + ',' + this.newPosName
			this.onFieldChangeEvent(this.fieldModel)
			this.showLocationPickDialogFlag = false;
		},

	},
};
</script>

<style lang="scss" scoped>
.vue-amap-container {
	// height: 380px;
    width: 100%;
}

.full-width {
	width: 100%;
}



.small-padding-dialog .el-dialog__body {
	padding: 10px !important;
}

.readonly-mode-field {
	cursor: pointer;

	.small-circle-button {
		height: 16px !important;
		width: 16px !important;
	}
}

.amap-sug-result {
	z-index: 9999;
}


</style>
