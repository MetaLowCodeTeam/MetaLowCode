<template>
    <el-form-item label="所在城市" class="mb-10" v-if="showCityCascader">
        <el-cascader
            ref="CityCascaderRef"
            v-model="curAreaCode"
            :options="CityCodes"
            :props="{emitPath: false}"
            @change="handleCityChange"
            style="width: 360px"
            size="default"
        />
    </el-form-item>
	<tdt-map
		:center="curPos"
		:zoom="zoom"
		@click="tdtOnClick"
		@init="tdtMapInit"
        :style="`height: ${mapHeight}px;`"
	>
		<tdt-marker
			:position="curPos"
			:draggable="false"
			icon="https://soullyoko.github.io/vue-tianditu/marker_red.png"
		></tdt-marker>
        
        <tdt-circle
			v-if="enableFineTuning"
			:center="fineTuningRange.lnglat"
			:radius="fineTuningRange.range"
			:style="{
				color: '#409EFF',
				weight: 2,
				opacity: 0.5,
				fillColor: '#409EFF',
				fillOpacity: 0.1
			}"
		></tdt-circle>
        <tdt-circle
            v-for="(item,inx) in locationArea"
            :key="inx"
            :center="item.lnglat"
            :radius="item.range"
            :style="{
                color: '#409EFF',
                weight: 2,
                opacity: 0.5,
                fillColor: '#409EFF',
                fillOpacity: 0.1
            }"
        >
        </tdt-circle>
		<tdt-infowindow
			v-model:target="tdtConfig.target"
			:content="tdtConfig.content"
		></tdt-infowindow>
		<!-- 自定义搜索周边 -->
		<tdt-control position="topleft" v-if="showSearchAround">
			<el-select
				v-model="tdtHotPointID"
				filterable
				remote
				reserve-keyword
				placeholder="输入地点关键词"
				:remote-method="tdtSearchAddress"
				:loading="tdtSearchLoading"
				clearable
				style="width: 380px; margin-bottom: 5px"
				@change="tdtSearchHandleChange"
                size="default"
			>
				<el-option
					v-for="(item, index) in tdtAddressOptions"
					:key="item.hotPointID"
					:label="item.name"
					:value="item.lonlat + ',' + index"
				>
					<span>{{ item.name }}</span>
					<span
						style="
							font-size: 12px;
							color: #a8abb2;
							margin-left: 10px;
						"
					>
						{{ item.address }}
					</span>
				</el-option>
				<template #loading>
					<svg class="circular" viewBox="0 0 50 50">
						<circle
							class="path"
							cx="25"
							cy="25"
							r="20"
							fill="none"
						/>
					</svg>
				</template>
			</el-select>
		</tdt-control>
		<!-- 自定义返回当前位置控件 or 定位 -->
		<tdt-control position="bottomright">
			<div class="controlStyle" @click.stop="controlClick">
				<img
					style="width: 80%; height: 80%"
					src="@/assets/imgs/myAddress.png"
					alt=""
				/>
			</div>
		</tdt-control>
	</tdt-map>
</template>

<script setup>
import { ref, watch } from "vue";
import { TdtMap } from "vue-tianditu";
import { ElMessage } from "element-plus";
import CityCodes from "@/views/system/form-design/extension/field-widgets/cityCodes";
const props = defineProps({
	center: {
		type: Array,
		default: () => [],
	},
	zoom: {
		type: Number,
		default: 15,
	},
    mapHeight: {
        type: Number,
        default: 400,
    },
	tdtConfig: {
		type: Object,
		default: () => {
            return {
                target: null,
                content: null,
                tk: "3a0c8bd4b5ff37c83b3617d51cb14803",
            }
        },
	},
    // 是否显示选择城市级联选择器
    showCityCascader: {
        type: Boolean,
        default: false,
    },
    // 是否显示搜索周边
    showSearchAround: {
        type: Boolean,
        default: false,
    },
    // 是否开启微调
    enableFineTuning: {
        type: Boolean,
        default: false,
    },
    // 微调范围
    fineTuningRange: {
        type: Object,
        default: () => ({
            // 微调范围
            range: 100,
            // 定位中心
            lnglat: []
        }),
    },
    // 定位区域
    locationArea: {
        type: Array,
        default: () => [],
    },
    // 是否禁用天地图位置改变事件
    disabledTdtChange: {
        type: Boolean,
        default: false,
    },
});

