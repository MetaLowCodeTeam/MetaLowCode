<template>
	<div>
		<el-form-item label="选择组件" class="is-required" size="default">
			<el-select
				v-model="localValue.field"
				placeholder="请选择组件"
				filterable
			>
				<el-option-group
					v-for="group in controlList"
					:key="group.label"
					:label="group.label"
				>
					<el-option
						v-for="option in group.options"
						:key="option.value"
						:label="option.label"
						:value="option.value"
					></el-option>
				</el-option-group>
			</el-select>
		</el-form-item>
		<el-form-item label="选择动作" class="is-required" size="default">
			<el-select
				v-model="localValue.type"
				placeholder="请选择动作"
				filterable
			>
				<el-option
					v-for="item in actionOptions"
					:key="item.value"
					:label="item.label"
					:value="item.value"
				/>
			</el-select>
		</el-form-item>
	</div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
const props = defineProps({
	modelValue: {
		type: Object,
		default: () => ({ actionType: '', field: '', type: '' })
	},
	controlList: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(['update:modelValue']);

// 本地副本，避免直接修改 props 引发警告
const localValue = ref({ actionType: '', field: '', type: '' });

// 防止循环同步的标记
let syncingFromParent = false;

// 父 -> 子
watch(
	() => props.modelValue,
	async (v) => {
		syncingFromParent = true;
		localValue.value = Object.assign({ actionType: '', field: '', type: '' }, v || {});
		await nextTick();
		syncingFromParent = false;
	},
	{ immediate: true, deep: true }
);

// 子 -> 父（仅当本地改动且与父值不同才回推）
watch(
	() => localValue.value,
	(v) => {
		if (syncingFromParent) return;
		const a = JSON.stringify(v || {});
		const b = JSON.stringify(props.modelValue || {});
		if (a !== b) {
			emit('update:modelValue', Object.assign({}, v));
		}
	},
	{ deep: true }
);

// 动作类型
const actionOptions = ref([
	{ label: "显示", value: "show" },
	{ label: "隐藏", value: "hide" },
	{ label: "必填", value: "required" },
	{ label: "非必填", value: "notRequired" },
	{ label: "禁用", value: "disabled" },
	{ label: "启用", value: "enabled" },
]);
</script>
