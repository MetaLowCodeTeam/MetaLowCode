<template>
	<!-- 不开启允许用户自选时可配置 -->
	<div v-if="!optionModel.positionSelectable">
		<el-form-item :label="i18nt('extension.setting.9000')">
			<el-switch
				@change="onAllowFineTuningChange"
				v-model="tdtConfig.allowFineTuning"
				:active-value="true"
				:inactive-value="false"
			/>
		</el-form-item>
		<el-form-item
			:label="i18nt('extension.setting.9001')"
			v-if="tdtConfig.allowFineTuning"
		>
			<el-select
				@change="onFineTuningRangeChange"
				v-model="tdtConfig.fineTuningRange"
			>
				<el-option
					v-for="item in fineTuningRangeOptions"
					:key="item"
					:label="item + i18nt('extension.setting.9001-1')"
					:value="item"
				/>
			</el-select>
		</el-form-item>
		<el-form-item :label="i18nt('extension.setting.9002')">
			<el-switch
				@change="onSetLocationAreaChange"
				v-model="tdtConfig.setLocationArea"
				:active-value="true"
				:inactive-value="false"
			/>
		</el-form-item>
		<template v-if="tdtConfig.setLocationArea">
			<div
				v-for="(item, index) in tdtConfig.locationArea"
				:key="index"
				class="items-center"
			>
				<div class="flex-1">{{ item.address }}</div>
				<div class="ml-icon-group">
					<el-icon
						class="ml-icon mr-5"
						size="16"
						@click="editLocationArea(index)"
					>
						<Edit />
					</el-icon>
					<el-icon
						class="ml-icon"
						size="16"
						@click="deleteLocationArea(index)"
					>
						<Delete />
					</el-icon>
				</div>
			</div>
			<div class="mb-10">
				<el-button
					class="w-100 mb-5"
					@click="setLocationArea"
					size="small"
				>
					{{ i18nt("extension.setting.9002-1") }}
				</el-button>
			</div>
		</template>
	</div>
	<ml-dialog
		:title="i18nt('extension.setting.9002-1')"
		v-model="locationConfig.isShow"
		width="700px"
		append-to-body
		scrollbarHeight="591px"
		top="10vh"
	>
		<div class="ml-tdt-container">
			<MlTdtMap
				:center="locationConfig.center"
				showCityCascader
				@tdtHandleChange="tdtHandleChange"
                :locationArea="[{
                    range: locationConfig.data.range * 1,
                    lnglat: locationConfig.data.lonlat
                }]"
			/>
		</div>
		<el-form-item
			:label="i18nt('extension.setting.9003')"
			class="mb-10 mt-10 ml-form-label is-required"
		>
			<el-input
				size="default"
				v-model="locationConfig.data.address"
				:placeholder="i18nt('extension.setting.9003-1')"
                readonly
			/>
		</el-form-item>
		<el-form-item
			:label="i18nt('extension.setting.9004')"
			class="mb-5 ml-form-label is-required"
		>
			<el-input-number
				size="default"
				v-model="locationConfig.data.range"
				:placeholder="i18nt('extension.setting.9004-1')"
                controls-position="right"
			>
			</el-input-number>
			<div class="info-text ml-10">
				{{ i18nt("extension.setting.9005") }}
			</div>
		</el-form-item>
		<template #footer>
			<el-button size="default" @click="locationConfig.isShow = false">
				{{ i18nt("extension.setting.2003") }}
			</el-button>
			<el-button
				type="primary"
				@click="confirmLocationArea"
				size="default"
			>
				{{ i18nt("extension.setting.2002") }}
			</el-button>
		</template>
	</ml-dialog>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin } = VisualDesign.VFormSDK;