const emits = defineEmits([
    "controlClick", 
    "tdtOnClick", 
    "tdtHandleChange", 
    "tdtMapInit", 
    "handleCityChange"
]);

const tdtMapInit = (map) => {
	emits("tdtMapInit", map);
};

// 当前位置
const curPos = ref([]);

watch(() => props.center, (newVal, oldVal) => {
    if(newVal && (newVal.length > 0)) {
        curPos.value = newVal;
    }
}, { immediate: true, deep: true })

let curLocationArea = ref([]);
watch(() => props.locationArea, (newVal, oldVal) => {
    if(newVal && (newVal.length > 0)) {
        curLocationArea.value = newVal;
    }
}, { immediate: true, deep: true })



// 天地图自定义搜索周边选择框选中值
const tdtHotPointID = ref("");
// 天地图自定义搜索周边选择框选项
const tdtAddressOptions = ref([]);
// 天地图自定义搜索周边选择框加载状态
const tdtSearchLoading = ref(false);
// 当前选中的城市编码
const curAreaCode = ref("");



// 点击地图
const tdtOnClick = (e) => {
    getTiandituAddress(e.lnglat.lng, e.lnglat.lat);
};
// 点击定位中心控件
const controlClick = () => {
	emits("controlClick");
};

// 天地图自定义搜索周边选择框远程搜索方法
const tdtSearchAddress = async (queryString) => {
	if (!queryString) return;
	try {
		const params = {
			postStr: JSON.stringify({
				keyWord: queryString,
				level: "12", // 搜索等级
				queryRadius: "10000",
				pointLonlat: curPos.value[0] + "," + curPos.value[1],
				queryType: "3", // 查询类型 1:普通搜索3:周边搜索服务
				start: 0, // 起始记录
				count: 50, // 每页数量
			}),
			tk: props.tdtConfig.tk,
			type: "query",
		};
		tdtSearchLoading.value = true;
		const response = await fetch(
			`http://api.tianditu.gov.cn/v2/search?postStr=${encodeURIComponent(
				params.postStr
			)}&tk=${props.tdtConfig.tk}&type=${params.type}`
		);
		const data = await response.json();
		if (data && data.pois) {
			tdtAddressOptions.value = data.pois;
		}
	} catch (error) {
	} finally {
		tdtSearchLoading.value = false;
	}
};

// 天地图自定义搜索周边选择框切换事件
const tdtSearchHandleChange = async (val) => {
    if(!val) return;
    const lonlat = val.split(',')[0] + ',' + val.split(',')[1];
    getTiandituAddress(lonlat.split(',')[0], lonlat.split(',')[1]);
};

let CityCascaderRef = ref(null);
// 城市级联选择器切换事件
const handleCityChange = () => {
    const checkNodes = CityCascaderRef.value.getCheckedNodes(true)
    if(checkNodes && (checkNodes.length > 0)) {
        const areaLabel = checkNodes[0].label;
        locateCity(areaLabel);
    }
};
const locateCity = async (areaLabel) => {
    try {
        const response = await fetch(`http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${areaLabel}"}&tk=${props.tdtConfig.tk}`);
        const result = await response.json();
        if(result?.status == '0') {
            curPos.value = [result?.location?.lon, result?.location?.lat];
            tdtAddressOptions.value = [];
            emits("handleCityChange", [result?.location?.lon, result?.location?.lat]);
        }
    } catch (error) {
        console.error('定位城市失败:', error);
        ElMessage.error('定位城市失败，请重试');
        emits("handleCityChange", []);
    }
}

// 逆向地址，通过坐标获取实际地址
const getTiandituAddress = async (lng, lat) => {
    if(props.disabledTdtChange) return;
    const response = await fetch(`https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lng},'lat':${lat},'ver':1}&tk=${props.tdtConfig.tk}`);
    const data = await response.json();
    if(!data?.result?.formatted_address) {
        ElMessage.error("获取地址失败，当前定位：" + data?.result?.addressComponent?.nation + "，如果开启了Vpn请关闭后重试");
        return;
    }
    curPos.value = [lng, lat];
    emits("tdtHandleChange", {
        formatted_address: data?.result?.formatted_address || '',
        lonlat: [lng, lat],
        areaCode: curAreaCode.value || '',
    });
}
</script>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
    font-size: 14px !important;
    height: 32px !important;
    line-height: 32px !important;
    width: 80px !important;
}
.controlStyle {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 10px;
    margin: 0;
    cursor: pointer;
}
</style>
