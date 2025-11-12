<template>
	<el-collapse v-model="activeNames">
        <!-- 明细设置 -->
        <el-collapse-item name="2">
            <template #title>
                <h3>明细设置</h3>
            </template>
            <div>
                <el-select
                    v-model="myFormData.processDetail"
                    placeholder="请选择明细"
                    style="width: 100%;"
                    @change="processDetailChange"
                >
                    <el-option
                        v-for="item in processDetail"
                        :key="item.processDetailId"
                        :label="item.processname"
                        :value="item.processDetailId"
                        :disabled="selectProcessDetail.includes(item.processDetailId)"
                    />
                </el-select>
            </div>
        </el-collapse-item>
		<!-- 节点设置 -->
		<el-collapse-item name="1">
			<template #title>
				<h3>节点设置</h3>
			</template>
			<el-row :gutter="20">
				<el-col
					:span="item.span || 24"
					v-for="item in formConfig"
					:key="item.key"
				>
					<el-form-item
						:label="item.label"
						:label-width="formLabelWidth"
					>
						<el-input-number
							v-if="item.type == 'input-number'"
							v-model="
								myFormData.properties[item.parentKey][item.key]
							"
							:placeholder="item.placeholder"
							controls-position="right"
							class="w-100"
							:step="item.props.step"
							:min="item.props.min || 0"
							:max="item.props.max || 99999"
						/>
						<el-color-picker
							v-if="item.type == 'color-picker'"
							v-model="
								myFormData.properties[item.parentKey][item.key]
							"
							:placeholder="item.placeholder"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-collapse-item>
	</el-collapse>
</template>

<script setup>
import { ref, watchEffect, watch } from "vue";

const emits = defineEmits(["setNodeData", "changeProcessDetail"]);

const props = defineProps({
	formData: {
		type: Object,
		default: () => {},
	},
    processDetail: {
        type: Array,
        default: () => [],
    },
    selectProcessDetail: {
        type: Array,
        default: () => [],
    },
});

let formConfig = ref([
	{
		label: "节点宽度",
		placeholder: "请输入节点宽度",
		parentKey: "rectNodeSize",
		key: "width",
		type: "input-number",
		props: {
			step: 10,
		},
	},
	{
		label: "节点高度",
		placeholder: "请输入节点高度",
		parentKey: "rectNodeSize",
		key: "height",
		type: "input-number",
		props: {
			step: 10,
		},
	},
	{
		label: "节点圆角",
		placeholder: "请输入圆角",
		parentKey: "rectNodeSize",
		key: "radius",
		type: "input-number",
		props: {
			step: 1,
		},
	},
	{
		label: "边框粗细",
		parentKey: "rectNodeNodeStyle",
		key: "stroke-width",
		type: "input-number",
		props: {
			step: 1,
		},
	},
	{
		label: "背景色",
		parentKey: "rectNodeNodeStyle",
		key: "fill",
		type: "color-picker",
		span: 8,
	},
	{
		label: "边框色",
		parentKey: "rectNodeNodeStyle",
		key: "stroke",
		type: "color-picker",
		span: 8,
	},
	{
		label: "字体颜色",
		parentKey: "rectNodeTextStyle",
		key: "color",
		type: "color-picker",
		span: 8,
	},
	{
		label: "字体大小",
		parentKey: "rectNodeTextStyle",
		key: "fontSize",
		type: "input-number",
		props: {
			step: 1,
		},
		span: 12,
	},
	{
		label: "字体粗细",
		parentKey: "rectNodeTextStyle",
		key: "fontWeight",
		type: "input-number",
		props: {
			step: 100,
			min: 400,
			max: 700,
		},
		span: 12,
	},
]);

let activeNames = ref(["1", "2"]);
let formLabelWidth = ref("65px");

let defaultFormData = ref({
	properties: {
		rectNodeSize: {
			// 节点宽度
			width: 200,
			// 节点高度
			height: 80,
			// 节点圆角
			radius: 0,
		},
		rectNodeNodeStyle: {
			// 背景色
			fill: "#fff",
			// 边框色
			stroke: "#303030",
			// 边框宽度
			"stroke-width": 2,
		},
		rectNodeTextStyle: {
			// 字体颜色
			color: "#000",
			// 字体大小
			fontSize: 12,
			// 字体粗细
			fontWeight: 400,
		},
	},
});

const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
};

let myFormData = ref(cloneDeep(defaultFormData.value));

watch(
	() => myFormData.value,
	() => {
		emits("setNodeData", myFormData.value);
	},
	{ deep: true }
);

watchEffect(() => {
	myFormData.value = Object.assign(cloneDeep(defaultFormData.value), props.formData);
});

const processDetailChange = (value) => {
    // console.log(value);
    let findProcessDetail = props.processDetail.find(item => item.processDetailId == value);
    emits("changeProcessDetail", findProcessDetail);
};




</script>
<style lang="scss" scoped>
:deep(.el-form-item) {
	margin-bottom: 10px;
}
</style>