import MlTdtMap from "@/components/mlTdt/index.vue";
import { getGuid } from "@/utils/util";
export default {
	name: "tdt-tdtConfig-editor",
	mixins: [i18n, eventMixin],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	components: {
		MlTdtMap,
	},
	data() {
		return {
			tdtConfig: {
				allowFineTuning: false,
				fineTuningRange: 100,
				setLocationArea: false,
				locationArea: [],
			},
			fineTuningRangeOptions: [100, 500, 1000, 1500, 5000],
			locationConfig: {
				isShow: false,
				data: {
					address: "",
					range: "",
				},
				center: [121.47057, 31.23469], //默认地图中心点：上海市人民广场地铁站
			},
		};
	},
	watch: {
		optionModel: {
			handler(newVal) {
				this.initTdtConfig(newVal.tdtConfig);
			},
			deep: true,
		},
	},
	mounted() {
		this.initTdtConfig(this.optionModel.tdtConfig);
	},
	methods: {
		initTdtConfig(newConfig) {
			this.tdtConfig = Object.assign({}, this.tdtConfig, newConfig);
		},
		// 允许微调切换事件
		onAllowFineTuningChange(value) {
			this.optionModel.tdtConfig.allowFineTuning = value;
            if(value) {
                this.optionModel.tdtConfig.setLocationArea = false;
            }
		},
		// 微调范围切换事件
		onFineTuningRangeChange(value) {
			this.optionModel.tdtConfig.fineTuningRange = value;
		},
		// 设置定位中心切换事件
		onSetLocationAreaChange(value) {
			this.optionModel.tdtConfig.setLocationArea = value;
            if(value) {
                this.optionModel.tdtConfig.allowFineTuning = false;
            }
		},
		// 添加定位中心点击事件
		setLocationArea() {
			this.locationConfig.isShow = true;
			this.locationConfig.data = {
				address: "",
				range: "",
				guid: "",
			};
			this.locationConfig.center = [121.47057, 31.23469]; //默认地图中心点：上海市人民广场地铁站;
		},
		// 确认定位中心点击事件
		confirmLocationArea() {
			let { address, range, guid } = this.locationConfig.data;
			if (!address || !range) {
				this.$message.error(this.i18nt("extension.setting.9005-1"));
				return;
			}
			if (!guid) {
				this.locationConfig.data.guid = getGuid();
				this.optionModel.tdtConfig.locationArea.push(
					this.locationConfig.data
				);
			} else {
				let index = this.optionModel.tdtConfig.locationArea.findIndex(
					(item) => item.guid === guid
				);
				if (index !== -1) {
					this.optionModel.tdtConfig.locationArea[index] =
						this.locationConfig.data;
				}
			}

			this.locationConfig.isShow = false;
		},
		// 删除定位中心点击事件
		deleteLocationArea(index) {
			this.$confirm(
				this.i18nt("extension.setting.9006"),
				this.i18nt("extension.setting.9006-1"),
				{
					confirmButtonText: this.i18nt("extension.setting.2002"),
					cancelButtonText: this.i18nt("extension.setting.2003"),
					type: "warning",
				}
			)
				.then(() => {
					this.optionModel.tdtConfig.locationArea.splice(index, 1);
				})
				.catch(() => {});
		},
		// 编辑定位中心点击事件
		editLocationArea(index) {
			this.locationConfig.data = Object.assign(
				{},
				this.optionModel.tdtConfig.locationArea[index]
			);
			this.locationConfig.center = this.locationConfig.data.lonlat;
			this.locationConfig.isShow = true;
		},
		// 天地图地图切换事件
		tdtHandleChange({ formatted_address, lonlat }) {
			this.locationConfig.data.address = formatted_address;
			this.locationConfig.data.lonlat = lonlat;
		},
	},
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
.ml-tdt-container {
	// width: 100%;
}
.ml-form-label {
	:deep(.el-form-item__label) {
		font-size: 14px !important;
		height: 32px !important;
		line-height: 32px !important;
		width: 80px !important;
	}
}
.info-text {
	font-size: 14px;
}
.items-center {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	padding: 5px 10px;
	border: 1px solid #e4e7ed;
	border-radius: 4px;
	margin-bottom: 5px;
	.flex-1 {
		width: calc(100% - 45px);
		margin-right: 5px;
	}
	.ml-icon-group {
		.ml-icon {
			position: relative;
			top: 3px;
			&:hover {
				color: var(--el-color-primary-dark-2);
				cursor: pointer;
			}
		}
	}
}
</style>
