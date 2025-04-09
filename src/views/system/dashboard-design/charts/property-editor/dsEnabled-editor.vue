<template>
	<el-form-item label="开启数据源">
		<el-switch v-model="optionModel.dsEnabled" />
        <span class="ml-a-span ml-10" @click="showFormat">格式说明</span>
	</el-form-item>
	<el-form-item label="选择数据源" v-if="optionModel.dsEnabled">
		<el-select
			v-model="optionModel.dsName"
			placeholder="请选择数据源"
			@change="onDsChange"
			clearable
		>
			<el-option
				v-for="(item, inx) in dataSources"
				:key="inx"
				:label="item.uniqueName"
				:value="item.uniqueName"
			></el-option>
		</el-select>
	</el-form-item>
	<el-form-item label="选择数据集" v-if="optionModel.dsEnabled">
		<el-select
			v-model="optionModel.dataSetName"
			placeholder="请选择数据集"
			clearable
		>
			<el-option
				v-for="(item, inx) in dataSets"
				:key="inx"
				:label="item.remark"
				:value="item.name"
			></el-option>
		</el-select>
	</el-form-item>
</template>
<script setup>
import { ref, onMounted } from "vue";
defineOptions({
	name: "dsEnabled-editor",
});

const props = defineProps({
	designer: Object,
	selectedWidget: Object,
	optionModel: Object,
});

// 数据源
let dataSources = ref([]);
// 数据集
let dataSets = ref([]);

onMounted(() => {
	dataSources.value = props.designer.formConfig.dataSources;
	getDataSet(props.optionModel.dsName);
});

const onDsChange = (value) => {
    props.optionModel.dataSetName = "";
	getDataSet(value);
};

const getDataSet = (dsName) => {
	if (dsName) {
		let data = dataSources.value.find(
			(item) => item.uniqueName === dsName
		);
		dataSets.value = data.dataSets;
	}
};

const showFormat = () => {
    window.open("https://www.yuque.com/visualdev/melecode/dl1wgakdoy2gge5d?singleDoc# 《17.1 仪表盘各组件返回格式》");
}
</script>
<style lang="scss" scoped></style>
