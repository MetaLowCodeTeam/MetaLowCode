<template>
	<span class="ml-a-span" @click="setCondition">{{
		getSetConditionText()
	}}</span>
	<ml-dialog
		:title="title || '附加过滤条件'"
		append-to-body
		width="37%"
		v-model="dialogIsShow"
	>
		<mlSetConditions
			v-model="myConditionConf"
			@cancel="dialogIsShow = false"
			:entityName="myEntityName"
		/>
		<template #footer>
			<el-button type="primary" @click="conditionConfirm">确认</el-button>
			<el-button @click="close">取消</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
	conditionConf: { type: Object, default: () => ({}) },
	entityName: { type: String, default: "" },
	title: { type: String, default: "" },
	beforeOpenDialog: { type: Function, default: () => () => {} },
});
const emit = defineEmits(["confirm", "update:modelValue"]);

let dialogIsShow = ref(false);
let myConditionConf = ref({});

let myEntityName = ref("");

const defaultConditionConf = {
	equation: "OR",
	items: [],
};

// 设置条件
const setCondition = () => {
	if (!props.beforeOpenDialog()) return;
	myEntityName.value = props.entityName;
	myConditionConf.value = initFilter(
		Object.assign(
			{},
			defaultConditionConf,
			JSON.parse(JSON.stringify(props.conditionConf))
		)
	);
	dialogIsShow.value = true;
};

// 初始化条件
const initFilter = (filter) => {
	let { equation } = filter;
	if (!equation || equation === "OR") {
		filter.type = 1;
		filter.equation = "OR";
	} else if (equation === "AND") {
		filter.type = 2;
		filter.equation = "AND";
	} else {
		filter.type = 3;
	}
	return filter;
};

// 获取设置条件文案
const getSetConditionText = () => {
    const itemCount = props.conditionConf?.items?.length || 0;
    return itemCount > 0 ? `已设置条件（${itemCount}）` : "点击设置";
};

const conditionConfirm = () => {
	emit("confirm", myConditionConf.value);
	dialogIsShow.value = false;
};

// 关闭弹框
const close = () => {
	dialogIsShow.value = false;
};
</script>

<style></style>
